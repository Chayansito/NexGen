function getCircuitId() {
  return new URLSearchParams(window.location.search).get("id");
}

async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

function fastestIndex(rows, key) {
  let idx = 0;
  rows.forEach((r, i) => {
    if (timeToSeconds(r[key]) < timeToSeconds(rows[idx][key])) idx = i;
  });
  return idx;
}

async function init() {
  const id = getCircuitId();
  const [circuits, allSetups] = await Promise.all([
    loadJSON("data/circuits.json"),
    loadJSON("data/setups.json"),
  ]);

  const circuit = circuits.find(c => c.id === id);
  const rows = allSetups.filter(s => trackSlug(s["Track"]) === id);

  document.getElementById("circuit-title").innerHTML = circuit
    ? `${flagCell(circuit.countryCode, 32)} ${circuit.name}`
    : "Circuito no encontrado";

  document.getElementById("suggest-link").href = suggestUrl(circuit ? circuit.name : "");

  if (rows.length > 0) {
    const best = rows[fastestIndex(rows, "Lap Time")];
    document.getElementById("circuit-sub").innerHTML =
      `Mejor vuelta: <strong class="mono">${best["Lap Time"]}</strong> — ${best["Driver"]} (${getTeam(best)})`;
  } else {
    document.getElementById("circuit-sub").textContent = "Todavía no hay setups cargados para este circuito.";
  }

  // Mapa del circuito (opcional, se agrega manualmente en assets/tracks/)
  const img = document.getElementById("track-map");
  img.onerror = () => {
    img.style.display = "none";
    document.getElementById("no-map").style.display = "block";
  };
  img.onload = () => { img.style.display = "block"; };
  img.src = `assets/tracks/${id}.png`;

  renderRows(rows);
}

function renderRows(rows) {
  const tbody = document.getElementById("setup-rows");
  tbody.innerHTML = "";

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="color:var(--muted)">Nadie subió un setup todavía. ¡Sé el primero!</td></tr>`;
    return;
  }

  const sorted = [...rows].sort((a, b) => timeToSeconds(a["Lap Time"]) - timeToSeconds(b["Lap Time"]));
  const fastS1 = fastestIndex(sorted, "Sector 1");
  const fastS2 = fastestIndex(sorted, "Sector 2");
  const fastS3 = fastestIndex(sorted, "Sector 3");

  sorted.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${tyreCell(r["Tyre"])}</td>
      <td class="mono" style="${i === fastS1 ? "color:var(--purple)" : ""}">${r["Sector 1"]}</td>
      <td class="mono" style="${i === fastS2 ? "color:var(--purple)" : ""}">${r["Sector 2"]}</td>
      <td class="mono" style="${i === fastS3 ? "color:var(--purple)" : ""}">${r["Sector 3"]}</td>
      <td class="mono" style="${i === 0 ? "color:var(--green)" : ""}">${r["Lap Time"]}</td>
      <td class="mono">${r["Wing Setup"] ?? "—"}</td>
      <td class="mono">${r["Brake Balance"] ?? "—"}</td>
      <td class="mono">${r["Suspension"] ?? "—"}</td>
      <td class="mono">${r["Down Force Level"] ?? "—"}</td>
      <td>${r["Driver"]}</td>
      <td>${teamCell(getTeam(r))}</td>
    `;
    tbody.appendChild(tr);
  });
}

init();
