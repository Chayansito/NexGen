// Página de pilotos: solo los de NexGen, con sus resultados carrera por carrera.

function resultCell(raceId, value) {
  const r = parseResult(raceId, value);
  if (r.kind === "dnf") return `<span class="res res-dnf">DNF</span>`;
  if (r.kind === "none") return `<span class="res res-none">—</span>`;
  const pos = r.pos ? `<span class="pos pos-${r.pos <= 3 ? r.pos : "n"}">P${r.pos}</span>` : "";
  return `${pos}<span class="res-pts mono">+${r.pts}</span>`;
}

function driverStats(d, raceIds, rank) {
  const gp = raceIds.filter(id => id.startsWith("GP"));
  const posOf = id => parseResult(id, d[id]).pos;
  return {
    rank,
    wins: gp.filter(id => posOf(id) === 1).length,
    podiums: gp.filter(id => (posOf(id) || 99) <= 3).length,
    dnfs: raceIds.filter(id => d[id] === "DNF").length,
  };
}


function renderCards(ours, ranked, raceIds) {
  document.getElementById("driver-cards").innerHTML = ours.map(d => {
    const s = driverStats(d, raceIds, ranked.indexOf(d) + 1);
    return `<article class="driver-card">
      <div class="driver-photo">
        ${photoImg(surname(d.DRIVER) + ".png", d.DRIVER, "driver-photo-img")}
        <span class="photo-fallback" style="display:none">${esc(initials(d.DRIVER))}</span>
      </div>
      <div class="driver-card-body">
        <div class="driver-card-top">
          <div>
            <h2>${esc(d.DRIVER)}</h2>
            <p class="driver-nat">${nationalityLine(d.DRIVER)}</p>
            <p class="driver-card-team">${teamCell(d.TEAM)}</p>
          </div>
          <div class="driver-rank"><span class="mono">${ordinal(s.rank)}</span><small>${d.pts} pts</small></div>
        </div>
        <dl class="driver-facts">
          <div><dt>Victorias</dt><dd class="mono">${s.wins}</dd></div>
          <div><dt>Podios</dt><dd class="mono">${s.podiums}</dd></div>
          <div><dt>Abandonos</dt><dd class="mono">${s.dnfs}</dd></div>
        </dl>
      </div>
    </article>`;
  }).join("");
}

function raceCell(id, calendar) {
  const info = calendar[id];
  if (!info) return `<td class="race-name">${esc(raceLabel(id))}</td>`;
  const cc = (info.flag.match(/\/([a-z]{2})\.(?:webp|png)/i) || [])[1];
  return `<td class="race-name"><span class="race-cell">${flagCell(info.flag, cc)}<span><strong>${esc(info.track)}</strong><small>${esc(raceLabel(id))}</small></span></span></td>`;
}

function renderResults(ours, raceIds, calendar) {
  document.getElementById("results-head").innerHTML =
    `<th>Carrera</th>` + ours.map(d => `<th>${esc(d.DRIVER)}</th>`).join("");
  document.getElementById("results-rows").innerHTML = raceIds.map(id => `
    <tr>
      ${raceCell(id, calendar)}
      ${ours.map(d => `<td>${resultCell(id, d[id])}</td>`).join("")}
    </tr>`).join("");
}

loadStandings().then(({ drivers, raceIds, calendar }) => {
  const ours = drivers.filter(d => d.TEAM === OUR_TEAM);
  renderCards(ours, drivers, raceIds);
  renderResults(ours, raceIds, calendar);
}).catch(err => {
  console.error(err);
  document.getElementById("results-rows").innerHTML =
    `<tr><td colspan="3" style="color:var(--muted)">No se pudieron cargar los resultados. Probá recargar la página.</td></tr>`;
});
