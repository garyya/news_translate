import { loadEnv } from "./env.mjs";
import { closeDatabase, exec, getDatabasePath } from "../lib/db.js";

loadEnv();

await exec(`
  create table if not exists topics (
    id integer primary key autoincrement,
    slug text not null unique,
    display_headline_zh_tw text,
    display_summary_zh_tw text,
    created_at text not null default (datetime('now')),
    updated_at text not null default (datetime('now'))
  );

  create table if not exists articles (
    id integer primary key autoincrement,
    topic_id integer references topics(id) on delete set null,
    title text not null,
    source text not null,
    url text not null unique,
    published_at text not null,
    source_summary text,
    ai_headline_zh_tw text not null,
    ai_summary_zh_tw text not null,
    category text not null default 'General',
    created_at text not null default (datetime('now'))
  );

  create index if not exists articles_topic_id_idx on articles(topic_id);
  create index if not exists articles_published_at_idx on articles(published_at desc);
  create index if not exists articles_category_idx on articles(category);
  create index if not exists articles_search_idx
    on articles(title, ai_headline_zh_tw, ai_summary_zh_tw, source);
`);

console.log(`SQLite database schema is ready at ${getDatabasePath()}.`);
await closeDatabase();
