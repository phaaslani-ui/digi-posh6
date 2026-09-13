/**
 * Vercel API - Trends
 * Path: /api/trends
 */
const RSS_SOURCES = [
  { url: 'https://www.vogue.com/feed/rss', name: 'Vogue' },
  { url: 'https://www.gq.com/feed/rss', name: 'GQ' },
  { url: 'https://www.elle.com/feed/rss', name: 'ELLE' },
  { url: 'https://www.harpersbazaar.com/feed/rss', name: "Harper's Bazaar" },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    const allTrends = [];
    
    for (const source of RSS_SOURCES) {
      try {
        const r = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}&count=3`
        );
        const data = await r.json();
        
        if (data.status === 'ok' && data.items) {
          allTrends.push(...data.items.slice(0, 3).map(item => ({
            title: item.title,
            link: item.link,
            source: source.name,
            pubDate: item.pubDate,
          })));
        }
      } catch(e) {
        continue;
      }
    }
    
    return res.status(200).json({
      success: true,
      count: allTrends.length,
      trends: allTrends,
    });
  } catch(e) {
    return res.status(500).json({ 
      success: false, 
      error: e.message 
    });
  }
}
