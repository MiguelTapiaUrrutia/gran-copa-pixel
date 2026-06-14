# 🏁 Gran Copa Pixel

Juego de carreras top-down en **pixel art 16 bits**, hecho con **Canvas y JavaScript vanilla** (sin frameworks, sin dependencias). Elige escudería, da gas y pelea por la mejor vuelta.

👉 **Juega ya:** [grancopapixel.notbot.pro](https://grancopapixel.notbot.pro)

## 🎮 Cómo jugar

La carrera es a **3 vueltas** y gana quien marque **la mejor vuelta**. Pulsa **ESC** en cualquier momento para pausar.

### 1 jugador
- Elige tu escudería en el menú.
- Conduces con las **flechas** del teclado: ↑ acelera, ↓ frena/marcha atrás, ← → giran.

### 2 jugadores (pantalla compartida)
- **Jugador 1 — Ferrari** 🔴: **flechas** del teclado.
- **Jugador 2 — Mercedes** ⚪: **WASD** (W acelera, S frena, A/D giran).
- Ambos comparten la misma pista y el mismo cronómetro. ¡A ver quién aguanta el pulso!

## 🛠️ Tecnologías

- **Canvas 2D** para todo el render.
- **Game loop** con `requestAnimationFrame` y **delta time**, para que la física sea estable independientemente de los FPS.
- **Sprites por matriz + paleta**: cada coche es una matriz de índices que se pinta con su paleta de color, así reusamos la misma forma con distintos colores de escudería.
- **Tilemap como fuente única**: el mismo mapa de tiles define cómo se dibuja la pista *y* cómo se calcula la física (asfalto vs. hierba), sin duplicar datos.
- **Estados de pantalla**: menú, selección, juego, pausa y fin de carrera gestionados como una máquina de estados sencilla.

## 🚀 Mejoras futuras (roadmap honesto)

- 📱 **Controles táctiles** para jugar en móvil.
- 🗺️ **Más circuitos** y trazados.
- 🏎️ **Ítems estilo F1**: DRS, lluvia y otros modificadores de carrera.
- 🎨 **Sprite de coche en alta resolución** con más detalle.

## ✅ Estado

**V1 jugable en producción.** El juego está completo y disponible online: menú, modos 1 y 2 jugadores, vueltas, cronómetro y pausa funcionando.
