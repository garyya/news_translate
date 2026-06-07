# Chinese News Aggregation Website

Modern Next.js news aggregation app that fetches RSS from BBC, CNN, NBC, and Reuters-style feeds, stores metadata in a local SQLite database file, and displays only AI-generated Traditional Chinese summaries with links to the original sources.

## Quick Start

1. Copy `.env.example` to `.env.local` and add `OPENAI_API_KEY`.
2. Optionally change `SQLITE_DATABASE_PATH`; by default the app uses `data/news.sqlite`.
3. Run `npm run db:init`.
4. Run `npm run fetch` once, or `npm run worker` to fetch every 30 minutes.
5. Run `npm run dev` and open `http://localhost:3000`.

## Important Content Rule

The worker never fetches full article pages. It stores RSS metadata plus short RSS descriptions for AI input, and the frontend renders only AI-generated Traditional Chinese headlines/summaries. Every story links back to the original publisher URL.

## Feeds

Default feeds live in `lib/feeds.js`. You can override them with `NEWS_FEEDS_JSON` without code changes.
