# Monoposto Setups

Sitio estático (HTML/CSS/JS puro, sin build) para compartir setups de circuitos
de un juego de F1. Página principal con la tabla general y una página por
circuito con el historial de intentos, tal como el spreadsheet que ya usaban.

## Estructura

```
index.html          → tabla general (todos los circuitos)
circuit.html         → detalle de un circuito (circuit.html?id=melbourne)
css/style.css        → estilos
js/app.js            → lógica de la página principal
js/circuit.js         → lógica de la página de detalle
js/config.js          → acá va el link de tu Google Form
data/circuits.json    → una fila por circuito (lo que se ve en index)
data/setups.json      → intentos por circuito (lo que se ve en circuit.html)
assets/tracks/        → mapas de circuito (opcional), un .png por circuito
```

## Cómo publicarlo (GitHub Pages)

1. Creá un repo en GitHub y subí todo el contenido de esta carpeta.
2. Andá a **Settings → Pages** → en "Source" elegí la rama `main` y la carpeta `/root`.
3. En un par de minutos el sitio queda online en `https://tu-usuario.github.io/tu-repo/`.

No hace falta backend ni build: es HTML plano, GitHub Pages lo sirve tal cual.

## Cómo actualizar los datos vos mismo

Editá directamente `data/circuits.json` (fila resumen por circuito) y
`data/setups.json` (intentos detallados). Son JSON simples, se pueden editar
desde GitHub mismo sin clonar nada: abrí el archivo en GitHub → lápiz de
editar → "Commit changes".

## Cómo dejar que otros sugieran setups (sin que editen el repo)

La forma más simple, ya que venís de un spreadsheet:

1. Creá un **Google Form** con campos como: Circuito, Piloto, Ala delantera,
   Ala trasera, Freno, Downforce, Sector 1/2/3, Tiempo de vuelta.
2. Conectá el Form a un **Google Sheet** (Respuestas → ícono de Sheets).
3. Pegá el link de "enviar formulario" en `js/config.js`, en `FORM_URL`.
   Con eso, el botón "Sugerir setup" de cada circuito ya abre el form.

Con esto la gente sugiere setups sin tocar el repo, y el botón "Sugerir setup"
de cada página ya les abre el formulario. Vos revisás las respuestas en la
Sheet y las pasás a mano a `setups.json` cuando las aprobás — así el sitio
nunca muestra basura sin filtrar.

### (Opcional) Autocompletar el circuito en el form

Si querés que al hacer clic en "Sugerir setup" desde Melbourne el form ya
venga con "Melbourne, Australia" precargado:

1. En Google Forms, abrí el form → menú (⋮) → **"Obtener enlace con
   respuestas prellenadas"**.
2. Completá el campo Circuito con cualquier texto de prueba y generá el link.
3. Ese link va a tener algo como `...&entry.123456789=texto`. Copiá el
   `entry.123456789`.
4. Pegalo en `js/config.js`, en `FORM_CIRCUIT_FIELD`.

### (Opcional) Traer los datos directo de la Sheet, sin copiar a mano

Si en algún momento quieren automatizar el paso de "aprobar y pasar a
setups.json", se puede publicar la Sheet como CSV (Archivo → Compartir →
Publicar en la web → formato CSV) y hacer que `app.js`/`circuit.js` la lean
con `fetch()` en vez de leer el JSON local. Lo dejé afuera de esta primera
versión para que ustedes controlen qué setups se publican, pero es un cambio
chico si más adelante lo quieren así.

## Cargar mapas de circuito

Poné una imagen en `assets/tracks/<id-del-circuito>.png` (mismo id que usan
en `circuits.json`, ej. `melbourne.png`). Si no existe, la página de detalle
simplemente no muestra el mapa, sin romperse.
