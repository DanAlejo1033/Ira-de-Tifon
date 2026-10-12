# Gigantomaquia: Tower Defense Mitológico

Tower Defense arcade sin final con ambientación en la mitología griega, inspirado en *Endless Siege*, diseñado para navegador (HTML5 / Poki y CrazyGames).

---

## 🚀 Cómo Ejecutar el Juego

### Opción 1: Inicio Rápido (Doble Clic)
Haz doble clic en el archivo **`iniciar_juego.bat`**. Se abrirá automáticamente tu navegador en `http://localhost:8000` con el juego listo para jugar.

### Opción 2: Con VS Code (Live Server)
1. Abre la carpeta del proyecto en Visual Studio Code.
2. Abre [index.html](file:///c:/Users/Cristian/Desktop/Tower%20defense/index.html).
3. Haz clic derecho y selecciona **"Open with Live Server"**.

### Opción 3: Terminal de Comandos
Ejecuta en la terminal de la carpeta:
```bash
python -m http.server 8000
```
Y visita en tu navegador: `http://localhost:8000`

---

## 🏛️ Estado Actual del Desarrollo (Etapas 1 a 5 Completadas)

1. **Etapa 1 — Mapa Matricial:**
   - Grid interactivo de 16x10 celdas (1024x640 px).
   - Generación de caminos de piedra, obstáculos sagrados (columnas de mármol).
   - Fisura de Tifón animada (magma y fuego en la entrada).
   - Templo sagrado del Monte Olimpo (resplandor celestial en la salida).

2. **Etapa 2 — Movimiento de Enemigos:**
   - Algoritmo de extracción de waypoints automático a partir de la matriz (31 puntos).
   - Movimiento fluido por el carril con cálculo exacto de distancia recorrida.
   - Catálogo de enemigos: Soldados Caídos, Harpías veloces, Cíclopes tanque, Gigantes titánicos y la pareja de **Alóadas** (Oto y Efialtes), que entran en frenesí de velocidad al morir su compañero.

3. **Etapa 3 — Torres y Combate:**
   - Ballesta de Hércules con apuntado giratorio hacia el objetivo.
   - Algoritmo de adquisición: **prioriza siempre al enemigo más adelantado en el camino**.
   - Proyectiles virote con física, impacto, partículas de chispas y números de daño flotantes.

4. **Etapa 4 — Economía y Olimpo:**
   - 120 Dracmas iniciales y 20 Vidas sagradas.
   - Panel inspector de torre: mejoras del nivel 1 al 10 y venta con reembolso del 70%.
   - Pantalla de Game Over con estadísticas completas y registro persistente de partidas en `localStorage`.

5. **Etapa 5 — Oleadas Infinitas y Riesgo/Recompensa:**
   - Botón de control de oleadas manual.
   - Mecánica de **Adelantar Oleada**: al pulsar el botón antes de tiempo, recibes un bono de dracmas inmediato (+15 base + bonus por tiempo restante) y la siguiente horda se suma al mapa, premiando a los jugadores atrevidos.
   - Controles de velocidad (1x / 2x) y pausa.

---

## 📁 Arquitectura Modular del Código

- [`index.html`](file:///c:/Users/Cristian/Desktop/Tower%20defense/index.html): Estructura semántica, canvas y componentes HUD.
- [`css/style.css`](file:///c:/Users/Cristian/Desktop/Tower%20defense/css/style.css): Interfaz visual de estilo griego antiguo.
- [`src/config/balance.js`](file:///c:/Users/Cristian/Desktop/Tower%20defense/src/config/balance.js): Números centrales de economía y ajustes.
- [`src/config/mapsData.js`](file:///c:/Users/Cristian/Desktop/Tower%20defense/src/config/mapsData.js): Matrices de los mapas.
- [`src/config/enemiesData.js`](file:///c:/Users/Cristian/Desktop/Tower%20defense/src/config/enemiesData.js): Estadísticas de los monstruos de Tifón.
- [`src/config/towersData.js`](file:///c:/Users/Cristian/Desktop/Tower%20defense/src/config/towersData.js): Definición de las 5 torres divinas.
- [`src/core/Grid.js`](file:///c:/Users/Cristian/Desktop/Tower%20defense/src/core/Grid.js): Pathfinding y conversión celda/píxel.
- [`src/entities/Enemy.js`](file:///c:/Users/Cristian/Desktop/Tower%20defense/src/entities/Enemy.js): Clase de enemigos y lógica de furia de Alóadas.
- [`src/entities/Tower.js`](file:///c:/Users/Cristian/Desktop/Tower%20defense/src/entities/Tower.js): Lógica de disparo, rotación y mejoras.
- [`src/entities/Projectile.js`](file:///c:/Users/Cristian/Desktop/Tower%20defense/src/entities/Projectile.js): Proyectiles e impacto.
- [`src/systems/WaveManager.js`](file:///c:/Users/Cristian/Desktop/Tower%20defense/src/systems/WaveManager.js): Generador procedimental infinito y bono de adelanto.
- [`src/systems/EconomyManager.js`](file:///c:/Users/Cristian/Desktop/Tower%20defense/src/systems/EconomyManager.js): Dracmas y vidas del Olimpo.
- [`src/systems/ProgressManager.js`](file:///c:/Users/Cristian/Desktop/Tower%20defense/src/systems/ProgressManager.js): Guardado de partidas en el navegador.
- [`src/render/Renderer.js`](file:///c:/Users/Cristian/Desktop/Tower%20defense/src/render/Renderer.js): Renderizado Canvas 2D.
- [`src/ui/UIManager.js`](file:///c:/Users/Cristian/Desktop/Tower%20defense/src/ui/UIManager.js): Control del HUD e inspector.
- [`src/main.js`](file:///c:/Users/Cristian/Desktop/Tower%20defense/src/main.js): Bucle principal y coordinador.

---

## 🔮 Siguiente Paso: Etapa 6
- Torres de Zeus, Ares, Hades y Poseidón.
- Sistema de Poderes Divinos (Deméter, Hera, Artemisa, Hermes, Cronos).
- Tutorial guiado narrativo con Atenea.
