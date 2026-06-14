// =============================================================
// GRAN COPA PIXEL — PISTA (tilemap) · Circuito de CAMPO
// El MAPA es la ÚNICA fuente de verdad: el mismo tilemap se usa para
// DIBUJAR y para la FÍSICA (superficie + colisiones).
// =============================================================

// Tamaño de cada tile en píxeles del MUNDO base.
export const TILE = 32;

// --- MAPA del circuito ---------------------------------------
// Circuito de campo CERRADO, inspirado en la referencia: recta de meta
// arriba, horquilla amplia a la izquierda, eses fluidas en el centro y
// curvas barridas a la derecha. Calzada ancha (caben dos autos).
// 66 columnas × 38 filas.
//   #=barrera(límite)  .=asfalto  :=asfalto con línea de carril
//   c=curb(piano)  t=tierra/arena  g=césped claro  G=césped oscuro
//   M=meta  T=árbol(sólido)  R=roca(sólida)
export const MAPA = [
  "##################################################################",
  "##################################################################",
  "##ggGGGGggggGGGGggggGGGGggggGGGGggggGGGGggggGGGGggggGGGGggggGGGG##",
  "##ggGGGtttttttttttttttttttttttttttttttttttttttttttttttttttggTGGG##",
  "##GGggttttttttttttttttttttttttttttttttttttttttttttttttcccctGgggg##",
  "##GGgtt.................M.................................ctgggg##",
  "##GGgtt.::::::::::::::::M::::::::::::::::::::::::::::::::..ctgRg##",
  "##GGgtt...:::::.........M...............................::.ttgRg##",
  "##ggGGttt.....:::.ccttttttttttttttttttttttttttttttttttcc.::.ctGG##",
  "##ggGTGtttttt..::.ctttttttttttttttttttttttttttttttttttttc.::.ctG##",
  "##gRGGGGgtttt.::.ctgGGGGggggGGGGggggGGGGggggGGGGggggGGGGtt.::.ct##",
  "##ggGGGGggtt.::.ctggGGRGggggGGTGggggGGGGggggGTGGggggGGGGtc..:.ct##",
  "##GGgTggGtt.::.ttGGRggggGGGGggggGTGGggTTGGGGTgggGGGGggggGtc.:.ct##",
  "##GGggggtt.::..ttGGGggggGGGGggggGGGGggggGGGGgggTGGGGggggGtc.:.ct##",
  "##GGggggtt.:..ttGGGGggggGGGGggggGGGGTgggGGGGgTggGGGGggggGtt.:.tt##",
  "##GGgggtt.::.ttgGGGGggggGGGGggggGGGGggTgGGGGggggGGGGggggGtt.:.tt##",
  "##ggGGGtt.:..ttGggggGGRGggggGGGGggTgTGGGggggGGGGggggGGGGttc.:.ct##",
  "##ggGGGtt.:.ttGGggggGGGGggggGGGGRggRTGGGggggGTGGggggGGttttc.:.ct##",
  "##ggGGtt.::.ttGGggggGGGGgggTGGGGggggGGGGggggGGGGggggtttt...::.ct##",
  "##ggGGtt.:.ttGGGggggGGGGggggGGGGggggGGGRggggGGGGgggtcc...:::..ct##",
  "##GGgtc..:.ttgggGGGGggggGGGGggggGGGGTgggGGGGggggRGtc..:::...cctg##",
  "##GRgtc.::.ttgggGGGGggggGGGGggggGGGGggggGGGGgTggGGtc.::...ttttgg##",
  "##GGgtc.:.ctggggGGGGgggTGGGGggggGGGGggggGTGGggggGGtc..:..tttgggg##",
  "##GGgtc.::.ttgggGGGGggggGGGGgggTGGGGggggGGGGggggGGGtc..:..ttgRgg##",
  "##ggGtc..:.ttGGGgggRGGGGgtttGGGGggRgGGGtttggGGRGggggtc..:..ctGGG##",
  "##ggGGtt.:.ttGGGggggGGGGtccctGGGggggGGtccctgGGGGggggGtt..:..ctGG##",
  "##ggGGtt.::.ttGGggggGGGtc...cttGggggttc...ctGGGGggggGGtt..:..ctG##",
  "##ggGGGtt.:.ttGGggggGGtc..::.cttgggttc.::..ctGGGggggGGGtc..:.ctG##",
  "##GGTggtt.:..ctttGGGgtt.::.::..ttttt..::.::.ttggGGGGgggtt.::.ctg##",
  "##GGgggtt.::..tttttttt..:...::..tct..::...:..ttgGttttttt..:.ctgg##",
  "##GRgTggtc.::....tttc..:..ct..::...::..tc..:..ctttttttcc.::.ttgg##",
  "##GGggggtc...:::......:..tttt..::.::..tttt..:..cc.......::.ttggg##",
  "##ggGGGGgtcc....:::..::.ttggttc.:::.cttGgtt.::.....::::::.ctGGGG##",
  "##gTGGGGggttttt....::..ctgggGttc...cttGGggtc..::::::......ctGGGG##",
  "##ggGGGGggggtttttt....ctggggGGGtccctGGGGgggtc.........cccctgGTGG##",
  "##ggGGGGggggGGGtttcccctGggggGGGGtttgGGGGggggtcccctttttttttggGGGG##",
  "##################################################################",
  "##################################################################",
];

export const COLS = MAPA[0].length;        // 66
export const FILAS = MAPA.length;          // 38
export const ANCHO_MUNDO = COLS * TILE;    // 2112
export const ALTO_MUNDO = FILAS * TILE;    // 1216

// Atajo para pintar un bloque.
const rect = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

// ¿La celda (col,fila) es asfalto/meta? Lo usa el curb para saber hacia qué
// lado mira la pista y pintar el piano solo en ESE borde.
const esAsfaltoCelda = (col, fila) => {
  if (fila < 0 || fila >= MAPA.length || col < 0 || col >= MAPA[0].length) return false;
  const ch = MAPA[fila][col];
  return ch === "." || ch === ":" || ch === "M";
};

// =============================================================
// TIPOS de tile: cada símbolo → cómo se DIBUJA + sus PROPIEDADES físicas.
//   solido     → ¿bloquea el paso?
//   frenoExtra → desaceleración extra por segundo encima (0=normal; alto=frena)
//
// TRES SUPERFICIES conducibles, con penalización creciente:
//   asfalto (. :) = 0   →  curb (c) = 1.4  →  tierra (t) = 1.6  →  césped (g G) = 3.5
// La lógica de física en game.js NO cambia: lee tipo.frenoExtra de la celda
// bajo el auto. Agregar "tierra" fue solo declarar un tipo nuevo con su valor.
// =============================================================
export const TIPOS = {
  ".": {
    nombre: "asfalto", solido: false, frenoExtra: 0,
    // Gris claro #BFBFBF con textura sutil y dispersa.
    dibujar(c, x, y, col, fila) {
      rect(c, x, y, TILE, TILE, "#BFBFBF");
      const h = ((col * 7 + fila * 13) % 100 + 100) % 100;
      if (h % 3 === 0) rect(c, x + 6 + (h % 5) * 4, y + 5 + (h % 4) * 6, 2, 2, "#6E7476");
    },
  },

  ":": {
    nombre: "asfalto", solido: false, frenoExtra: 0,
    // Asfalto #BFBFBF + punto blanco central: LÍNEA DE CARRIL punteada que
    // sigue el eje del trazado (alterna para dejar huecos → "punteada").
    dibujar(c, x, y, col, fila) {
      rect(c, x, y, TILE, TILE, "#BFBFBF");
      if (((col + fila) & 1) === 0) rect(c, x + TILE / 2 - 2, y + TILE / 2 - 2, 4, 4, "#ffffff");
    },
  },

  c: {
    nombre: "curb", solido: false, frenoExtra: 1.4, // pianito: frena un poquito
    // Piano FINO (16px = media celda) pegado a la pista; el resto, tierra.
    dibujar(c, x, y, col, fila) {
      rect(c, x, y, TILE, TILE, "#c4aa78"); // base tierra (mitad sin piano)
      const arriba = esAsfaltoCelda(col, fila - 1);
      const abajo = esAsfaltoCelda(col, fila + 1);
      const izq = esAsfaltoCelda(col - 1, fila);
      const der = esAsfaltoCelda(col + 1, fila);
      const off = (col + fila) & 1;
      for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 4; i++) {
          const enFranja = (arriba && j < 2) || (abajo && j >= 2) || (izq && i < 2) || (der && i >= 2);
          if (!enFranja) continue;
          const rojo = ((i + j + off) & 1) === 0;
          rect(c, x + i * 8, y + j * 8, 8, 8, rojo ? "#c2332f" : "#e6e6ea");
        }
      }
    },
  },

  t: {
    nombre: "tierra", solido: false, frenoExtra: 1.6, // escapatoria: frena medio
    dibujar(c, x, y, col, fila) {
      rect(c, x, y, TILE, TILE, "#c4aa78");
      const h = ((col * 5 + fila * 11) % 100 + 100) % 100;
      rect(c, x + 5 + (h % 4) * 5, y + 6 + (h % 3) * 7, 2, 2, "#b39a68");
      if (h % 2 === 0) rect(c, x + 18, y + 20, 2, 2, "#d8c08a");
    },
  },

  g: {
    nombre: "cesped", solido: false, frenoExtra: 3.5, // zona lenta
    dibujar(c, x, y) {
      rect(c, x, y, TILE, TILE, "#5aa856"); // verde CLARO
      rect(c, x, y, TILE / 2, TILE / 2, "#64b25e");
      rect(c, x + TILE / 2, y + TILE / 2, TILE / 2, TILE / 2, "#64b25e");
      rect(c, x + 7, y + 21, 2, 2, "#4f9a4c");
      rect(c, x + 22, y + 9, 2, 2, "#4f9a4c");
    },
  },

  G: {
    nombre: "cesped", solido: false, frenoExtra: 3.5, // zona lenta (mismo freno)
    dibujar(c, x, y) {
      rect(c, x, y, TILE, TILE, "#3f8043"); // verde OSCURO
      rect(c, x, y, TILE / 2, TILE / 2, "#3a7a3e");
      rect(c, x + TILE / 2, y + TILE / 2, TILE / 2, TILE / 2, "#3a7a3e");
      rect(c, x + 11, y + 13, 2, 2, "#478c4a");
    },
  },

  "#": {
    nombre: "barrera", solido: true, frenoExtra: 0, // límite del mundo: bloquea
    dibujar(c, x, y, col, fila) {
      // Seto / borde natural oscuro fuera de los límites de la pista.
      rect(c, x, y, TILE, TILE, "#27582c");
      const h = ((col * 7 + fila * 5) % 100 + 100) % 100;
      rect(c, x + 4 + (h % 4) * 5, y + 4 + (h % 4) * 5, 5, 5, "#2f6634");
      rect(c, x + 19, y + 18, 5, 5, "#1f4a26");
    },
  },

  M: {
    nombre: "meta", solido: false, frenoExtra: 0,
    dibujar(c, x, y, col, fila) {
      const s = 8; // damero blanco/negro
      for (let j = 0; j < TILE / s; j++) {
        for (let i = 0; i < TILE / s; i++) {
          const claro = ((i + j + col + fila) & 1) === 0;
          rect(c, x + i * s, y + j * s, s, s, claro ? "#e6e6ea" : "#15151c");
        }
      }
    },
  },

  T: {
    nombre: "arbol", solido: true, frenoExtra: 0, // decoración SÓLIDA (obstáculo)
    // Copa de árbol vista DESDE ARRIBA (planta): mancha verde redondeada con
    // luz y sombra. No invade la pista (se coloca lejos del asfalto).
    dibujar(c, x, y) {
      rect(c, x, y, TILE, TILE, "#3f8043"); // césped debajo
      rect(c, x + 7, y + 5, 18, 22, "#2c6e34");
      rect(c, x + 5, y + 8, 22, 16, "#2c6e34");
      rect(c, x + 9, y + 3, 14, 26, "#2c6e34");
      rect(c, x + 10, y + 8, 9, 9, "#3a8a44");   // brillo de copa
      rect(c, x + 14, y + 15, 5, 6, "#1e5028");  // sombra central
    },
  },

  R: {
    nombre: "roca", solido: true, frenoExtra: 0, // decoración SÓLIDA (obstáculo)
    dibujar(c, x, y) {
      rect(c, x, y, TILE, TILE, "#5aa856"); // césped debajo
      rect(c, x + 8, y + 11, 17, 13, "#9a9aa2");
      rect(c, x + 8, y + 11, 17, 4, "#b6b6be");  // luz arriba
      rect(c, x + 11, y + 20, 12, 4, "#76767e"); // sombra abajo
    },
  },
};

// =============================================================
// CONSULTAS sobre el tilemap (las usa tanto la física como el render).
// =============================================================
export function tipoEnCelda(col, fila) {
  if (fila < 0 || fila >= FILAS || col < 0 || col >= COLS) return TIPOS["#"];
  return TIPOS[MAPA[fila][col]] || TIPOS["."];
}

export function tipoEnPunto(x, y) {
  return tipoEnCelda(Math.floor(x / TILE), Math.floor(y / TILE));
}

export function esSolido(x, y) {
  return tipoEnPunto(x, y).solido;
}

// Posición/orientación de SALIDA: en la recta superior justo DETRÁS de la
// meta (col 21, fila 6; la meta está en col 24), mirando hacia +X (derecha).
// Al arrancar cruza la meta; al completar una vuelta la vuelve a cruzar.
export const SALIDA = { x: 21.5 * TILE, y: 6.5 * TILE, angulo: 0 };
