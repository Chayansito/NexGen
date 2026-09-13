// Pegá acá el link de tu Google Form (el de "enviar", no el de "editar").
// Si tu form tiene un campo de texto para "Circuito", podés autocompletarlo
// agregando el prefill de Google Forms. Instrucciones en el README.
const FORM_URL = "https://forms.gle/REEMPLAZAR-CON-TU-FORM";

// Si armaste el prefill, poné acá el nombre del parámetro que corresponde
// al campo "Circuito" del form (ej: "entry.123456789"). Dejalo en null si
// no querés autocompletar nada.
const FORM_CIRCUIT_FIELD = null;

function suggestUrl(circuitName) {
  if (!FORM_CIRCUIT_FIELD || !circuitName) return FORM_URL;
  const sep = FORM_URL.includes("?") ? "&" : "?";
  return `${FORM_URL}${sep}${FORM_CIRCUIT_FIELD}=${encodeURIComponent(circuitName)}`;
}

// ---------- Helpers de imagen con respaldo automático ----------
// Si el archivo no existe todavía (porque no lo subiste), muestran un
// respaldo (texto o color) en vez de romper el diseño.

// Bandera del país, servida por flagcdn.com (el CDN que usa Flagpedia).
function flagCell(countryCode, size = 24) {
  if (!countryCode) return "";
  return `<img src="https://flagcdn.com/w${size}/${countryCode}.png" class="flag-img" alt="${countryCode.toUpperCase()}" width="${size}">`;
}

// Logo del equipo. Buscá el archivo en assets/teams/<nombre-en-minusculas>.png
// Si no existe, muestra el nombre del equipo en texto.
function teamCell(team) {
  if (!team) return "—";
  const slug = team.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `<span class="team-cell">` +
    `<img src="assets/teams/${slug}.png" class="team-logo" alt="${team}" ` +
    `onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">` +
    `<span class="team-fallback" style="display:none">${team}</span>` +
    `</span>`;
}

// Neumático usado. Buscá el archivo en assets/tyres/<compuesto>.png
// (ej: soft.png, medium.png, hard.png, intermediate.png, wet.png).
// Si no existe, muestra el punto de color de siempre.
function tyreCell(tyre, color) {
  const slug = tyre || "unknown";
  return `<span class="tyre-chip">` +
    `<img src="assets/tyres/${slug}.png" class="tyre-img" alt="${tyre || "neumático"}" ` +
    `onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block'">` +
    `<span class="tyre-dot" style="display:none;background:${color || "#888"}"></span>` +
    `</span>`;
}
