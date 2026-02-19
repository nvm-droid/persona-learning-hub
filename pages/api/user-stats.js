let data = {};

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId required" });
    return res.status(200).json(data[userId] || null);
  }
  if (req.method === "POST") {
    try {
      const { userId, stats } = req.body;
      if (!userId || !stats) return res.status(400).json({ error: "Missing fields" });
      data[userId] = stats;
      return res.status(200).json({ success: true });
    } catch { return res.status(500).json({ error: "Server error" }); }
  }
  return res.status(405).end();
}
