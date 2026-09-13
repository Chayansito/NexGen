// Pegá acá el link de tu Google Form (el de "enviar", no el de "editar").
const FORM_URL = "https://forms.gle/3FJRtqHYv9FufpoC8";

// Si armaste el prefill de Google Forms para el campo "Circuito", poné acá
// su nombre de parámetro (ej: "entry.123456789"). Si no, dejalo en null.
const FORM_CIRCUIT_FIELD = null;

// Si publicaste tu Google Sheet de respuestas como CSV, pegá acá esa URL
// para que el sitio traiga los datos en vivo, sin que tengas que copiar y
// pegar nada a mano. Dejalo vacío ("") para seguir usando el archivo local
// data/setups.json como hasta ahora.
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vShPTNgVoClsfo6qXxPKgh-uKwPqKDHB8rtaxROlVk1mCZ4_7TKIML5wBxd08xOfP9Q2Gf5b5o2Fi1b/pub?gid=906394055&single=true&output=csv";

// Carga los setups: si hay un SHEET_CSV_URL configurado, los trae en vivo
// desde la Sheet publicada (usando PapaParse para leer el CSV). Si no,
// cae al archivo local como respaldo.
async function loadSetups() {
  if (SHEET_CSV_URL) {
    const res = await fetch(SHEET_CSV_URL);
    const csvText = await res.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    return parsed.data;
  }
  const res = await fetch("data/setups.json");
  return res.json();
}
function suggestUrl(circuitName) {
  if (!FORM_CIRCUIT_FIELD || !circuitName) return FORM_URL;
  const sep = FORM_URL.includes("?") ? "&" : "?";
  return `${FORM_URL}${sep}${FORM_CIRCUIT_FIELD}=${encodeURIComponent(circuitName)}`;
}

// El export ahora trae "Team" directo. Si alguna fila vieja no lo tuviera,
// caemos a este mapeo por piloto como respaldo.
const DRIVER_TEAMS = {
  "Rodriguez": "NexGen",
  "Hoffmann": "NexGen",
  "Serizawa": "Audi",
};
function getTeam(row) {
  return row["Team"] || DRIVER_TEAMS[row["Driver"]] || "—";
}

// Convierte "Melbourne" -> "melbourne", "São Paulo" -> "sao-paulo", etc,
// para que matchee con el id de circuits.json sin importar tildes o espacios.
function trackSlug(trackName) {
  return (trackName || "")
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // saca tildes
    .replace(/\s+/g, "-");
}

// "0:24.501" o "00:24.501" -> segundos, para poder comparar/ordenar tiempos.
function timeToSeconds(t) {
  if (!t) return Infinity;
  const parts = String(t).split(":");
  if (parts.length !== 2) return Infinity;
  return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
}

// ---------- Helpers de imagen con respaldo automático ----------

// Bandera del circuito. Usa el link directo que carguen en circuits.json
// (campo "flag"). Si por lo que sea no carga, cae a mostrar el código de
// país en texto en vez de romper el layout.
function flagCell(flagUrl, countryCode, size = 28) {
  if (!flagUrl) return "";
  const alt = (countryCode || "").toUpperCase();
  return `<span class="flag-chip">` +
    `<img src="${flagUrl}" class="flag-img" alt="${alt}" width="${size}" ` +
    `onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">` +
    `<span class="flag-fallback" style="display:none">${alt}</span>` +
    `</span>`;
}

// Logo del equipo. Buscá el archivo en assets/teams/<nombre-en-minusculas>.png
function teamCell(team) {
  if (!team || team === "—") return "—";
  const slug = team.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `<span class="team-cell">` +
    `<img src="assets/teams/${slug}.png" class="team-logo" alt="${team}" ` +
    `onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">` +
    `<span class="team-fallback" style="display:none">${team}</span>` +
    `</span>`;
}

// Neumático usado. Buscá el archivo en assets/tyres/<compuesto-en-minusculas>.png
function tyreCell(tyre, color) {
  const slug = (tyre || "unknown").toLowerCase();
  return `<span class="tyre-chip">` +
    `<img src="assets/tyres/${slug}.png" class="tyre-img" alt="${tyre || "neumático"}" ` +
    `onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block'">` +
    `<span class="tyre-dot" style="display:none;background:${color || "#888"}"></span>` +
    `</span>`;
}
