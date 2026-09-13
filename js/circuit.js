function timeToSeconds(t) {
  if (!t) return Infinity;
  const [min, rest] = t.split(":");
  return parseInt(min, 10) * 60 + parseFloat(rest);
}

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
  const rows = allSetups[id] || [];

  document.getElementById("circuit-title").textContent = circuit
    ? `${circuit.flag} ${circuit.name}`
    : "Circuito no encontrado";

  document.getElementById("suggest-link").href = suggestUrl(circuit ? circuit.name : "");

  if (rows.length > 0) {
    const best = rows[fastestIndex(rows, "lapTime")];
    document.getElementById("circuit-sub").innerHTML =
      `Mejor vuelta: <strong class="mono">${best.lapTime}</strong> — ${best.driver} (${best.team})`;
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

  const sorted = [...rows].sort((a, b) => timeToSeconds(a.lapTime) - timeToSeconds(b.lapTime));
  const fastS1 = fastestIndex(sorted, "sector1");
  const fastS2 = fastestIndex(sorted, "sector2");
  const fastS3 = fastestIndex(sorted, "sector3");

  sorted.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="tyre-dot" style="background:${r.tyre || "#888"}"></span></td>
      <td class="mono" style="${i === fastS1 ? "color:var(--purple)" : ""}">${r.sector1}</td>
      <td class="mono" style="${i === fastS2 ? "color:var(--purple)" : ""}">${r.sector2}</td>
      <td class="mono" style="${i === fastS3 ? "color:var(--purple)" : ""}">${r.sector3}</td>
      <td class="mono" style="${i === 0 ? "color:var(--green)" : ""}">${r.lapTime}</td>
      <td class="mono">${r.wingFront ?? "—"}</td>
      <td class="mono">${r.wingRear ?? "—"}</td>
      <td class="mono">${r.brake ?? "—"}</td>
      <td class="mono">${r.downForce ?? "—"}</td>
      <td>${r.driver}</td>
      <td>${r.team}</td>
    `;
    tbody.appendChild(tr);
  });
}

init();
