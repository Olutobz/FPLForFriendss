import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// 🧩 API route: Fetch FPL league data
app.get("/api/league/:leagueId", async (req, res) => {
  try {
    const { leagueId } = req.params;

    // 1️⃣ Fetch league standings
    const leagueRes = await fetch(
      `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`
    );
    if (!leagueRes.ok) throw new Error("League not found");
    const leagueData = await leagueRes.json();

    const standings = leagueData?.standings?.results || [];

    // 2️⃣ Fetch current gameweek info
    const bootstrapRes = await fetch(
      "https://fantasy.premierleague.com/api/bootstrap-static/"
    );
    const bootstrapData = await bootstrapRes.json();
    const currentEvent = bootstrapData.events.find((e) => e.is_current);
    const currentGameweek = currentEvent?.id ?? bootstrapData.events.find((e) => e.is_next)?.id ?? 1;

    // 3️⃣ Fetch each manager's current GW stats
    const teamData = await Promise.all(
      standings.map(async (m) => {
        try {
          const picksRes = await fetch(
            `https://fantasy.premierleague.com/api/entry/${m.entry}/event/${currentGameweek}/picks/`
          );
          const picksData = await picksRes.json();

          const gwPoints = picksData.entry_history?.points ?? 0;
          const totalPoints = picksData.entry_history?.total_points ?? 0;
          const transferCost = picksData.entry_history?.event_transfers_cost ?? 0;
          const rawPoints = gwPoints + transferCost;

          return {
            ...m,
            gwPoints,
            totalPoints,
            transferCost,
            rawPoints,
          };
        } catch (err) {
          console.error(`Error fetching team ${m.entry}:`, err.message);
          return {
            ...m,
            gwPoints: 0,
            totalPoints: m.total ?? 0,
            transferCost: 0,
            rawPoints: 0,
          };
        }
      })
    );

    res.json({
      league: leagueData.league || { name: "Unknown League" },
      standings: teamData,
      currentGameweek,
    });
  } catch (err) {
    console.error("Error fetching league data:", err);
    res.status(500).json({ error: "Failed to fetch FPL league data" });
  }
});

// ✅ Run only locally (Vercel handles it automatically in production)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () =>
    console.log(`✅ Server running locally at http://localhost:${PORT}`)
  );
}

export default app;
