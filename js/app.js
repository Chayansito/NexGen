function timeToSeconds(t) {
  if (!t) return Infinity;
  const [min, rest] = t.split(":");
  return parseInt(min, 10) * 60 + parseFloat(rest);
}

async function loadCircuits() {
  const res = await fetch("data/circuits.json");
  return res.json();
}

function renderHero(circuits) {
  const withTime = circuits.filter(c => c.bestTime);
  if (withTime.length === 0) return;
  const best = withTime.reduce((a, b) => (timeToSeconds(a.bestTime) < timeToSeconds(b.bestTime) ? a : b));
  document.getElementById("hero-time").textContent = best.bestTime;
  document.getElementById("hero-sub").innerHTML =
    `${flagCell(best.countryCode)} <strong>${best.name}</strong> — ${best.driver} (${best.team})`;
}

function renderRows(circuits) {
  const sorted = [...circuits].sort((a, b) => timeToSeconds(a.bestTime) - timeToSeconds(b.bestTime));
  const tbody = document.getElementById("circuit-rows");
  tbody.innerHTML = "";

  sorted.forEach((c, i) => {
    const tr = document.createElement("tr");

    if (c.bestTime) {
      tr.className = "has-data";
      tr.onclick = () => (window.location.href = `circuit.html?id=${c.id}`);
      tr.innerHTML = `
        <td class="num-idx">${i + 1}</td>
        <td>${flagCell(c.countryCode)} ${c.name}</td>
        <td class="mono">${c.bestTime}</td>
        <td>${teamCell(c.team)}</td>
        <td>${c.driver}</td>
        <td class="mono">${c.downForce}</td>
        <td class="arrow">→</td>
      `;
    } else {
      tr.className = "empty";
      tr.innerHTML = `
        <td class="num-idx">${i + 1}</td>
        <td>${flagCell(c.countryCode)} ${c.name}</td>
        <td colspan="4">Sin datos todavía</td>
        <td><a class="suggest-inline" href="${suggestUrl(c.name)}" target="_blank" rel="noopener">Sugerir setup</a></td>
      `;
    }
    tbody.appendChild(tr);
  });
}

loadCircuits().then(circuits => {
  renderHero(circuits);
  renderRows(circuits);
});
