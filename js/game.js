// =============================================================
// GRAN COPA PIXEL — Hito 3
// Menú, 1 y 2 jugadores en pantalla compartida, vueltas + cronómetro.
// Se construye ALREDEDOR de la física/cámara/pista existentes (no se tocan).
// =============================================================

import * as Pista from "./pista.js";

// =============================================================
// MATRIZ del sprite (compartida por AMBOS autos) + dos PALETAS de equipo.
// Los dos autos usan la MISMA matriz; SOLO cambia la paleta de colores.
// =============================================================
const MATRIZ_AUTO = [
  "0003344433000", // alerón delantero: extremos (3), centro (4)
  "0023344433200",
  "0331144411330",
  "0110011100110", // morro angosto
  "0000011100000",
  "0222011102220", // ruedas delanteras (2=negro) + morro
  "0222011102220",
  "0222211122220",
  "0222011102220",
  "0222011102220",
  "0000111110000", // chasis se ensancha
  "0001122211000", // cockpit: halo negro (2)
  "0001122211000",
  "0001144411000", // casco (4)
  "0001144411000",
  "0001133311000", // casco (3)
  "0001133311000",
  "0000111110000", // chasis trasero
  "0000111110000",
  "0222011102220", // ruedas traseras
  "0222211122220",
  "0222011102220",
  "0222011102220",
  "0000155510000", // difusor (5)
];

// Índices: 1=chasis(EQUIPO) · 2=negro(ruedas/halo) · 3=acento A · 4=acento B · 5=difusor
const PALETA_FERRARI = [
  null,        // 0 transparente
  "#d62828",   // 1 ROJO Ferrari (chasis)
  "#0d0d11",   // 2 negro (ruedas/halo)
  "#f5f5f5",   // 3 blanco (alerón/casco)
  "#f0c43c",   // 4 amarillo (alerón/casco)
  "#e6e6ea",   // 5 blanco (difusor)
];
const PALETA_MERCEDES = [
  null,        // 0 transparente
  "#b5bcc4",   // 1 PLATA Mercedes (chasis)
  "#0d0d11",   // 2 negro (ruedas/halo)
  "#00d2be",   // 3 turquesa Petronas (alerón/casco)
  "#0a3d3a",   // 4 turquesa oscuro (alerón/casco)
  "#e6e6ea",   // 5 blanco (difusor)
];

// Construye el canvas del sprite con la paleta dada (misma matriz para todos).
// La matriz está "morro arriba"; se rota 90° para que el morro mire a +X.
function crearSpriteAuto(paleta) {
  const filas = MATRIZ_AUTO.length;
  const cols = MATRIZ_AUTO[0].length;
  const s = document.createElement("canvas");
  s.width = filas;
  s.height = cols;
  const c = s.getContext("2d");
  c.imageSmoothingEnabled = false;
  for (let r = 0; r < filas; r++) {
    for (let col = 0; col < cols; col++) {
      const color = paleta[MATRIZ_AUTO[r].charCodeAt(col) - 48];
      if (!color) continue;
      c.fillStyle = color;
      c.fillRect(filas - 1 - r, col, 1, 1); // rotación 90° horaria
    }
  }
  return s;
}

const SPRITE_W = MATRIZ_AUTO.length;
const SPRITE_H = MATRIZ_AUTO[0].length;
const ESCALA_SPRITE = 2;

// =============================================================
// RESOLUCIÓN BASE + ESCALADO ENTERO (sin cambios)
// =============================================================
const SCALE = 2;
const BASE_W = 640;
const BASE_H = 360;

const canvas = document.getElementById("pista");
canvas.width = BASE_W * SCALE;   // 1280
canvas.height = BASE_H * SCALE;  // 720
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const buffer = document.createElement("canvas");
buffer.width = BASE_W;
buffer.height = BASE_H;
const bctx = buffer.getContext("2d");
bctx.imageSmoothingEnabled = false;

// Pre-render de la pista ENTERA a un canvas (es estática). Sirve para blitear
// la región visible (1 jugador) o todo el mundo escalado a caber (2 jugadores).
let mundoCanvas;
function prerenderMundo() {
  mundoCanvas = document.createElement("canvas");
  mundoCanvas.width = Pista.ANCHO_MUNDO;
  mundoCanvas.height = Pista.ALTO_MUNDO;
  const mc = mundoCanvas.getContext("2d");
  mc.imageSmoothingEnabled = false;
  for (let r = 0; r < Pista.FILAS; r++) {
    for (let c = 0; c < Pista.COLS; c++) {
      Pista.tipoEnCelda(c, r).dibujar(mc, c * Pista.TILE, r * Pista.TILE, c, r);
    }
  }
}

// =============================================================
// FÍSICA (idéntica a la anterior; SOLO parametrizada por auto y controles)
// =============================================================
const FISICA = {
  ACELERACION: 560,
  ACELERACION_REVERSA: 190,
  VEL_MAX: 430,
  VEL_MAX_REVERSA: 100,
  FRICCION: 2.2,
  GIRO_BASE: 3.4,
  VEL_PARA_GIRAR: 6,
  AGARRE: 6.5,
};

function actualizarAuto(car, dt) {
  const C = car.ctrl;
  const dirX = Math.cos(car.angulo);
  const dirY = Math.sin(car.angulo);

  if (presionada(C.up)) {
    car.vx += dirX * FISICA.ACELERACION * dt;
    car.vy += dirY * FISICA.ACELERACION * dt;
  } else if (presionada(C.down)) {
    car.vx -= dirX * FISICA.ACELERACION_REVERSA * dt;
    car.vy -= dirY * FISICA.ACELERACION_REVERSA * dt;
  }

  const factorFriccion = 1 - FISICA.FRICCION * dt;
  car.vx *= factorFriccion;
  car.vy *= factorFriccion;

  const rapidez = Math.hypot(car.vx, car.vy);
  const sentido = car.vx * dirX + car.vy * dirY;
  const marchaAdelante = sentido >= 0;

  const topMax = marchaAdelante ? FISICA.VEL_MAX : FISICA.VEL_MAX_REVERSA;
  if (rapidez > topMax) {
    const escala = topMax / rapidez;
    car.vx *= escala;
    car.vy *= escala;
  }

  if (rapidez > FISICA.VEL_PARA_GIRAR) {
    const factorVel = Math.min(rapidez / FISICA.VEL_MAX, 1);
    const giro = FISICA.GIRO_BASE * factorVel * dt;
    const signo = marchaAdelante ? 1 : -1;
    if (presionada(C.left)) car.angulo -= giro * signo;
    if (presionada(C.right)) car.angulo += giro * signo;
  }

  if (rapidez > 0.001) {
    const objetivoX = dirX * rapidez * (marchaAdelante ? 1 : -1);
    const objetivoY = dirY * rapidez * (marchaAdelante ? 1 : -1);
    const t = Math.min(FISICA.AGARRE * dt, 1);
    car.vx += (objetivoX - car.vx) * t;
    car.vy += (objetivoY - car.vy) * t;
  }

  // Penalización de superficie (lee frenoExtra del tile bajo el auto).
  const sup = Pista.tipoEnPunto(car.x, car.y);
  if (sup.frenoExtra > 0) {
    const f = Math.max(0, 1 - sup.frenoExtra * dt);
    car.vx *= f;
    car.vy *= f;
  }

  // Colisión con muros (chequeo ANTES de mover, eje por eje).
  const COL_R = 12;
  const REBOTE_MURO = 0.3;
  const pasoX = car.vx * dt;
  const sondaX = car.x + pasoX + Math.sign(pasoX) * COL_R;
  if (Pista.esSolido(sondaX, car.y)) car.vx = -car.vx * REBOTE_MURO;
  else car.x += pasoX;
  const pasoY = car.vy * dt;
  const sondaY = car.y + pasoY + Math.sign(pasoY) * COL_R;
  if (Pista.esSolido(car.x, sondaY)) car.vy = -car.vy * REBOTE_MURO;
  else car.y += pasoY;

  car.x = Math.max(COL_R, Math.min(Pista.ANCHO_MUNDO - COL_R, car.x));
  car.y = Math.max(COL_R, Math.min(Pista.ALTO_MUNDO - COL_R, car.y));
}

// =============================================================
// INPUT — mapa de teclas + controles por jugador
// =============================================================
const teclas = {};
function presionada(k) {
  if (teclas[k]) return true;
  if (k.length === 1) return !!teclas[k.toUpperCase()] || !!teclas[k.toLowerCase()];
  return false;
}
const CONTROLES_P1 = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" };
const CONTROLES_P2 = { up: "w", down: "s", left: "a", right: "d" };

window.addEventListener("keydown", (e) => {
  teclas[e.key] = true;
  if (e.key.startsWith("Arrow") || e.key === " ") e.preventDefault();
  if (e.repeat) return;
  if (estado === ESTADO.MENU) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "w" || e.key === "s") menuSel = 1 - menuSel;
    else if (e.key === "1") estado = ESTADO.SELECCION;               // 1 jugador → elegir escudería
    else if (e.key === "2") iniciarJuego(2);
    else if (e.key === "Enter") { if (menuSel === 0) estado = ESTADO.SELECCION; else iniciarJuego(2); }
  } else if (estado === ESTADO.SELECCION) {
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "arrowright" || k === "arrowup" || k === "arrowdown" || k === "a" || k === "d" || k === "w" || k === "s")
      selEscuderia = 1 - selEscuderia;
    else if (e.key === "Enter") iniciarJuego(1);
    else if (e.key === "Escape") estado = ESTADO.MENU;               // volver al menú
  } else if (estado === ESTADO.JUGANDO) {
    if (e.key === "Escape") { pausaSel = 0; estado = ESTADO.PAUSA; } // pausar
  } else if (estado === ESTADO.PAUSA) {
    if (e.key === "Escape") estado = ESTADO.JUGANDO;                 // ESC reanuda
    else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "w" || e.key === "s") pausaSel = 1 - pausaSel;
    else if (e.key === "m" || e.key === "M") estado = ESTADO.MENU;   // volver al menú
    else if (e.key === "Enter") estado = (pausaSel === 0) ? ESTADO.JUGANDO : ESTADO.MENU;
  } else if (estado === ESTADO.RESULTADOS) {
    if (e.key === "Enter" || e.key === " ") estado = ESTADO.MENU;
  }
});
window.addEventListener("keyup", (e) => { teclas[e.key] = false; });

// =============================================================
// MÁQUINA DE ESTADOS DE PANTALLA
// =============================================================
const ESTADO = {
  MENU: "MENU",
  SELECCION: "SELECCION",   // elegir escudería (solo 1 jugador)
  JUGANDO: "JUGANDO",
  PAUSA: "PAUSA",
  RESULTADOS: "RESULTADOS",
};
let estado = ESTADO.MENU;
let modo = 1;        // 1 o 2 jugadores
let menuSel = 0;     // 0 = 1 jugador, 1 = 2 jugadores
let selEscuderia = 0;// escudería elegida en 1 jugador (índice en ESCUDERIAS)
let pausaSel = 0;    // 0 = Continuar, 1 = Volver al menú
let players = [];    // autos en juego
let ganador = -1;    // índice del primer auto en terminar

// =============================================================
// VUELTAS + CRONÓMETRO (con checkpoint anti-trampa)
// =============================================================
const META_VUELTAS = 3;
// Línea de meta (mundo): col 24, filas 5-7 → rectángulo.
const META = { x0: 24 * Pista.TILE, x1: 25 * Pista.TILE, y0: 5 * Pista.TILE, y1: 8 * Pista.TILE };
// Checkpoint en el lado OPUESTO (zona de la horquilla, izquierda).
const CHK = { x0: 6 * Pista.TILE, x1: 13 * Pista.TILE, y0: 15 * Pista.TILE, y1: 28 * Pista.TILE };
const dentro = (c, r) => c.x >= r.x0 && c.x < r.x1 && c.y >= r.y0 && c.y < r.y1;

function actualizarVueltas(car, dt) {
  car.tiempoVuelta += dt;
  car.tiempoTotal += dt;
  if (dentro(car, CHK)) car.checkpoint = true; // tocó el otro lado del circuito

  const enMeta = dentro(car, META);
  if (enMeta && !car.enMetaPrev) {              // flanco: acaba de cruzar la meta
    if (car.checkpoint) {                        // ...y SÍ pasó el checkpoint → vuelta válida
      car.mejorVuelta = car.mejorVuelta == null ? car.tiempoVuelta : Math.min(car.mejorVuelta, car.tiempoVuelta);
      car.vueltas++;
      car.tiempoVuelta = 0;
      car.checkpoint = false;                    // hay que volver a tocarlo para la próxima
      if (car.vueltas >= META_VUELTAS) {
        car.terminado = true;
        if (ganador < 0) ganador = players.indexOf(car);
      }
    } else {
      car.tiempoVuelta = 0;                       // largada o cruce sin dar la vuelta → reinicia, NO cuenta
    }
  }
  car.enMetaPrev = enMeta;
}

// =============================================================
// ARRANQUE DE PARTIDA
// =============================================================
// Escuderías disponibles. Mismas paletas que ya existían; cada una tiene su
// color de HUD y un color de MARCADOR (el indicador que va sobre el auto).
// El sprite se pre-construye una vez (en init) y se reutiliza.
const ESCUDERIAS = [
  { nombre: "FERRARI", paleta: PALETA_FERRARI, colorHUD: "#e1262d", marcador: "#e1262d", sprite: null },
  { nombre: "MERCEDES", paleta: PALETA_MERCEDES, colorHUD: "#c8ccd2", marcador: "#00d2be", sprite: null },
];

function crearAuto(esc, ctrl, dx, dy) {
  return {
    x: Pista.SALIDA.x + dx, y: Pista.SALIDA.y + dy, angulo: Pista.SALIDA.angulo,
    vx: 0, vy: 0,
    ctrl, colorHUD: esc.colorHUD, marcador: esc.marcador, nombre: esc.nombre,
    sprite: esc.sprite,
    vueltas: 0, checkpoint: false, enMetaPrev: false,
    tiempoVuelta: 0, mejorVuelta: null, tiempoTotal: 0, terminado: false,
  };
}

function iniciarJuego(m) {
  modo = m;
  ganador = -1;
  players = [];
  if (m === 1) {
    players.push(crearAuto(ESCUDERIAS[selEscuderia], CONTROLES_P1, 0, 0));
  } else {
    // Lado a lado en la recta de salida (caben en el ancho de pista).
    players.push(crearAuto(ESCUDERIAS[0], CONTROLES_P1, 0, -18)); // P1 Ferrari
    players.push(crearAuto(ESCUDERIAS[1], CONTROLES_P2, 0, 18));  // P2 Mercedes
  }
  estado = ESTADO.JUGANDO;
}

function actualizarJuego(dt) {
  for (const p of players) {
    if (!p.terminado) {
      actualizarAuto(p, dt);
      actualizarVueltas(p, dt);
    }
  }
  if (ganador >= 0) estado = ESTADO.RESULTADOS; // el primero en terminar gana
}

// =============================================================
// CÁMARA / VISTA
//   1 jugador: cámara que SIGUE al auto (igual que antes), zoom 1.
//   2 jugadores: cámara FIJA que muestra TODA la pista (zoom a caber).
//     Es la opción más simple que garantiza ver SIEMPRE a los dos autos:
//     la pista es estática y entra entera, así no hay que decidir a quién
//     seguir ni partir la pantalla. Pierden tamaño, pero quedan ambos a la
//     vista, que es lo que importa en pantalla compartida.
// =============================================================
// Bounding box (mundo, px) que ENCIERRA solo el trazado (asfalto, curb,
// tierra, meta) + un margen chico. Recortar el césped/barrera exterior hace
// que la pista LLENE mejor el canvas en 2 jugadores. Se calcula una vez.
let trackBox = null;
function calcularTrackBox() {
  let c0 = Pista.COLS, r0 = Pista.FILAS, c1 = 0, r1 = 0;
  const esTrazado = (ch) => ".:ctM".includes(ch);
  for (let r = 0; r < Pista.FILAS; r++) {
    for (let c = 0; c < Pista.COLS; c++) {
      if (esTrazado(Pista.MAPA[r][c])) {
        if (c < c0) c0 = c; if (c > c1) c1 = c;
        if (r < r0) r0 = r; if (r > r1) r1 = r;
      }
    }
  }
  const pad = 1; // 1 tile de aire para no pegar el trazado al borde
  c0 = Math.max(0, c0 - pad); r0 = Math.max(0, r0 - pad);
  c1 = Math.min(Pista.COLS - 1, c1 + pad); r1 = Math.min(Pista.FILAS - 1, r1 + pad);
  trackBox = { x0: c0 * Pista.TILE, y0: r0 * Pista.TILE, w: (c1 - c0 + 1) * Pista.TILE, h: (r1 - r0 + 1) * Pista.TILE };
}

// Devuelve la transformación mundo→pantalla del frame.
//   pantalla = (mundo − cam) * zoom + off    (vale para 1 y 2 jugadores)
//   el blit usa la región fuente (cam, srcW×srcH) escalada a (off, *zoom).
function calcularVista() {
  if (modo === 1) {
    let cx = Math.round(players[0].x - BASE_W / 2);
    let cy = Math.round(players[0].y - BASE_H / 2);
    cx = Math.max(0, Math.min(Pista.ANCHO_MUNDO - BASE_W, cx));
    cy = Math.max(0, Math.min(Pista.ALTO_MUNDO - BASE_H, cy));
    return { zoom: 1, camX: cx, camY: cy, offX: 0, offY: 0, srcW: BASE_W, srcH: BASE_H };
  }
  // 2 jugadores: encuadrar SOLO el bounding box del trazado (no todo el mundo).
  const b = trackBox;
  const zoom = Math.min(BASE_W / b.w, BASE_H / b.h);
  const offX = Math.floor((BASE_W - b.w * zoom) / 2);
  const offY = Math.floor((BASE_H - b.h * zoom) / 2);
  return { zoom, camX: b.x0, camY: b.y0, offX, offY, srcW: b.w, srcH: b.h };
}

// =============================================================
// RENDER
// =============================================================
function dibujarMundoYAutos() {
  bctx.fillStyle = "#0c0e16";
  bctx.fillRect(0, 0, BASE_W, BASE_H);
  const v = calcularVista();
  // Blit de la región fuente del mundo pre-renderizado, escalada al destino.
  bctx.drawImage(
    mundoCanvas, v.camX, v.camY, v.srcW, v.srcH,
    v.offX, v.offY, Math.round(v.srcW * v.zoom), Math.round(v.srcH * v.zoom)
  );
  for (const p of players) dibujarAutoEn(p, v);
}

// Triángulo apuntando hacia abajo, pixel-perfect (filas de fillRect).
function caret(cx, top, color) {
  bctx.fillStyle = "#0d0d11"; // contorno
  for (let i = 0; i < 5; i++) bctx.fillRect(cx - (4 - i), top + i, 9 - 2 * i, 1);
  bctx.fillStyle = color;
  for (let i = 0; i < 4; i++) bctx.fillRect(cx - (3 - i), top + 1 + i, 7 - 2 * i, 1);
}

function dibujarAutoEn(car, v) {
  const sw = SPRITE_W * ESCALA_SPRITE * v.zoom;
  const sh = SPRITE_H * ESCALA_SPRITE * v.zoom;
  const px = Math.floor((car.x - v.camX) * v.zoom + v.offX);
  const py = Math.floor((car.y - v.camY) * v.zoom + v.offY);
  bctx.save();
  bctx.translate(px, py);
  bctx.rotate(car.angulo);
  bctx.drawImage(car.sprite, -sw / 2, -sh / 2, sw, sh);
  bctx.restore();
  // En 2 jugadores los autos se ven chicos: marcador de color (tamaño fijo en
  // pantalla, no escalado) encima de cada uno para ubicarlo de un vistazo.
  if (v.zoom < 1) caret(px, py - 15, car.marcador);
}

// Texto con sombra dura (look 16 bits) sobre el canvas principal.
function texto(t, x, y, size, color, align = "left") {
  ctx.font = `bold ${size}px 'Courier New', monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  const o = Math.max(2, Math.round(size / 12));
  ctx.fillStyle = "#000";
  ctx.fillText(t, x + o, y + o);
  ctx.fillStyle = color;
  ctx.fillText(t, x, y);
}

function fmt(s) {
  if (s == null) return "--:--.--";
  const t = Math.max(0, s);
  const m = Math.floor(t / 60);
  const sec = Math.floor(t % 60);
  const cc = Math.floor((t * 100) % 100);
  return `${m}:${String(sec).padStart(2, "0")}.${String(cc).padStart(2, "0")}`;
}

function dibujarMenu() {
  ctx.fillStyle = "#0c0e16";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  texto("GRAN COPA PIXEL", canvas.width / 2, 170, 60, "#ffd23f", "center");
  texto("- circuito de campo -", canvas.width / 2, 210, 20, "#8a93b5", "center");

  const opts = ["1 JUGADOR", "2 JUGADORES"];
  for (let i = 0; i < 2; i++) {
    const sel = menuSel === i;
    const y = 320 + i * 78;
    if (sel) {
      ctx.fillStyle = "#1d2b53";
      ctx.fillRect(canvas.width / 2 - 220, y - 40, 440, 58);
      ctx.strokeStyle = "#ffd23f";
      ctx.lineWidth = 4;
      ctx.strokeRect(canvas.width / 2 - 220, y - 40, 440, 58);
    }
    texto(opts[i], canvas.width / 2, y, 32, sel ? "#ffd23f" : "#c8ccd2", "center");
  }
  texto("Flechas + ENTER   ·   o teclas 1 / 2", canvas.width / 2, 540, 18, "#8a93b5", "center");
  texto("P1 FERRARI: Flechas    P2 MERCEDES: W A S D", canvas.width / 2, 580, 18, "#8a93b5", "center");
}

function panelJugador(p, x, align) {
  texto(p.nombre, x, 36, 24, p.colorHUD, align);
  texto(`VUELTA ${Math.min(p.vueltas + 1, META_VUELTAS)}/${META_VUELTAS}`, x, 64, 20, "#ffffff", align);
  texto(fmt(p.tiempoVuelta), x, 92, 22, "#ffffff", align);
  texto(`MEJOR ${fmt(p.mejorVuelta)}`, x, 116, 17, "#ffd23f", align);
}

function dibujarHUD() {
  panelJugador(players[0], 24, "left");
  if (modo === 2) panelJugador(players[1], canvas.width - 24, "right");
}

function dibujarResultados() {
  ctx.fillStyle = "rgba(8,10,18,0.82)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  texto("RESULTADOS", canvas.width / 2, 150, 52, "#ffd23f", "center");
  if (modo === 1) {
    const p = players[0];
    texto(p.nombre, canvas.width / 2, 270, 32, p.colorHUD, "center");
    texto(`MEJOR VUELTA   ${fmt(p.mejorVuelta)}`, canvas.width / 2, 330, 26, "#ffffff", "center");
    texto(`TIEMPO TOTAL   ${fmt(p.tiempoTotal)}`, canvas.width / 2, 372, 22, "#c8ccd2", "center");
  } else {
    for (let i = 0; i < 2; i++) {
      const p = players[i];
      const x = canvas.width * (i === 0 ? 0.30 : 0.70);
      texto(p.nombre, x, 260, 28, p.colorHUD, "center");
      texto("MEJOR VUELTA", x, 300, 16, "#c8ccd2", "center");
      texto(fmt(p.mejorVuelta), x, 332, 28, "#ffffff", "center");
    }
    const g = players[ganador];
    texto(`GANADOR: ${g.nombre}`, canvas.width / 2, 440, 36, g.colorHUD, "center");
  }
  texto("ENTER para volver al menú", canvas.width / 2, 560, 20, "#8a93b5", "center");
}

// Pantalla de selección de escudería (solo 1 jugador). Muestra los dos autos.
function dibujarSeleccion() {
  ctx.fillStyle = "#0c0e16";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  texto("ELEGÍ ESCUDERÍA", canvas.width / 2, 130, 46, "#ffd23f", "center");
  for (let i = 0; i < ESCUDERIAS.length; i++) {
    const e = ESCUDERIAS[i];
    const sel = selEscuderia === i;
    const cx = canvas.width * (i === 0 ? 0.30 : 0.70);
    const cy = 360;
    if (sel) {
      ctx.fillStyle = "#1d2b53";
      ctx.fillRect(cx - 170, cy - 150, 340, 250);
      ctx.strokeStyle = "#ffd23f";
      ctx.lineWidth = 4;
      ctx.strokeRect(cx - 170, cy - 150, 340, 250);
    }
    // Preview del auto (rotado para que apunte hacia arriba), nearest-neighbor.
    const escala = 8;
    const w = SPRITE_W * escala, h = SPRITE_H * escala;
    ctx.save();
    ctx.translate(cx, cy - 10);
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(e.sprite, -w / 2, -h / 2, w, h);
    ctx.restore();
    texto(e.nombre, cx, cy + 110, 28, sel ? "#ffd23f" : e.colorHUD, "center");
  }
  texto("←  →  elegir    ·    ENTER confirmar    ·    ESC volver", canvas.width / 2, 600, 18, "#8a93b5", "center");
}

// Overlay de PAUSA sobre el frame congelado del juego.
function dibujarPausa() {
  ctx.fillStyle = "rgba(8,10,18,0.78)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  texto("PAUSA", canvas.width / 2, 220, 56, "#ffd23f", "center");
  const opts = ["CONTINUAR", "VOLVER AL MENÚ"];
  for (let i = 0; i < 2; i++) {
    const sel = pausaSel === i;
    const y = 330 + i * 70;
    if (sel) {
      ctx.fillStyle = "#1d2b53";
      ctx.fillRect(canvas.width / 2 - 230, y - 38, 460, 54);
      ctx.strokeStyle = "#ffd23f";
      ctx.lineWidth = 3;
      ctx.strokeRect(canvas.width / 2 - 230, y - 38, 460, 54);
    }
    texto(opts[i], canvas.width / 2, y, 28, sel ? "#ffd23f" : "#c8ccd2", "center");
  }
  texto("ESC o ENTER continúa   ·   M vuelve al menú", canvas.width / 2, 520, 18, "#8a93b5", "center");
}

function render() {
  if (estado === ESTADO.MENU) { dibujarMenu(); return; }
  if (estado === ESTADO.SELECCION) { dibujarSeleccion(); return; }
  // JUGANDO / PAUSA / RESULTADOS: mundo + autos al buffer, blit, y overlay.
  dibujarMundoYAutos();
  ctx.drawImage(buffer, 0, 0, BASE_W, BASE_H, 0, 0, canvas.width, canvas.height);
  if (estado === ESTADO.JUGANDO) dibujarHUD();
  else if (estado === ESTADO.PAUSA) { dibujarHUD(); dibujarPausa(); }
  else if (estado === ESTADO.RESULTADOS) dibujarResultados();
}

// =============================================================
// GAME LOOP — el estado decide qué se actualiza y qué se dibuja.
// =============================================================
let ultimoTiempo = 0;
function loop(tiempoActual) {
  if (ultimoTiempo === 0) ultimoTiempo = tiempoActual;
  let dt = (tiempoActual - ultimoTiempo) / 1000;
  ultimoTiempo = tiempoActual;
  if (dt > 0.033) dt = 0.033;

  if (estado === ESTADO.JUGANDO) actualizarJuego(dt);
  render();
  requestAnimationFrame(loop);
}

// =============================================================
// ARRANQUE
// =============================================================
function init() {
  prerenderMundo();
  calcularTrackBox();
  // Sprites pre-construidos por escudería (misma matriz, distinta paleta).
  for (const e of ESCUDERIAS) e.sprite = crearSpriteAuto(e.paleta);
  estado = ESTADO.MENU;
  requestAnimationFrame(loop);
}
init();
