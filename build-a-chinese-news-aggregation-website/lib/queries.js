import { hasDatabaseUrl, query } from "./db.js";
import { getDemoCategories, getDemoTopic, getDemoTopics } from "./demo-data.js";

export async function getCategories() {
  if (!hasDatabaseUrl()) {
    return getDemoCategories();
  }

  const result = await query(`
    select category, count(*) as count
    from articles
    group by category
    order by count desc, category asc
  `);

  return result.rows;
}

export async function getTopics({ category = "", search = "" } = {}) {
  if (!hasDatabaseUrl()) {
    return getDemoTopics({ category, search });
  }

  const params = [];
  const filters = [];

  if (category) {
    params.push(category);
    filters.push(`a.category = $${params.length}`);
  }

  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    filters.push(`(
      lower(a.ai_headline_zh_tw) like $${params.length}
      or lower(a.ai_summary_zh_tw) like $${params.length}
      or lower(a.source) like $${params.length}
      or lower(a.title) like $${params.length}
    )`);
  }

  const where = filters.length ? `where ${filters.join(" and ")}` : "";
  const result = await query(`
    select
      t.id,
      t.slug,
      coalesce(t.display_headline_zh_tw, max(a.ai_headline_zh_tw)) as headline,
      coalesce(t.display_summary_zh_tw, max(a.ai_summary_zh_tw)) as summary,
      max(a.published_at) as latest_at,
      count(a.id) as story_count,
      group_concat(distinct a.source) as sources,
      group_concat(distinct a.category) as categories
    from topics t
    join articles a on a.topic_id = t.id
    ${where}
    group by t.id
    order by latest_at desc
    limit 60
  `, params);

  return result.rows.map((topic) => ({
    ...topic,
    sources: topic.sources ? topic.sources.split(",").sort() : [],
    categories: topic.categories ? topic.categories.split(",").sort() : []
  }));
}

export async function getTopic(slug) {
  if (!hasDatabaseUrl()) {
    return getDemoTopic(slug);
  }

  const topic = await query(`
    select id, slug, display_headline_zh_tw as headline, display_summary_zh_tw as summary, created_at, updated_at
    from topics
    where slug = $1
  `, [slug]);

  if (!topic.rowCount) {
    return null;
  }

  const articles = await query(`
    select id, source, url, published_at, ai_headline_zh_tw, ai_summary_zh_tw, category
    from articles
    where topic_id = $1
    order by published_at desc
  `, [topic.rows[0].id]);

  return {
    ...topic.rows[0],
    articles: articles.rows
  };
}
