// Vercel Serverless Function: 1x1 Tracking Pixel for AI Crawlers
// Path: api/pixel.js

const BUCKET_URL = "https://kvdb.io/AxwRJPGgoYFP4dTbKsL92U/";

export default async function handler(req, res) {
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  const pageUrl = req.query.page || "Unknown Path";
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Protected";

  const llmBots = [
    'gptbot', 'claudebot', 'perplexitybot', 'applebot-extended', 
    'oai-searchbot', 'google-extended', 'coherebot', 'facebookexternalhit',
    'meta-externalagent', 'omgilibot', 'anthropic-ai', 'diffbot', 'bot', 'crawler', 'spider'
  ];

  // AI 크롤러 봇 검출
  const isBot = llmBots.some(bot => userAgent.includes(bot)) || req.query.test === "bot";

  if (isBot) {
    try {
      // 1. KVdb total_scrapes 카운터 1 증가
      let totalScrapes = 0;
      try {
        const totalRes = await fetch(`${BUCKET_URL}total_scrapes`);
        if (totalRes.ok) {
          const val = await totalRes.text();
          totalScrapes = parseInt(val) || 0;
        }
      } catch (e) {}

      totalScrapes++;
      await fetch(`${BUCKET_URL}total_scrapes`, {
        method: "PUT",
        body: totalScrapes.toString(),
      });

      // 2. 실시간 크롤링 로그 누적
      let logs = [];
      try {
        const logsRes = await fetch(`${BUCKET_URL}logs`);
        if (logsRes.ok) {
          logs = await logsRes.json();
        }
      } catch (e) {}

      if (!Array.isArray(logs)) logs = [];

      // 한국 표준시(KST) 구하기
      const now = new Date();
      const kstOffset = 9 * 60 * 60 * 1000;
      const kstDate = new Date(now.getTime() + kstOffset);
      const nowStr = kstDate.toISOString().replace("T", " ").substring(0, 19);

      logs.unshift({
        created_at: nowStr,
        user_agent: req.headers["user-agent"] || "Unknown Agent",
        page_url: pageUrl,
        ip: clientIp.split(",")[0].trim(),
      });

      // 로그 최대 15개 유지
      if (logs.length > 15) {
        logs = logs.slice(0, 15);
      }

      await fetch(`${BUCKET_URL}logs`, {
        method: "PUT",
        body: JSON.stringify(logs),
      });

    } catch (err) {
      console.error("Tracking error:", err);
    }
  }

  // 1x1 투명 GIF 이미지 반환 (base64)
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );

  res.writeHead(200, {
    "Content-Type": "image/gif",
    "Content-Length": pixel.length,
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
  });
  
  res.end(pixel);
}
