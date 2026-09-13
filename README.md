# Monoposto Setups

Sitio estático (HTML/CSS/JS puro, sin build) para compartir setups de circuitos
de un juego de F1. Página principal con la tabla general y una página por
circuito con el historial de intentos.

## Estructura

```
index.html            → tabla general (todos los circuitos)
circuit.html            → detalle de un circuito (circuit.html?id=melbourne)
css/style.css           → estilos
js/app.js               → lógica de la página principal
js/circuit.js            → lógica de la página de detalle
js/config.js             → link del Google Form + mapeo piloto→equipo
data/circuits.json       → lista fija de circuitos (id, nombre, país)
data/setups.json         → TODOS los intentos, un array plano (esto es lo que se actualiza)
assets/tracks/           → mapas de circuito (opcional), un .png por circuito
assets/teams/            → logos de equipo (opcional)
assets/tyres/            → imágenes de neumático (opcional)
```

## Reglas de nombres de archivo (¡importante!)

GitHub Pages corre en Linux, que distingue mayúsculas de minúsculas —a
diferencia de Windows—. `Melbourne.png` y `melbourne.png` son dos archivos
distintos para el servidor, aunque en tu compu Windows parezcan "el mismo
nombre". Si el nombre no es exactamente en minúsculas, la imagen no carga y
el sitio cae al texto de respaldo (por eso no se veían los logos ni los
mapas).

Regla simple: **todo en minúsculas, espacios reemplazados por guiones.**

| Circuito / Equipo | Nombre de archivo correcto |
|---|---|
| Melbourne | `melbourne.png` |
| Shanghai | `shanghai.png` |
| Suzuka | `suzuka.png` |
| NexGen | `nexgen.png` |
| Audi | `audi.png` |
| Alpine | `alpine.png` |
| Aston Martin | `aston-martin.png` |
| Haas | `haas.png` |

Ya te renombré los archivos que subiste (incluido el mapa de Suzuka, que
había quedado como `Susuka.png`) — este zip ya los trae bien. Si suman
equipos o circuitos nuevos, usá esta misma regla.

## Cómo se actualizan los datos (un solo archivo)

**No hace falta un JSON por circuito.** `data/setups.json` es un único
array con todos los intentos de todos los circuitos — el sitio los agrupa
solo por el campo `"Track"`. Cada vez que quieras actualizar el sitio:

1. Exportá tu Google Sheet completa como JSON (o pedile el export a quien
   arme el Form → Sheet).
2. Reemplazá el archivo `data/setups.json` entero por ese export.
3. Subí el cambio a GitHub. Listo — no tocás nada más.

El archivo tiene que tener exactamente estas columnas por fila (son las
mismas que ya usás):

```json
{
  "Track": "Melbourne",
  "Tyre": "Soft",
  "Sector 1": "0:24.501",
  "Sector 2": "0:15.866",
  "Sector 3": "0:29.450",
  "Lap Time": "1:09.817",
  "Wing Setup": "18",
  "Brake Balance": "6",
  "Suspension": "-8",
  "Down Force Level": "142",
  "Driver": "Hoffmann"
}
```

Importante: el valor de `"Track"` tiene que coincidir (sin importar
mayúsculas) con el `id` de ese circuito en `circuits.json` — por eso ahí los
ids son `"melbourne"`, `"shanghai"`, etc., iguales a como los nombra el Form.

El campo **`Team` ya viene en el export** (lo agregaron al Form) — el sitio
lo usa directo. Si alguna vez falta en una fila vieja, cae al mapeo
`DRIVER_TEAMS` en `js/config.js` como respaldo:

```js
const DRIVER_TEAMS = {
  "Rodriguez": "NG",
  "Hoffmann": "NG",
  "Serizawa": "Audi",
  "NuevoPiloto": "SuEquipo",
};
```

### Circuitos nuevos

Si agregan un circuito que no está en la lista, sumalo en `circuits.json`
con su `id` (en minúsculas, igual a como lo escriben en el Form), nombre y
código de país ISO de 2 letras.

### (Opcional) Automatizar sin copiar y pegar

Si más adelante quieren que el sitio se actualice solo sin tener que pisar
`setups.json` a mano: publiquen la Google Sheet como CSV (Archivo →
Compartir → Publicar en la web → formato CSV) y cambien el `fetch("data/setups.json")`
de `app.js`/`circuit.js` por un `fetch()` a esa URL de CSV, parseándolo con
algo como PapaParse. Lo dejamos afuera de esta versión para que decidan
ustedes qué respuestas del form quedan publicadas.

## Cómo publicarlo (GitHub Pages)

1. Creá un repo en GitHub y subí todo el contenido de esta carpeta.
2. Andá a **Settings → Pages** → en "Source" elegí la rama `main` y la carpeta `/root`.
3. En un par de minutos el sitio queda online en `https://tu-usuario.github.io/tu-repo/`.

## Cómo dejar que otros sugieran setups

1. Creá un **Google Form** con campos: Circuito, Piloto, Neumático,
   Ala, Freno, Suspensión, Downforce, Sector 1/2/3, Tiempo de vuelta.
2. Conectá el Form a una **Google Sheet** (Respuestas → ícono de Sheets).
3. Pegá el link de "enviar formulario" en `js/config.js`, en `FORM_URL`.
   El botón "Sugerir setup" de cada circuito ya lo abre.
4. Vos revisás las respuestas y las incorporás al export cuando las
   aprobás, siguiendo el paso anterior.

### (Opcional) Autocompletar el circuito en el form

1. En Google Forms: menú (⋮) → **"Obtener enlace con respuestas prellenadas"**.
2. Completá el campo Circuito con un texto de prueba y generá el link.
3. Copiá el `entry.123456789` que aparece en la URL generada.
4. Pegalo en `js/config.js`, en `FORM_CIRCUIT_FIELD`.

## Banderas

Se traen automáticamente desde flagcdn.com (el CDN de Flagpedia) usando el
`countryCode` de `circuits.json` — no hay que subir nada. Si por algún
motivo no cargan (sin conexión, red bloqueada), el sitio muestra el código
de país en texto como respaldo en vez de romper el layout. Si después de
subir esta versión siguen sin verse, probá:
- Refrescar forzando que no use caché (Ctrl/Cmd + Shift + R).
- Confirmar que el repo en GitHub tiene esta versión de `circuits.json`
  (con `"countryCode"`) y de `js/config.js` — versiones viejas del sitio
  usaban emoji de bandera, que en Windows se ve como texto ("AU") en vez
  de la imagen.

## Logos de equipo e imágenes de neumático

- Equipo: `assets/teams/<equipo-en-minusculas>.png` (ej. `ng.png`).
- Neumático: `assets/tyres/<compuesto-en-minusculas>.png` (ej. `soft.png`,
  `intermediate.png`).

Mientras no subas el archivo, el sitio muestra el texto o el punto de color
de respaldo — no hace falta subir todo de una.

## Mapas de circuito

`assets/tracks/<id-del-circuito>.png`. Si no existe, la página de detalle
no muestra el mapa, sin romperse.

## Mobile

Las tablas son más anchas que una pantalla de celular (11 columnas en la
vista de circuito), así que en mobile quedan con scroll horizontal propio
en vez de romper el resto de la página o esconder columnas.
