import { randomUUID } from "node:crypto";
import { XMLParser } from "fast-xml-parser";
import { loadEnv } from "./env.mjs";
import { getFeeds } from "../lib/feeds.js";
import { closeDatabase, withClient } from "../lib/db.js";
import { cleanText } from "../lib/text.js";
import { jaccardSimilarity } from "../lib/similarity.js";

loadEnv();

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true
});

const zhSystemPrompt = "\u4f60\u662f\u65b0\u805e\u7de8\u8f2f\u3002\u53ea\u6839\u64da\u63d0\u4f9b\u7684 RSS \u6a19\u984c\u8207\u6458\u8981\u6539\u5beb\uff0c\u4e0d\u52a0\u5165\u672a\u63d0\u4f9b\u7684\u4e8b\u5be6\u3002\u8f38\u51fa\u7e41\u9ad4\u4e2d\u6587 JSON\u3002";
const zhTask = "\u7522\u751f\u4e00\u5247\u7e41\u9ad4\u4e2d\u6587\u65b0\u805e\u6a19\u984c\uff0c\u4ee5\u53ca\u7d04 100 \u500b\u4e2d\u6587\u5b57\u7684\u7e41\u9ad4\u4e2d\u6587\u6458\u8981\u3002";
const zhConstraints = [
  "\u4e0d\u8981\u7ffb\u8b6f\u6216\u4fdd\u5b58\u5168\u6587\u3002",
  "\u4e0d\u8981\u63d0\u53ca\u4f60\u662f AI\u3002",
  "\u6458\u8981\u5fc5\u9808\u4e2d\u7acb\u3001\u7c21\u6f54\uff0c\u53ea\u6839\u64da RSS metadata\u3002"
];

class OpenAIQuotaError extends Error {
  constructor(message) {
    super(message);
    this.name = "OpenAIQuotaError";
  }
}

function asArray(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function pickLink(item) {
  if (typeof item.link === "string") {
    return item.link;
  }

  if (Array.isArray(item.link)) {
    const alternate = item.link.find((link) => link.rel === "alternate") || item.link[0];
    return alternate?.href || alternate?.["#text"] || "";
  }

  return item.link?.href || item.guid?.["#text"] || item.guid || "";
}

function parseDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function fetchFeed(feed) {
  const response = await fetch(feed.url, {
    headers: {
      "User-Agent": "zh-news-brief/1.0 (+local development)"
    }
  });

  if (!response.ok) {
    throw new Error(`${feed.source} returned ${response.status}`);
  }

  const xml = await response.text();
  const parsed = parser.parse(xml);
  if (!parsed.rss && !parsed.feed) {
    throw new Error(`${feed.source} did not return RSS/Atom XML`);
  }

  const items = asArray(parsed.rss?.channel?.item || parsed.feed?.entry);

  return items.slice(0, 20).map((item) => ({
    title: cleanText(item.title?.["#text"] || item.title, 300),
    source: feed.source,
    url: pickLink(item),
    publishedAt: parseDate(item.pubDate || item.published || item.updated || item["dc:date"]),
    sourceSummary: cleanText(item.description || item.summary || item.content?.["#text"] || "", 700),
    category: cleanText(item.category?.["#text"] || item.category || feed.category, 80)
  })).filter((item) => item.title && item.url);
}

async function generateChineseBrief(item) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required to generate Traditional Chinese summaries.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: zhSystemPrompt
        },
        {
          role: "user",
          content: JSON.stringify({
            task: zhTask,
            constraints: zhConstraints,
            source: item.source,
            title: item.title,
            rss_summary: item.sourceSummary
          })
        }
      ]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    if (response.status === 429 && detail.includes("insufficient_quota")) {
      throw new OpenAIQuotaError(
        "OpenAI quota is exhausted. Add billing/credits or use a key with available API quota, then rerun npm run fetch."
      );
    }

    throw new Error(`OpenAI request failed: ${response.status} ${detail.slice(0, 300)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);

  return {
    headline: cleanText(parsed.headline || parsed.title || "", 180),
    summary: cleanText(parsed.summary || "", 520)
  };
}

async function findSimilarTopic(client, item, brief) {
  const result = await client.query(`
    select t.id, a.title, a.source_summary, a.ai_headline_zh_tw, a.ai_summary_zh_tw
    from topics t
    join articles a on a.topic_id = t.id
    where a.published_at > datetime('now', '-4 days')
    order by a.published_at desc
    limit 250
  `);

  let best = { id: null, score: 0 };
  const incoming = `${item.title} ${item.sourceSummary} ${brief.headline} ${brief.summary}`;

  for (const row of result.rows) {
    const existing = `${row.title} ${row.source_summary || ""} ${row.ai_headline_zh_tw} ${row.ai_summary_zh_tw}`;
    const score = jaccardSimilarity(incoming, existing);
    if (score > best.score) {
      best = { id: row.id, score };
    }
  }

  return best.score >= 0.32 ? best.id : null;
}

async function createTopic(client, item, brief) {
  const base = item.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);
  const slug = `${base || "topic"}-${randomUUID().slice(0, 8)}`;

  await client.query(`
    insert into topics (slug, display_headline_zh_tw, display_summary_zh_tw)
    values ($1, $2, $3)
  `, [slug, brief.headline, brief.summary]);

  return client.lastInsertId();
}

async function saveArticle(item) {
  return withClient(async (client) => {
    await client.query("begin");
    try {
      const exists = await client.query("select id from articles where url = $1", [item.url]);
      if (exists.rowCount) {
        await client.query("commit");
        return "skipped";
      }

      const brief = await generateChineseBrief(item);
      const topicId = await findSimilarTopic(client, item, brief) || await createTopic(client, item, brief);

      await client.query(`
        insert into articles (
          topic_id, title, source, url, published_at, source_summary,
          ai_headline_zh_tw, ai_summary_zh_tw, category
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        topicId,
        item.title,
        item.source,
        item.url,
        item.publishedAt.toISOString(),
        item.sourceSummary,
        brief.headline,
        brief.summary,
        item.category || "General"
      ]);

      await client.query("update topics set updated_at = datetime('now') where id = $1", [topicId]);
      await client.query("commit");
      return "inserted";
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}

let inserted = 0;
let skipped = 0;

for (const feed of getFeeds()) {
  try {
    const items = await fetchFeed(feed);
    console.log(`${feed.source}: fetched ${items.length} RSS items`);

    for (const item of items) {
      const status = await saveArticle(item);
      if (status === "inserted") {
        inserted += 1;
      } else {
        skipped += 1;
      }
    }
  } catch (error) {
    if (error instanceof OpenAIQuotaError) {
      console.error(error.message);
      break;
    }

    console.error(`${feed.source}: ${error.message}`);
  }
}

console.log(`Done. Inserted ${inserted}, skipped ${skipped}.`);
await closeDatabase();
