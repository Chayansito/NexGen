// Portada del equipo: resumen y tabla de pilotos, calculados con los mismos
// datos que la página de setups.
const norm = s => String(s || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function buildSummary(circuits, setups) {
  const byTrack = groupByTrack(setups);
  const pilots = new Map();
  let withTimes = 0;

  for (const row of setups) {
    const key = norm(row["Driver"]);
    if (!key) continue;
    if (!pilots.has(key)) pilots.set(key, { name: row["Driver"].trim(), team: getTeam(row), setups: 0, leads: 0 });
    pilots.get(key).setups++;
  }

  for (const c of circuits) {
    const rows = byTrack.get(c.id);
    if (!rows || rows.length === 0) continue;
    withTimes++;
    const best = rows.reduce((a, b) => (timeToSeconds(a["Lap Time"]) < timeToSeconds(b["Lap Time"]) ? a : b));
    const p = pilots.get(norm(best["Driver"]));
    if (p) p.leads++;
  }

  const ranking = [...pilots.values()].sort((a, b) =>
    b.leads - a.leads || b.setups - a.setups || a.name.localeCompare(b.name));
  return { withTimes, total: circuits.length, setups: setups.length, ranking };
}

function render({ withTimes, total, setups, ranking }) {
  document.getElementById("stat-circuits").textContent = `${withTimes}/${total}`;
  document.getElementById("stat-setups").textContent = setups;
  document.getElementById("stat-pilots").textContent = ranking.length;

  document.getElementById("pilot-rows").innerHTML = ranking.length === 0
    ? `<tr><td colspan="5" style="color:var(--muted)">Todavía no hay pilotos registrados.</td></tr>`
    : ranking.map((p, i) => `<tr>
        <td class="num-idx">${i + 1}</td>
        <td><strong>${esc(p.name)}</strong></td>
        <td>${teamCell(p.team)}</td>
        <td class="mono">${p.setups}</td>
        <td class="mono">${p.leads}</td>
      </tr>`).join("");
}

function showError(err) {
  console.error(err);
  document.getElementById("pilot-rows").innerHTML =
    `<tr><td colspan="5" style="color:var(--muted)">No se pudieron cargar los datos. Probá recargar la página.</td></tr>`;
}

const circuitsPromise = loadJSON("data/circuits.json");
circuitsPromise.catch(showError);
loadSetups(setups => circuitsPromise.then(circuits => render(buildSummary(circuits, setups)))).catch(showError);
