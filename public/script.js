document.addEventListener("DOMContentLoaded", () => {
  const fetchBtn = document.getElementById("fetchBtn");
  const leagueInput = document.getElementById("leagueId");
  const output = document.getElementById("output");

  let gwSortDescending = true;

  // Fetch league data
  async function loadLeague(leagueId) {
    try {
      const res = await fetch(`/api/league/${leagueId}`);
      if (!res.ok) throw new Error("League not found");
      return await res.json();
    } catch (err) {
      console.error("Fetch error:", err);
      output.innerHTML = `<p style="color:#f88;">⚠️ Failed to fetch league data.</p>`;
      return null;
    }
  }

  // Render tables
  function renderTables(data) {
    const standings = [...data.standings];
    const top3 = [...standings].sort((a, b) => b.gwPoints - a.gwPoints).slice(0, 3);

    let html = `
      <h2>${data.league.name}</h2>
      <p>Gameweek ${data.currentGameweek}</p>

      <table id="mainTable">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>Manager</th>
            <th>Total Points</th>
            <th id="gwHeader" class="sortable">GW Points (Net) <span id="gwArrow">⬍</span></th>
            <th>Raw Points</th>
            <th>Transfer Hit</th>
          </tr>
        </thead>
        <tbody>
    `;

    standings.forEach((team) => {
      html += `
        <tr>
          <td>${team.rank}</td>
          <td>${team.entry_name}</td>
          <td>${team.player_name}</td>
          <td>${team.totalPoints}</td>
          <td>${team.gwPoints}</td>
          <td>${team.rawPoints}</td>
          <td>${team.transferCost > 0 ? `-${team.transferCost}` : "—"}</td>
        </tr>`;
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
        </tr>`;
    });

    html += `</tbody></table>`;
    output.innerHTML = html;

    // Add sorting functionality
    const gwHeader = document.getElementById("gwHeader");
    const gwArrow = document.getElementById("gwArrow");

    gwHeader.addEventListener("click", () => {
      const sorted = [...standings].sort((a, b) =>
        gwSortDescending ? b.gwPoints - a.gwPoints : a.gwPoints - b.gwPoints
      );

      gwSortDescending = !gwSortDescending;
      gwArrow.textContent = gwSortDescending ? "⬇" : "⬆";

      // Re-render only tbody
      const tbody = document.querySelector("#mainTable tbody");
      tbody.innerHTML = sorted
        .map(
          (team) => `
          <tr>
            <td>${team.rank}</td>
            <td>${team.entry_name}</td>
            <td>${team.player_name}</td>
            <td>${team.totalPoints}</td>
            <td>${team.gwPoints}</td>
            <td>${team.rawPoints}</td>
            <td>${team.transferCost > 0 ? `-${team.transferCost}` : "—"}</td>
          </tr>`
        )
        .join("");

      // Highlight active column
      document.querySelectorAll("th").forEach((th) => th.classList.remove("active-sort"));
      gwHeader.classList.add("active-sort");
    });
  }

  // Button click handler
  fetchBtn.addEventListener("click", async () => {
    const leagueId = leagueInput.value.trim();
    if (!leagueId) {
      output.innerHTML = `<p style="color:#f88;">⚠️ Please enter a valid League ID.</p>`;
      return;
    }

    output.innerHTML = "<p>Loading league standings...</p>";

    const data = await loadLeague(leagueId);
    if (data && data.standings) {
      renderTables(data);
    } else {
      output.innerHTML = `<p style="color:#f88;">⚠️ No league data found.</p>`;
    }
  });
});
