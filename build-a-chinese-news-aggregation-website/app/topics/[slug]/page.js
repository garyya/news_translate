import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { getTopic } from "../../../lib/queries";

export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("zh-Hant-TW", {
  dateStyle: "medium",
  timeStyle: "short"
});

export default async function TopicPage({ params }) {
  const { slug } = await params;
  const topic = await getTopic(slug);

  if (!topic) {
    notFound();
  }

  return (
    <main className="topic-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={17} aria-hidden />
        返回首頁
      </Link>

      <section className="topic-hero">
        <p className="eyebrow">{topic.articles.length} 則相關報導</p>
        <h1>{topic.headline || topic.articles[0]?.ai_headline_zh_tw}</h1>
        <p>{topic.summary || topic.articles[0]?.ai_summary_zh_tw}</p>
      </section>

      <section className="article-list" aria-label="來源報導">
        {topic.articles.map((article) => (
          <article className="article-row" key={article.id}>
            <div>
              <div className="article-meta">
                <span>{article.source}</span>
                <span>{article.category}</span>
                <time>{formatter.format(new Date(article.published_at))}</time>
              </div>
              <h2>{article.ai_headline_zh_tw}</h2>
              <p>{article.ai_summary_zh_tw}</p>
            </div>
            <a href={article.url} target="_blank" rel="noreferrer">
              原文
              <ExternalLink size={16} aria-hidden />
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
