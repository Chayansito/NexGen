async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

// Junta el resumen (mejor vuelta) de cada circuito a partir del array plano de setups.
function summarize(circuits, setups) {
  return circuits.map(c => {
    const rows = setups.filter(s => trackSlug(s["Track"]) === c.id);
    if (rows.length === 0) return { ...c, best: null };
    const best = rows.reduce((a, b) => (timeToSeconds(a["Lap Time"]) < timeToSeconds(b["Lap Time"]) ? a : b));
    return { ...c, best };
  });
}

function renderHero(summaries) {
  const withData = summaries.filter(c => c.best);
  if (withData.length === 0) return;
  const top = withData.reduce((a, b) => (timeToSeconds(a.best["Lap Time"]) < timeToSeconds(b.best["Lap Time"]) ? a : b));
  document.getElementById("hero-time").textContent = top.best["Lap Time"];
  document.getElementById("hero-sub").innerHTML =
    `${flagCell(top.flag, top.countryCode)} <strong>${top.name}</strong> — ${top.best["Driver"]} (${getTeam(top.best)})`;
}

function renderRows(summaries) {
  // Orden fijo del calendario (el orden en que vienen en circuits.json),
  // no por mejor tiempo.
  const tbody = document.getElementById("circuit-rows");
  tbody.innerHTML = "";

  summaries.forEach((c, i) => {
    const tr = document.createElement("tr");

    if (c.best) {
      tr.className = "has-data";
      tr.onclick = () => (window.location.href = `circuit.html?id=${c.id}`);
      tr.innerHTML = `
        <td class="num-idx">${i + 1}</td>
        <td>${flagCell(c.flag, c.countryCode)} ${c.name}</td>
        <td class="mono">${c.best["Lap Time"]}</td>
        <td>${teamCell(getTeam(c.best))}</td>
        <td>${c.best["Driver"]}</td>
        <td class="mono">${c.best["Down Force Level"]}</td>
        <td class="arrow">→</td>
      `;
    } else {
      tr.className = "empty";
      tr.innerHTML = `
        <td class="num-idx">${i + 1}</td>
        <td>${flagCell(c.flag, c.countryCode)} ${c.name}</td>
        <td colspan="4">Sin datos todavía</td>
        <td><a class="suggest-inline" href="${suggestUrl(c.name)}" target="_blank" rel="noopener">Sugerir setup</a></td>
      `;
    }
    tbody.appendChild(tr);
  });
}

Promise.all([loadJSON("data/circuits.json"), loadJSON("data/setups.json")]).then(([circuits, setups]) => {
  const summaries = summarize(circuits, setups);
  renderHero(summaries);
  renderRows(summaries);
});
