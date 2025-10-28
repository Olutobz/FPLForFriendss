document.addEventListener("DOMContentLoaded", () => {
  const fetchBtn = document.getElementById("fetchBtn");
  const leagueInput = document.getElementById("leagueId");
  const output = document.getElementById("output");

  async function loadLeague(leagueId) {
    const res = await fetch(`/api/league/${leagueId}`);
    if (!res.ok) throw new Error("League not found");
    return await res.json();
  }

  fetchBtn.addEventListener("click", async () => {
    const leagueId = leagueInput.value.trim();
    if (!leagueId) {
      output.innerHTML = "<p style='color:#f88;'>Please enter a valid League ID.</p>";
      return;
    }

    output.innerHTML = "<p>Loading league standings...</p>";

    try {
      const data = await loadLeague(leagueId);
      if (!data || !data.standings) {
        output.innerHTML = "<p>League not found or no data available.</p>";
        return;
      }

      const allTeams = [...data.standings].sort((a, b) => a.rank - b.rank);
      const top3 = [...data.standings]
        .sort((a, b) => b.gwPoints - a.gwPoints)
        .slice(0, 3);

      let html = `
        <h2>${data.league.name}</h2>
        <p>Gameweek ${data.currentGameweek}</p>

        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Manager</th>
              <th>Total Points</th>
              <th>GW Points (Net)</th>
              <th>Raw Points</th>
              <th>Transfer Hit</th>
            </tr>
          </thead>
          <tbody>
      `;

      allTeams.forEach((team) => {
        html += `
          <tr>
            <td>${team.rank}</td>
            <td>${team.entry_name}</td>
            <td>${team.player_name}</td>
            <td>${team.totalPoints}</td>
            <td>${team.gwPoints}</td>
            <td>${team.rawPoints}</td>
            <td>${team.transferCost > 0 ? `-${team.transferCost}` : "—"}</td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>

        <h3 style="margin-top: 40px; color:#2ecc71;">🔥 Top 3 Performers — GW ${data.currentGameweek}</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Manager</th>
              <th>GW Points (Net)</th>
              <th>Raw Points</th>
              <th>Transfer Hit</th>
            </tr>
          </thead>
          <tbody>
      `;

      top3.forEach((team) => {
        html += `
          <tr style="background: rgba(46, 204, 113, 0.1);">
            <td>${team.rank}</td>
            <td>${team.entry_name}</td>
            <td>${team.player_name}</td>
            <td>${team.gwPoints}</td>
            <td>${team.rawPoints}</td>
            <td>${team.transferCost > 0 ? `-${team.transferCost}` : "—"}</td>
          </tr>
        `;
      });

      html += "</tbody></table>";

      output.innerHTML = html;
    } catch (err) {
      console.error(err);
      output.innerHTML = "<p style='color:#f88;'>Failed to fetch league data.</p>";
    }
  });
});
