import Link from "next/link";
import { Clock, Layers, Search } from "lucide-react";
import { getCategories, getTopics } from "../lib/queries";

export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("zh-Hant-TW", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

function hrefFor(nextParams) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(nextParams)) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default async function Home({ searchParams }) {
  const category = searchParams?.category || "";
  const q = searchParams?.q || "";
  const [topics, categories] = await Promise.all([
    getTopics({ category, search: q }),
    getCategories()
  ]);

  return (
    <main>
      <section className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">每 30 分鐘更新</p>
          <h1>華聞聚合</h1>
          <p>
            從 BBC、CNN、NBC 與 Reuters RSS 擷取新聞，整理成繁體中文標題與約百字摘要。
          </p>
        </div>
        <form className="search-box" action="/">
          <Search size={18} aria-hidden />
          <input
            name="q"
            defaultValue={q}
            placeholder="搜尋主題、來源或關鍵字"
            aria-label="搜尋新聞"
          />
          {category ? <input type="hidden" name="category" value={category} /> : null}
          <button type="submit">搜尋</button>
        </form>
      </section>

      <section className="content-shell">
        <aside className="filters" aria-label="新聞分類">
          <Link className={!category ? "active" : ""} href={hrefFor({ q })}>
            全部
          </Link>
          {categories.map((item) => (
            <Link
              key={item.category}
              className={category === item.category ? "active" : ""}
              href={hrefFor({ category: item.category, q })}
            >
              <span>{item.category}</span>
              <span>{item.count}</span>
            </Link>
          ))}
        </aside>

        <section className="topic-grid" aria-label="新聞主題">
          {topics.length ? topics.map((topic) => (
            <article className="topic-card" key={topic.id}>
              <div className="topic-card-top">
                <div className="source-stack">
                  {topic.sources.slice(0, 4).map((source) => (
                    <span key={source}>{source}</span>
                  ))}
                </div>
                <span className="time">
                  <Clock size={14} aria-hidden />
                  {formatter.format(new Date(topic.latest_at))}
                </span>
              </div>
              <h2>
                <Link href={`/topics/${topic.slug}`}>{topic.headline}</Link>
              </h2>
              <p>{topic.summary}</p>
              <div className="topic-card-bottom">
                <span>
                  <Layers size={15} aria-hidden />
                  {topic.story_count} 則報導
                </span>
                <Link href={`/topics/${topic.slug}`}>查看主題</Link>
              </div>
            </article>
          )) : (
            <div className="empty-state">
              <h2>尚無新聞</h2>
              <p>執行 npm run db:init 後，再執行 npm run fetch 匯入第一批 RSS 摘要。</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
