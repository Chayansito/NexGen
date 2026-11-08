function getCircuitId() {
  return new URLSearchParams(window.location.search).get("id");
}

function fastestIndex(rows, key) {
  let idx = 0;
  rows.forEach((r, i) => {
    if (timeToSeconds(r[key]) < timeToSeconds(rows[idx][key])) idx = i;
  });
  return idx;
}

// El id sale de la URL, así que el mapa puede empezar a descargarse YA,
// sin esperar a que lleguen circuits.json y setups.json.
function startTrackMap(id) {
  const img = document.getElementById("track-map");
  img.onerror = () => {
    img.style.display = "none";
    document.getElementById("no-map").style.display = "block";
  };
  img.onload = () => { img.style.display = "block"; };
  if (id) img.src = `assets/tracks/${encodeURIComponent(id)}.webp`;
}

function draw(circuits, allSetups, id) {
  const circuit = circuits.find(c => c.id === id);
  const rows = groupByTrack(allSetups).get(id) || [];

  document.getElementById("circuit-title").innerHTML = circuit
    ? `${flagCell(circuit.flag, circuit.countryCode, 36)} ${esc(circuit.name)}`
    : "Circuito no encontrado";

  document.getElementById("suggest-link").href = suggestUrl(circuit ? circuit.name : "");

  if (rows.length > 0) {
    const best = rows[fastestIndex(rows, "Lap Time")];
    document.getElementById("circuit-sub").innerHTML =
      `Mejor vuelta: <strong class="mono">${esc(best["Lap Time"])}</strong> — ${esc(best["Driver"])} (${esc(getTeam(best))})`;
  } else {
    document.getElementById("circuit-sub").textContent = "Todavía no hay setups cargados para este circuito.";
  }

  renderRows(rows);
}

function init() {
  const id = getCircuitId();
  startTrackMap(id);

  const circuitsPromise = loadJSON("data/circuits.json");
  circuitsPromise.catch(showError);

  return loadSetups(setups =>
    circuitsPromise.then(circuits => draw(circuits, setups, id))
  );
}

function showError(err) {
  console.error(err);
  document.getElementById("circuit-title").textContent = "No se pudieron cargar los datos";
  document.getElementById("setup-rows").innerHTML =
    `<tr><td colspan="11" style="color:var(--muted)">Error al cargar los datos. Probá recargar la página.</td></tr>`;
}

function renderRows(rows) {
  const tbody = document.getElementById("setup-rows");

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="color:var(--muted)">Nadie subió un setup todavía. ¡Sé el primero!</td></tr>`;
    return;
  }

  const sorted = [...rows].sort((a, b) => timeToSeconds(a["Lap Time"]) - timeToSeconds(b["Lap Time"]));
  const fastS1 = fastestIndex(sorted, "Sector 1");
  const fastS2 = fastestIndex(sorted, "Sector 2");
  const fastS3 = fastestIndex(sorted, "Sector 3");

  tbody.innerHTML = sorted.map((r, i) => `<tr>
      <td>${tyreCell(r["Tyre"])}</td>
      <td class="mono" style="${i === fastS1 ? "color:var(--purple)" : ""}">${esc(r["Sector 1"])}</td>
      <td class="mono" style="${i === fastS2 ? "color:var(--purple)" : ""}">${esc(r["Sector 2"])}</td>
      <td class="mono" style="${i === fastS3 ? "color:var(--purple)" : ""}">${esc(r["Sector 3"])}</td>
      <td class="mono">${i === 0 ? `<span class="fastest-badge">${esc(r["Lap Time"])}</span>` : esc(r["Lap Time"])}</td>
      <td class="mono">${esc(r["Wing Setup"] ?? "—")}</td>
      <td class="mono">${esc(r["Brake Balance"] ?? "—")}</td>
      <td class="mono">${esc(r["Suspension"] ?? "—")}</td>
      <td class="mono">${esc(r["Down Force Level"] ?? "—")}</td>
      <td>${esc(r["Driver"])}</td>
      <td>${teamCell(getTeam(r))}</td>
    </tr>`).join("");
}

init().catch(showError);
