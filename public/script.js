document.addEventListener("DOMContentLoaded", () => {
  const fetchBtn = document.getElementById("fetchBtn");
  const leagueInput = document.getElementById("leagueId");
  const output = document.getElementById("output");

  let gwSortDescending = true;

  async function loadLeague(leagueId) {
    try {
      const res = await fetch(`/api/league/${leagueId}`);
      if (!res.ok) throw new Error("League not found");
      return await res.json();
    } catch (err) {
      console.error("Fetch error:", err);
      output.innerHTML = `<p style="color:#f88;">Failed to fetch league data.</p>`;
      return null;
    }
  }

  function renderTables(data) {
    const standings = [...data.standings];
    const top3 = [...standings].sort((a, b) => b.gwPoints - a.gwPoints).slice(0, 3);

    let html = `
      <h2>${data.league.name}</h2>
      <p>Gameweek ${data.currentGameweek}</p>

      <p class="table-hint"> FYI: You can click on the “GW Points (Net)” column to sort scores (ascending/descending).</p>

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

    const gwHeader = document.getElementById("gwHeader");
    const gwArrow = document.getElementById("gwArrow");

    gwHeader.addEventListener("click", () => {
      const sorted = [...standings].sort((a, b) =>
        gwSortDescending ? b.gwPoints - a.gwPoints : a.gwPoints - b.gwPoints
      );

      gwSortDescending = !gwSortDescending;
      gwArrow.textContent = gwSortDescending ? "⬇" : "⬆";

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

      document.querySelectorAll("th").forEach((th) => th.classList.remove("active-sort"));
      gwHeader.classList.add("active-sort");
    });
  }

  fetchBtn.addEventListener("click", async () => {
    const leagueId = leagueInput.value.trim();
    if (!leagueId) {
      output.innerHTML = `<p style="color:#f88;">Please enter a valid League ID.</p>`;
      return;
    }

    output.innerHTML = "<p>Loading league standings...</p>";

    const data = await loadLeague(leagueId);
    if (data && data.standings) {
      renderTables(data);
    } else {
      output.innerHTML = `<p style="color:#f88;">No league data found.</p>`;
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const fetchBtn = document.getElementById("fetchBtn");
  const leagueInput = document.getElementById("leagueId");
  const output = document.getElementById("output");
  const tableHint = document.getElementById("tableHint");

  async function loadLeague(leagueId) {
    const res = await fetch(`/api/league/${leagueId}`);
    if (!res.ok) throw new Error("League not found");
    return await res.json();
  }

  function generateTableHTML(title, teams, isGWTop = false) {
    const tableId = isGWTop ? "gwTable" : "totalTable";

    let html = `<h2>${title}</h2>`;
    html += `<div class="table-wrapper">`;
    html += `<table id="${tableId}"><thead><tr>
        <th>Rank</th>
        <th>Team</th>
        <th>Manager</th>
        <th class="sortable">Total Points</th>
        <th class="sortable gw-header">GW Points (Net)</th>
        <th>Raw Points</th>
        <th>Transfer Hit</th>
      </tr></thead><tbody>`;

    teams.forEach((team) => {
      html += `<tr style="${isGWTop ? 'background: rgba(46,204,113,0.1);' : ''}">
          <td>${team.rank}</td>
          <td>${team.entry_name}</td>
          <td>${team.player_name}</td>
          <td>${team.totalPoints}</td>
          <td>${team.gwPoints}</td>
          <td>${team.rawPoints}</td>
          <td>${team.transferCost > 0 ? `-${team.transferCost}` : "—"}</td>
        </tr>`;
    });

    html += "</tbody></table></div>";
    return html;
  }

  function addGWSortListener(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const gwHeader = table.querySelector(".gw-header");
    let asc = false;

    gwHeader.addEventListener("click", () => {
      const tbody = table.querySelector("tbody");
      const rows = Array.from(tbody.querySelectorAll("tr"));

      rows.sort((a, b) => {
        const aPoints = parseInt(a.cells[4].innerText) || 0;
        const bPoints = parseInt(b.cells[4].innerText) || 0;
        return asc ? aPoints - bPoints : bPoints - aPoints;
      });

      rows.forEach((row) => tbody.appendChild(row));
      asc = !asc;
    });
  }

  fetchBtn.addEventListener("click", async () => {
    const leagueId = leagueInput.value.trim();
    if (!leagueId) {
      output.innerHTML = "<p style='color:#f88;'>Please enter a valid League ID.</p>";
      return;
    }

    output.innerHTML = "<p>Loading league standings...</p>";
    tableHint.style.display = "none";

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

      let html = generateTableHTML(
        `${data.league.name} — Gameweek ${data.currentGameweek}`,
        allTeams
      );

      html += generateTableHTML(
        `🔥 Top 3 Performers — GW ${data.currentGameweek}`,
        top3,
        true
      );

      output.innerHTML = html;

      tableHint.style.display = "block";

      addGWSortListener("totalTable");
    } catch (err) {
      console.error(err);
      output.innerHTML = "<p style='color:#f88;'>Failed to fetch league data.</p>";
    }
  });
});
