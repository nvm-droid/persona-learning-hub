// In-memory storage (resets on Vercel cold start ~15min idle)
// For persistent storage, upgrade to Vercel KV — see README
let data = [];

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") return res.status(200).json(data);

  if (req.method === "POST") {
    try {
      const { entry } = req.body;
      if (!entry?.id) return res.status(400).json({ error: "Invalid" });
      const idx = data.findIndex(e => e.id === entry.id);
      if (idx >= 0) data[idx] = entry; else data.push(entry);
      data.sort((a, b) => b.totalScore - a.totalScore);
      data = data.slice(0, 100);
      return res.status(200).json({ success: true, leaderboard: data });
    } catch { return res.status(500).json({ error: "Server error" }); }
  }
  return res.status(405).end();
}
