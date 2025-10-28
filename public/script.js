// 🔹 Load league data via your backend (avoids CORS issues)
async function loadLeague(leagueId) {
  const res = await fetch(`/api/league/${leagueId}`);
  const data = await res.json();
  return data; // return for use by click handler
}

// 🔹 Handle "Fetch" button click
document.getElementById("fetchBtn").addEventListener("click", async () => {
  const leagueId = document.getElementById("leagueId").value.trim();
  const output = document.getElementById("output");
  output.innerHTML = "<p>Loading...</p>";

  try {
    const data = await loadLeague(leagueId); // ✅ use helper function

    if (!data || !data.standings) {
      output.innerHTML = "<p>League not found.</p>";
      return;
    }

    // 🏆 Sort all teams by total rank (for main table)
    const allTeams = [...data.standings].sort((a, b) => a.rank - b.rank);

    // 🔥 Sort by GW points to get top 4 for the week
    const top4 = [...data.standings]
      .sort((a, b) => b.gwPoints - a.gwPoints)
      .slice(0, 4);

    let html = `
      <h2>${data.league.name} — Gameweek ${data.currentGameweek}</h2>

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

    for (const team of allTeams) {
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
    }

    html += `
        </tbody>
      </table>

      <h3 style="margin-top: 40px;">🔥 Top 4 Performers — Gameweek ${data.currentGameweek}</h3>
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

    for (const team of top4) {
      html += `
        <tr style="background: #243b55;">
          <td>${team.rank}</td>
          <td>${team.entry_name}</td>
          <td>${team.player_name}</td>
          <td>${team.gwPoints}</td>
          <td>${team.rawPoints}</td>
          <td>${team.transferCost > 0 ? `-${team.transferCost}` : "—"}</td>
        </tr>
      `;
    }

    html += "</tbody></table>";

    output.innerHTML = html;
  } catch (err) {
    console.error(err);
    output.innerHTML = "<p>Error loading league data.</p>";
  }
});
