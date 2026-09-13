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
