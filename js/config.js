// Pegá acá el link de tu Google Form (el de "enviar", no el de "editar").
const FORM_URL = "https://forms.gle/REEMPLAZAR-CON-TU-FORM";

// Si armaste el prefill de Google Forms para el campo "Circuito", poné acá
// su nombre de parámetro (ej: "entry.123456789"). Si no, dejalo en null.
const FORM_CIRCUIT_FIELD = null;

function suggestUrl(circuitName) {
  if (!FORM_CIRCUIT_FIELD || !circuitName) return FORM_URL;
  const sep = FORM_URL.includes("?") ? "&" : "?";
  return `${FORM_URL}${sep}${FORM_CIRCUIT_FIELD}=${encodeURIComponent(circuitName)}`;
}

// El export de setups no trae equipo, así que lo sacamos del piloto.
// Agregá acá cualquier piloto nuevo que sumen.
const DRIVER_TEAMS = {
  "Rodriguez": "NG",
  "Hoffmann": "NG",
  "Serizawa": "Audi",
};
function teamFor(driver) {
  return DRIVER_TEAMS[driver] || "—";
}

// Convierte "Melbourne" -> "melbourne" para que matchee con el id de
// circuits.json. Si en algún momento el nombre del circuito en el Form
// no coincide con el id, se puede mapear acá también.
function trackSlug(trackName) {
  return (trackName || "").trim().toLowerCase();
}

// "0:24.501" o "00:24.501" -> segundos, para poder comparar/ordenar tiempos.
function timeToSeconds(t) {
  if (!t) return Infinity;
  const parts = String(t).split(":");
  if (parts.length !== 2) return Infinity;
  return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
}

// ---------- Helpers de imagen con respaldo automático ----------

// Bandera del país, servida por flagcdn.com (el CDN que usa Flagpedia).
// Si por lo que sea la imagen no carga (ej. sin internet, bloqueo de red),
// cae a mostrar el código de país en texto en vez de romper el layout.
function flagCell(countryCode, size = 24) {
  if (!countryCode) return "";
  const code = countryCode.toLowerCase();
  return `<span class="flag-chip">` +
    `<img src="https://flagcdn.com/w${size}/${code}.png" class="flag-img" alt="${code.toUpperCase()}" width="${size}" ` +
    `onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">` +
    `<span class="flag-fallback" style="display:none">${code.toUpperCase()}</span>` +
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
