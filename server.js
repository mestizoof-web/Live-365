const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.FOOTBALL_DATA_TOKEN;
app.use(express.static(path.join(__dirname, "public")));

let cache = { at: 0, data: null };
app.get("/api/matches", async (_req, res) => {
  if (!TOKEN) return res.status(503).json({ error: "Missing FOOTBALL_DATA_TOKEN. Add your API token in the hosting environment." });
  if (cache.data && Date.now() - cache.at < 60_000) return res.json(cache.data);
  try {
    const response = await fetch("https://api.football-data.org/v4/matches", {
      headers: { "X-Auth-Token": TOKEN }
    });
    if (!response.ok) {
      const detail = await response.text();
      return res.status(response.status).json({ error: "football-data.org request failed", detail });
    }
    const data = await response.json();
    cache = { at: Date.now(), data };
    res.json(data);
  } catch (error) {
    res.status(502).json({ error: "Could not reach football-data.org", detail: error.message });
  }
});
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`LIVE 365 running on port ${PORT}`));
