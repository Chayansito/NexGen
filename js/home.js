// Portada: resumen de NexGen + clasificación de pilotos y de constructores.

function renderSeason({ drivers, constructors }) {
  const ci = constructors.findIndex(c => c.name === OUR_TEAM);
  document.getElementById("season-constructors").innerHTML = ci < 0 ? "" :
    `<span class="stat-num mono">${ordinal(ci + 1)}</span><span class="stat-label">Constructores · ${constructors[ci].pts} pts</span>`;

  // Foto del auto de la temporada (assets/team/NG-1.png); si no existe, no se muestra.
  document.getElementById("season-car-slot").innerHTML =
    photoImg("NG-1.png", "Monoplaza NG-1 de NexGen Racing", "season-car-img");

  document.getElementById("season-drivers").innerHTML = drivers
    .map((d, i) => ({ d, i }))
    .filter(({ d }) => d.TEAM === OUR_TEAM)
    .map(({ d, i }) => `<div class="season-driver"><span class="stat-num mono">${ordinal(i + 1)}</span><span class="stat-label">${esc(d.DRIVER)} · ${d.pts} pts</span></div>`)
    .join("");
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

function renderHomeDrivers(drivers) {
  const ours = drivers.map((d, i) => ({ d, i })).filter(({ d }) => d.TEAM === OUR_TEAM);
  document.getElementById("home-drivers").innerHTML = ours.map(({ d, i }) => `
    <article class="mini-driver">
      <div class="driver-photo">
        ${photoImg(surname(d.DRIVER) + ".png", d.DRIVER, "driver-photo-img")}
        <span class="photo-fallback" style="display:none">${esc(initials(d.DRIVER))}</span>
      </div>
      <div class="mini-driver-body">
        <h3>${esc(d.DRIVER)}</h3>
        ${nationalityLine(d.DRIVER)}
        <span class="mini-meta mono">${ordinal(i + 1)} · ${d.pts} pts</span>
      </div>
    </article>`).join("") + `<a class="btn-ghost" href="pilotos.html">Ver resultados de los pilotos</a>`;
}

function showError(err) {
  console.error(err);
  const msg = `<tr><td colspan="4" style="color:var(--muted)">No se pudo cargar la clasificación. Probá recargar la página.</td></tr>`;
  document.getElementById("driver-rows").innerHTML = msg;
  document.getElementById("constructor-rows").innerHTML = msg;
}

loadStandings().then(s => {
  renderSeason(s);
  renderDrivers(s.drivers);
  renderConstructors(s.constructors);
  renderHomeDrivers(s.drivers);
}).catch(showError);
