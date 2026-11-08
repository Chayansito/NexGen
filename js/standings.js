// Datos del campeonato (data/F1_2026.json). Se lee tal cual lo exportas:
//  - pilotos: filas con TEAM y PTS, más una columna por carrera (GP1, SR1, ...)
//  - constructores: filas después del encabezado "TEAM / PTS", con el total en field3
// En cada carrera el valor es la cantidad de PUNTOS sumados; "DNF" = abandono y
// "-" = sin puntos. La posición se deduce de los puntos.

const OUR_TEAM = "NexGen";

// Nacionalidad de los pilotos de NexGen (texto + bandera). La clave es el nombre
// tal cual aparece en F1_2026.json.
const DRIVER_INFO = {
  "Gabriel Rodriguez": { nationality: "Mexicano", flag: "https://flagpedia.net/data/flags/w580/mx.webp", cc: "mx" },
  "Dani Hoffmann":     { nationality: "Alemana",  flag: "https://flagpedia.net/data/flags/w580/de.webp", cc: "de" },
};

function nationalityLine(name) {
  const i = DRIVER_INFO[name];
  return i ? `<span class="nat">${flagCell(i.flag, i.cc, 22)}<span>${esc(i.nationality)}</span></span>` : "";
}

// "Dani Hoffmann" -> "Hoffmann" (nombre del archivo de la foto) / "DH" (respaldo)
function surname(name) { return name.trim().split(/\s+/).pop(); }
function initials(name) { return name.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase(); }

const GP_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1];

function raceLabel(id) {
  const n = id.slice(2);
  return id.startsWith("SR") ? `Sprint ${n}` : `GP ${n}`;
}

// Convierte el valor de una celda en { kind, pts, pos }.
function parseResult(raceId, value) {
  if (value === "DNF") return { kind: "dnf" };
  const pts = parseInt(value, 10);
  if (Number.isNaN(pts)) return { kind: "none" };
  const table = raceId.startsWith("SR") ? SPRINT_POINTS : GP_POINTS;
  const i = table.indexOf(pts);
  return { kind: "pts", pts, pos: i >= 0 ? i + 1 : null };
}

function parseStandings(raw) {
  const drivers = raw
    .filter(r => r.TEAM && r.PTS !== undefined)
    .map(r => ({ ...r, pts: parseInt(r.PTS, 10) || 0 }));

  const raceIds = drivers.length ? Object.keys(drivers[0]).filter(k => /^(GP|SR)\d+$/.test(k)) : [];
  const teamNames = [...new Set(drivers.map(d => d.TEAM))];

  // "Oracle Red Bull Racing" -> "Red Bull" (el nombre corto que usan los pilotos)
  const shortName = full => teamNames.find(t => full.toLowerCase().includes(t.toLowerCase())) || full;
  const constructors = raw
    .filter(r => r.field3 !== undefined && !r.TEAM && !r.field1 && r.DRIVER !== "TEAM")
    .map(r => ({ name: shortName(r.DRIVER), fullName: r.DRIVER, pts: parseInt(r.field3, 10) || 0 }));

  // Desempate como en F1: más victorias, luego más segundos puestos, etc. (solo GP)
  const gpIds = raceIds.filter(id => id.startsWith("GP"));
  const counts = d => GP_POINTS.map(p => gpIds.filter(id => parseInt(d[id], 10) === p).length);
  const byCountback = (a, b) => {
    const ca = counts(a), cb = counts(b);
    for (let i = 0; i < ca.length; i++) if (ca[i] !== cb[i]) return cb[i] - ca[i];
    return 0;
  };

  const rankedDrivers = [...drivers].sort((a, b) => b.pts - a.pts || byCountback(a, b));
  const rankedConstructors = [...constructors].sort((a, b) => b.pts - a.pts);
  return { drivers: rankedDrivers, constructors: rankedConstructors, raceIds };
}

// Calendario (data/GPs.json): circuito y bandera de cada carrera, por id (GP1, SR1...).
function loadStandings() {
  return Promise.all([loadJSON("data/F1_2026.json"), loadJSON("data/GPs.json").catch(() => [])])
    .then(([raw, gps]) => ({
      ...parseStandings(raw),
      calendar: Object.fromEntries(gps.map(g => [g.GP, { track: g.Track, flag: g.Flag }])),
    }));
}

function ordinal(n) { return `${n}º`; }
