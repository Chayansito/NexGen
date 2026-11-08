// Portada: resumen de NexGen + clasificación de pilotos y de constructores.

function renderStats({ drivers, constructors }) {
  const items = [];
  const ci = constructors.findIndex(c => c.name === OUR_TEAM);
  if (ci >= 0) items.push({ big: ordinal(ci + 1), label: `Constructores · ${constructors[ci].pts} pts` });
  drivers.forEach((d, i) => {
    if (d.TEAM === OUR_TEAM) items.push({ big: ordinal(i + 1), label: `${d.DRIVER} · ${d.pts} pts` });
  });
  document.getElementById("nexgen-stats").innerHTML = items.map(it =>
    `<div><span class="stat-num mono">${esc(it.big)}</span><span class="stat-label">${esc(it.label)}</span></div>`
  ).join("");
}

function renderDrivers(drivers) {
  document.getElementById("driver-rows").innerHTML = drivers.map((d, i) => `
    <tr class="${d.TEAM === OUR_TEAM ? "is-nexgen" : ""}">
      <td class="num-idx">${i + 1}</td>
      <td><strong>${esc(d.DRIVER)}</strong></td>
      <td>${teamCell(d.TEAM)}</td>
      <td class="pts mono">${d.pts}</td>
    </tr>`).join("");
}

function renderConstructors(constructors) {
  document.getElementById("constructor-rows").innerHTML = constructors.map((c, i) => `
    <tr class="${c.name === OUR_TEAM ? "is-nexgen" : ""}">
      <td class="num-idx">${i + 1}</td>
      <td>${teamCell(c.name)}</td>
      <td><strong>${esc(c.name)}</strong></td>
      <td class="pts mono">${c.pts}</td>
    </tr>`).join("");
}

function showError(err) {
  console.error(err);
  const msg = `<tr><td colspan="4" style="color:var(--muted)">No se pudo cargar la clasificación. Probá recargar la página.</td></tr>`;
  document.getElementById("driver-rows").innerHTML = msg;
  document.getElementById("constructor-rows").innerHTML = msg;
}

loadStandings().then(s => {
  renderStats(s);
  renderDrivers(s.drivers);
  renderConstructors(s.constructors);
}).catch(showError);
