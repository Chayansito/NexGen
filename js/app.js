// Mejor vuelta de cada circuito, a partir de los setups ya agrupados por pista.
function summarize(circuits, byTrack) {
  return circuits.map(c => {
    const rows = byTrack.get(c.id);
    if (!rows || rows.length === 0) return { ...c, best: null };
    const best = rows.reduce((a, b) => (timeToSeconds(a["Lap Time"]) < timeToSeconds(b["Lap Time"]) ? a : b));
    return { ...c, best };
  });
}

function renderHero(summaries) {
  const withData = summaries.filter(c => c.best);
  if (withData.length === 0) {
    document.getElementById("hero-sub").textContent = "Todavía no hay tiempos registrados.";
    return;
  }
  const top = withData.reduce((a, b) => (timeToSeconds(a.best["Lap Time"]) < timeToSeconds(b.best["Lap Time"]) ? a : b));
  document.getElementById("hero-time").textContent = top.best["Lap Time"];
  document.getElementById("hero-sub").innerHTML =
    `${flagCell(top.flag, top.countryCode)} <strong>${esc(top.name)}</strong> — ${esc(top.best["Driver"])} (${esc(getTeam(top.best))})`;
}

function renderRows(summaries) {
  // Orden fijo del calendario (el de circuits.json), no por mejor tiempo.
  const html = summaries.map((c, i) => {
    if (c.best) {
      return `<tr class="has-data" data-id="${esc(c.id)}">
        <td class="num-idx">${i + 1}</td>
        <td>${flagCell(c.flag, c.countryCode)} ${esc(c.name)}</td>
        <td class="mono">${esc(c.best["Lap Time"])}</td>
        <td>${teamCell(getTeam(c.best))}</td>
        <td>${esc(c.best["Driver"])}</td>
        <td class="mono">${esc(c.best["Down Force Level"])}</td>
        <td class="arrow">→</td>
      </tr>`;
    }
    return `<tr class="empty">
      <td class="num-idx">${i + 1}</td>
      <td>${flagCell(c.flag, c.countryCode)} ${esc(c.name)}</td>
      <td colspan="4">Sin datos todavía</td>
      <td><a class="suggest-inline" href="${esc(suggestUrl(c.name))}" target="_blank" rel="noopener">Sugerir setup</a></td>
    </tr>`;
  }).join("");

  const tbody = document.getElementById("circuit-rows");
  tbody.innerHTML = html;                       // un solo reflow en vez de 24
  tbody.onclick = e => {                        // un solo listener para toda la tabla
    const tr = e.target.closest("tr.has-data");
    if (tr) window.location.href = `circuit.html?id=${encodeURIComponent(tr.dataset.id)}`;
  };
}

function showError(err) {
  console.error(err);
  document.getElementById("hero-sub").textContent = "No se pudieron cargar los datos. Probá recargar la página.";
  document.getElementById("circuit-rows").innerHTML =
    `<tr><td colspan="7" style="color:var(--muted)">Error al cargar los datos.</td></tr>`;
}

const circuitsPromise = loadJSON("data/circuits.json");
circuitsPromise.catch(showError);

loadSetups(setups =>
  circuitsPromise.then(circuits => {
    const summaries = summarize(circuits, groupByTrack(setups));
    renderHero(summaries);
    renderRows(summaries);
  })
).catch(showError);
