// Link de tu Google Form (el de "enviar", no el de "editar").
const FORM_URL = "https://forms.gle/3FJRtqHYv9FufpoC8";

// Parámetro prellenado del campo "Circuito" (ej: "entry.123456789") o null.
const FORM_CIRCUIT_FIELD = null;

// Los datos se leen del archivo local data/setups.json (servido por el CDN de
// GitHub Pages: rápido y cacheable). Ese archivo lo actualiza solo la GitHub
// Action de .github/workflows/update-setups.yml a partir de la Google Sheet.
async function loadSetups() {
  const res = await fetch("data/setups.json");
  if (!res.ok) throw new Error("No se pudo cargar data/setups.json");
  return res.json();
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

// Banderas: flagcdn sirve tamaños chicos (40px, y 80px para pantallas retina).
function flagCell(countryCode, size = 28) {
  const cc = (countryCode || "").toLowerCase();
  if (!cc) return "";
  const alt = cc.toUpperCase();
  const w = size <= 28 ? 40 : 80;
  return `<span class="flag-chip">` +
    `<img src="https://flagcdn.com/w${w}/${cc}.png" srcset="https://flagcdn.com/w${w * 2}/${cc}.png 2x" ` +
    `class="flag-img" alt="${alt}" width="${size}" height="${Math.round(size * 0.75)}" loading="lazy" decoding="async" ` +
    `onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">` +
    `<span class="flag-fallback" style="display:none">${alt}</span>` +
    `</span>`;
}

// Logo del equipo: assets/teams/<nombre-en-minusculas-con-guiones>.webp
function teamCell(team) {
  if (!team || team === "—") return "—";
  const slug = team.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `<span class="team-cell">` +
    `<img src="assets/teams/${esc(slug)}.webp" class="team-logo" alt="${esc(team)}" width="32" height="32" loading="lazy" decoding="async" ` +
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
