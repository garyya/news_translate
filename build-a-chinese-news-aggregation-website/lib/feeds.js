export const defaultFeeds = [
  {
    source: "BBC",
    category: "World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml"
  },
  {
    source: "CNN",
    category: "World",
    url: "http://rss.cnn.com/rss/edition_world.rss"
  },
  {
    source: "NBC",
    category: "Top Stories",
    url: "https://feeds.nbcnews.com/nbcnews/public/news"
  },
  {
    source: "Reuters",
    category: "World",
    url: "https://openrss.org/www.reuters.com/world/"
  }
];

export function getFeeds() {
  if (!process.env.NEWS_FEEDS_JSON) {
    return defaultFeeds;
  }

  const parsed = JSON.parse(process.env.NEWS_FEEDS_JSON);
  if (!Array.isArray(parsed)) {
    throw new Error("NEWS_FEEDS_JSON must be a JSON array.");
  }

  return parsed.map((feed) => ({
    source: String(feed.source || "Unknown"),
    category: String(feed.category || "General"),
    url: String(feed.url)
  }));
}
