const now = Date.now();

export const demoTopics = [
  {
    id: "demo-global-diplomacy",
    slug: "demo-global-diplomacy",
    headline: "多國領袖密集會談，聚焦安全與經濟風險",
    summary: "多家國際媒體報導，主要國家近期加強外交接觸，討論區域安全、能源價格與供應鏈穩定。各方說法仍有差異，但共同關切集中在降低衝突升級風險、維持貿易流動，以及為可能的經濟波動預作準備。",
    latest_at: new Date(now - 18 * 60 * 1000).toISOString(),
    story_count: 3,
    sources: ["BBC", "CNN", "Reuters"],
    categories: ["World"]
  },
  {
    id: "demo-tech-ai-rules",
    slug: "demo-tech-ai-rules",
    headline: "科技監管升溫，AI 應用透明度成新焦點",
    summary: "近期科技新聞關注人工智慧服務的資料使用、模型安全與平台責任。監管機構與企業都在調整規範，試圖在創新與風險控管之間取得平衡。市場人士認為，透明度要求可能影響產品設計、合規成本與使用者信任。",
    latest_at: new Date(now - 42 * 60 * 1000).toISOString(),
    story_count: 2,
    sources: ["NBC", "Reuters"],
    categories: ["Technology"]
  },
  {
    id: "demo-markets-inflation",
    slug: "demo-markets-inflation",
    headline: "市場觀望通膨數據，投資人評估利率前景",
    summary: "全球市場等待新的通膨與就業數據，以判斷央行下一步政策方向。分析人士指出，若物價壓力降溫，風險資產可能獲得支撐；但若服務價格仍具黏性，市場對降息時程的預期可能再度延後。",
    latest_at: new Date(now - 75 * 60 * 1000).toISOString(),
    story_count: 2,
    sources: ["CNN", "Reuters"],
    categories: ["Business"]
  }
];

export const demoArticles = [
  {
    id: "demo-a1",
    topic_id: "demo-global-diplomacy",
    source: "BBC",
    url: "https://www.bbc.com/news",
    published_at: demoTopics[0].latest_at,
    ai_headline_zh_tw: "外交會談聚焦安全與經濟不確定性",
    ai_summary_zh_tw: "報導指出，多國官員正在就安全局勢與經濟壓力進行密集溝通。會談重點包括避免緊張升級、維持能源與糧食供應穩定，以及尋求更一致的政策協調。",
    category: "World"
  },
  {
    id: "demo-a2",
    topic_id: "demo-global-diplomacy",
    source: "CNN",
    url: "https://www.cnn.com/world",
    published_at: new Date(now - 31 * 60 * 1000).toISOString(),
    ai_headline_zh_tw: "主要國家評估區域風險與供應鏈壓力",
    ai_summary_zh_tw: "CNN 相關報導聚焦政府如何評估區域風險與供應鏈韌性。官員強調，政策回應需要兼顧外交溝通、國內物價與企業營運的不確定性。",
    category: "World"
  },
  {
    id: "demo-a3",
    topic_id: "demo-global-diplomacy",
    source: "Reuters",
    url: "https://www.reuters.com/world/",
    published_at: new Date(now - 53 * 60 * 1000).toISOString(),
    ai_headline_zh_tw: "各方尋求降低衝突外溢風險",
    ai_summary_zh_tw: "Reuters 相關報導指出，外交討論的一項核心目標，是降低政治與安全事件對能源、航運和金融市場造成外溢衝擊的可能性。",
    category: "World"
  },
  {
    id: "demo-a4",
    topic_id: "demo-tech-ai-rules",
    source: "NBC",
    url: "https://www.nbcnews.com/tech",
    published_at: demoTopics[1].latest_at,
    ai_headline_zh_tw: "AI 服務面臨更高透明度要求",
    ai_summary_zh_tw: "NBC 科技報導關注 AI 平台如何說明資料使用、生成內容標示與安全測試。企業表示會持續調整產品流程，以回應使用者與監管機構的期待。",
    category: "Technology"
  },
  {
    id: "demo-a5",
    topic_id: "demo-tech-ai-rules",
    source: "Reuters",
    url: "https://www.reuters.com/technology/",
    published_at: new Date(now - 64 * 60 * 1000).toISOString(),
    ai_headline_zh_tw: "科技公司加速調整 AI 合規策略",
    ai_summary_zh_tw: "Reuters 相關報導指出，AI 規範逐步明確後，科技公司正重新檢視資料治理、模型評估和產品發布流程，避免合規風險影響服務推出。",
    category: "Technology"
  },
  {
    id: "demo-a6",
    topic_id: "demo-markets-inflation",
    source: "CNN",
    url: "https://www.cnn.com/business",
    published_at: demoTopics[2].latest_at,
    ai_headline_zh_tw: "市場等待通膨訊號判斷利率路徑",
    ai_summary_zh_tw: "市場參與者關注即將公布的物價與就業數據。若通膨持續放緩，投資人可能提高對寬鬆政策的期待；若數據偏強，利率維持高檔的時間可能拉長。",
    category: "Business"
  },
  {
    id: "demo-a7",
    topic_id: "demo-markets-inflation",
    source: "Reuters",
    url: "https://www.reuters.com/markets/",
    published_at: new Date(now - 91 * 60 * 1000).toISOString(),
    ai_headline_zh_tw: "投資人重新評估央行政策節奏",
    ai_summary_zh_tw: "Reuters 市場報導指出，債券殖利率與股市走勢反映投資人對利率政策仍有分歧。分析師認為，後續數據將決定市場波動是否擴大。",
    category: "Business"
  }
];

export function getDemoCategories() {
  const counts = new Map();
  for (const topic of demoTopics) {
    for (const category of topic.categories) {
      counts.set(category, (counts.get(category) || 0) + 1);
    }
  }

  return Array.from(counts, ([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

export function getDemoTopics({ category = "", search = "" } = {}) {
  const needle = search.trim().toLowerCase();

  return demoTopics.filter((topic) => {
    const categoryMatch = !category || topic.categories.includes(category);
    const searchMatch = !needle || [
      topic.headline,
      topic.summary,
      topic.sources.join(" "),
      topic.categories.join(" ")
    ].join(" ").toLowerCase().includes(needle);

    return categoryMatch && searchMatch;
  });
}

export function getDemoTopic(slug) {
  const topic = demoTopics.find((item) => item.slug === slug);
  if (!topic) {
    return null;
  }

  return {
    ...topic,
    articles: demoArticles.filter((article) => article.topic_id === topic.id)
  };
}
