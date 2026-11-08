// Link de tu Google Form (el de "enviar", no el de "editar").
const FORM_URL = "https://forms.gle/3FJRtqHYv9FufpoC8";

// Parámetro prellenado del campo "Circuito" (ej: "entry.123456789") o null.
const FORM_CIRCUIT_FIELD = null;

// Google Sheet publicada como CSV (la misma que ya usabas).
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vShPTNgVoClsfo6qXxPKgh-uKwPqKDHB8rtaxROlVk1mCZ4_7TKIML5wBxd08xOfP9Q2Gf5b5o2Fi1b/pub?gid=906394055&single=true&output=csv";

const CACHE_KEY = "nexgen_setups_v1";
const SETUP_COLUMNS = ["Track", "Tyre", "Sector 1", "Sector 2", "Sector 3", "Lap Time",
  "Wing Setup", "Brake Balance", "Suspension", "Down Force Level", "Driver", "Team"];

function readCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY));
    return Array.isArray(c) && c.length ? c : null;
  } catch { return null; }
}
function writeCache(rows) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(rows)); } catch {}
}

// Parser CSV mínimo (maneja comillas y comas dentro de celdas).
function parseCSV(text) {
  const rows = [];
  let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cur); cur = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cur); rows.push(row); row = []; cur = "";
    } else cur += ch;
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

async function fetchSheet() {
  const res = await fetch(SHEET_CSV_URL);
  if (!res.ok) throw new Error("Sheet HTTP " + res.status);
  const table = parseCSV(await res.text());
  if (table.length < 2) return null;
  const head = table[0].map(h => h.trim());
  const rows = table.slice(1)
    .map(r => {
      const o = {};
      SETUP_COLUMNS.forEach(c => { const i = head.indexOf(c); o[c] = i >= 0 ? (r[i] || "").trim() : ""; });
      return o;
    })
    .filter(r => r["Track"] && r["Lap Time"]);
  return rows.length ? rows : null;
}

// Estrategia "rápido primero, fresco después":
//  1) Pinta YA con la caché del navegador, o con data/setups.json si no hay caché.
//  2) En paralelo pide la Sheet en vivo; cuando llega, guarda caché y vuelve a pintar.
// onData(rows) puede llamarse 1 o 2 veces. La promesa rechaza solo si NO hubo datos de ninguna fuente.
function loadSetups(onData) {
  return new Promise((resolve, reject) => {
    let last = null, liveDone = false;
    const cached = readCache();
    const deliver = rows => {
      const k = JSON.stringify(rows);
      if (k === last) return;
      last = k;
      Promise.resolve(onData(rows)).catch(console.error);
    };
    if (cached) deliver(cached);

    const local = loadJSON("data/setups.json").catch(() => null);
    const live = fetchSheet().catch(e => { console.warn("Sheet en vivo no disponible:", e); return null; });

    local.then(rows => { if (rows && !cached && !liveDone) deliver(rows); });
    live.then(rows => { if (rows) { liveDone = true; writeCache(rows); deliver(rows); } });

    Promise.all([local, live]).then(() =>
      last === null ? reject(new Error("No hay datos disponibles")) : resolve());
  });
}

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
  return res.json();
}

function suggestUrl(circuitName) {
  if (!FORM_CIRCUIT_FIELD || !circuitName) return FORM_URL;
  const sep = FORM_URL.includes("?") ? "&" : "?";
  return `${FORM_URL}${sep}${FORM_CIRCUIT_FIELD}=${encodeURIComponent(circuitName)}`;
}

// Escapa texto antes de meterlo en innerHTML. Los datos vienen de un Form
// público: sin esto, cualquiera podría inyectar HTML/JS en la web.
function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, ch => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));
}

// El export trae "Team" directo. Si alguna fila vieja no lo tuviera,
// caemos a este mapeo por piloto como respaldo.
const DRIVER_TEAMS = {
  "Rodriguez": "NexGen",
  "Hoffmann": "NexGen",
  "Serizawa": "Audi",
};
function getTeam(row) {
  return row["Team"] || DRIVER_TEAMS[row["Driver"]] || "—";
}

// "Melbourne" -> "melbourne", "São Paulo" -> "sao-paulo", etc.
function trackSlug(trackName) {
  return (trackName || "")
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

// "0:24.501" o "00:24.501" -> segundos, para comparar/ordenar tiempos.
function timeToSeconds(t) {
  if (!t) return Infinity;
  const parts = String(t).split(":");
  if (parts.length !== 2) return Infinity;
  return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
}

// Agrupa todos los setups por circuito UNA sola vez (en vez de filtrar el
// array completo por cada circuito).
function groupByTrack(setups) {
  const map = new Map();
  for (const s of setups) {
    const key = trackSlug(s["Track"]);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return map;
}

// ---------- Helpers de imagen con respaldo automático ----------

// Bandera: usa el link "flag" de circuits.json (el que ya funcionaba).
// Si falla, prueba flagcdn; si también falla, muestra el código de país.
function flagFail(img) {
  if (!img.dataset.tried && img.dataset.fb) {
    img.dataset.tried = "1";
    img.src = img.dataset.fb;
    return;
  }
  img.style.display = "none";
  img.nextElementSibling.style.display = "inline";
}
function flagCell(flagUrl, countryCode, size = 28) {
  const cc = (countryCode || "").toLowerCase();
  if (!flagUrl && !cc) return "";
  const alt = cc.toUpperCase();
  const fb = cc ? `https://flagcdn.com/w80/${cc}.png` : "";
  const src = flagUrl || fb;
  return `<span class="flag-chip">` +
    `<img src="${esc(src)}" data-fb="${esc(flagUrl ? fb : "")}" class="flag-img" alt="${alt}" ` +
    `width="${size}" height="${Math.round(size * 0.75)}" loading="lazy" decoding="async" onerror="flagFail(this)">` +
    `<span class="flag-fallback" style="display:none">${alt}</span>` +
    `</span>`;
}

// Logo del equipo: assets/teams/<nombre-en-minusculas-con-guiones>.webp
function teamCell(team) {
  if (!team || team === "—") return "—";
  const slug = team.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `<span class="team-cell">` +
    `<img src="assets/teams/${esc(slug)}.webp" class="team-logo" alt="${esc(team)}" loading="lazy" decoding="async" ` +
    `onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">` +
    `<span class="team-fallback" style="display:none">${esc(team)}</span>` +
    `</span>`;
}

// Neumático: assets/tyres/<compuesto-en-minusculas>.webp
function tyreCell(tyre, color) {
  const slug = (tyre || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `<span class="tyre-chip">` +
    `<img src="assets/tyres/${esc(slug)}.webp" class="tyre-img" alt="${esc(tyre || "neumático")}" width="28" height="28" loading="lazy" decoding="async" ` +
    `onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block'">` +
    `<span class="tyre-dot" style="display:none;background:${esc(color || "#888")}"></span>` +
    `</span>`;
}
