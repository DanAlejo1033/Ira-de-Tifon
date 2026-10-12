# ⚡ Ira de Tifón: Tower Defense Mitológico

[![HTML5 Canvas](https://img.shields.io/badge/Engine-HTML5%20Canvas-orange.svg)](#)
[![JavaScript](https://img.shields.io/badge/Language-Vanilla%20JavaScript%20(ES6+)-yellow.svg)](#)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#)

**Ira de Tifón** es un Tower Defense arcade de oleadas infinitas ambientado en la mitología griega, inspirado en clásicos como *Endless Siege* y optimizado para ejecutarse con máxima fluidez en navegadores web (HTML5 / Poki / CrazyGames) sin frameworks ni dependencias externas.

---

## 🏛️ Lore del Juego
En las profundidades del **Tártaro**, **Tifón**, el titánico padre de todos los monstruos, ha roto sus cadenas milenarias. Clamando venganza contra los cielos, envía oleadas interminables de gigantes, cíclopes, arpías y criaturas colosales a través del *Camino de Flegra* rumbo a las puertas del **Monte Olimpo**.

La diosa **Atenea** desciende para instruir a un estratega mortal, quien deberá colocar las defensas de los campeones divinos e invocar los poderes del panteón olímpico para resistir la invasión.

---

## 🎮 Características Principales

* **5 Torres Divinas con Sistema de 3 Formas y Ramificaciones:**
  * Progresión completa de **Forma 1 $\to$ Forma 2 $\to$ Forma 3** a cualquier nivel.
  * Ramificaciones permanentes exclusivas (e.g. Ares: *Minas de Flegra* o *Mortero de Esquirlas*).
  * 10 niveles de mejora por forma con fórmulas de coste exponencial basadas en semilla porcentual.
* **5 Bendiciones y Poderes Globales del Olimpo:**
  * Desbloqueables por partidas jugadas: **Hera**, **Deméter**, **Artemisa**, **Hermes** y **Cronos**.
  * Apuntado interactivo en el mapa con enfriamiento y coste en dracmas.
* **Modelo Híbrido de Adelantar Oleadas (Riesgo y Recompensa):**
  * Invoca la siguiente horda antes de tiempo para ganar dracmas extra:
    * **Bonus Base:** $10\%$ del valor garantizado de la oleada entrante.
    * **Bonus de Caos:** Hasta $+35\%$ adicional si el carril se encuentra congestionado de enemigos con alta vida.
* **Tutorial Narrativo e Interactivo de Atenea:**
  * Sistema de spotlight visual con recuadros elevados que guían al jugador paso a paso en su primera partida.
* **Controles Tácticos y Rendimiento:**
  * Velocidad de juego variable (**1x**, **2x**, **3x** y **5x** para partidas rápidas) y pausa táctica.
  * Botón de pruebas en el HUD (**+10,000 🪙**) para experimentar con builds y evoluciones de alto nivel.
  * Registro automático de récords de oleada y monstruos vencidos en `localStorage`.

---

## 🏹 Guía de Torres Olímpicas

| Torre | Rol Principal | Coste Base | Alcance Base | Mecánica Especial por Forma |
| :--- | :--- | :---: | :---: | :--- |
| **🏹 Hércules** | Cadencia & Precisión | 50 🪙 | 120 px | **Forma 1:** 1 flecha ($100\%$ daño).<br>**Forma 2:** 2 flechas ($70\%$ daño c/u = $140\%$), cadencia $1.9\text{ disp/s}$.<br>**Forma 3 (Arco de Heracles):** 3 flechas ($60\%$ daño c/u = $180\%$), cadencia $2.8\text{ disp/s}$. |
| **⚡ Zeus** | Rayo Fulminante | 75 🪙 | 120 px | **Forma 1:** Impacto directo único.<br>**Forma 2:** Rayo en cadena a 6 objetivos.<br>**Forma 3:** Cadena a 9 objetivos + **aturdimiento ($0.6\text{s}$)** en el 1.ᵉʳ ataque y cada 4 ataques. |
| **⚔️ Ares** | Daño en Área / Zonas | 80 🪙 | 100 px | **Forma 1:** Mortero de granada radial.<br>**Forma 2:** Elección de rama permanente:<br>• *Esquirlas:* 6 metrallas radiales.<br>• *Minas:* Siembra de hasta 6 bombas terrestres en el camino.<br>**Forma 3:** *Cataclismo de Esquirlas* (10 metrallas) o *Campo Minado* (7 bombas de 80 px de radio). |
| **🌊 Poseidón** | Control & Ralentización | 60 🪙 | 110 px | **Forma 1:** Olas con $50\%$ de ralentización.<br>**Forma 2:** Maremoto con mayor radio de impacto ($30$ px).<br>**Forma 3:** Tsunami expansivo con aturdimiento en el primer contacto. |
| **💀 Hades** | Torre Infernal | 90 🪙 | 140 px | **Forma 1:** Rayo del Tártaro continuo con rampa de daño por segundo.<br>**Forma 2:** Prioridad automática al enemigo de mayor salud (*Objetivo Vital*).<br>**Forma 3:** *Cosechador de Almas*, dispara **3 rayos infernales simultáneos**. |

---

## 💰 Economía y Escalado de Mejoras

### Evolución de Formas
* **Forma 2:** Coste calculado como el $2.273\%$ redondeado del coste base:
  * Hércules: $2,200$ | Poseidón: $2,640$ | Zeus: $3,300$ | Ares: $3,520$ | Hades: $3,960$.
* **Forma 3:** Costes calibrados por especialización:
  * **Hércules:** $23,000$ 🪙
  * **Poseidón:** $30,000$ 🪙
  * **Hades:** $27,000$ 🪙
  * **Zeus:** $28,000$ 🪙
  * **Ares (Minas):** $25,500$ 🪙
  * **Ares (Esquirlas):** $26,500$ 🪙

### Subida de Niveles (1 al 10)
Dentro de la Forma 2 y Forma 3, los niveles progresan mediante la fórmula oficial:
$$\text{Coste}(L) = \text{seed} \times 1.4^{L - 2}$$
* Donde $\text{seed} = 10\%$ del coste de entrada de la Forma.
* Al evolucionar, el nivel se reinicia a $1$ permitiendo progresar los 10 niveles en la nueva forma divina.

---

## 🌿 Bendiciones Globales del Panteón

* **🌾 Deméter (Cosecha Divina):** Otorga un porcentaje de dracmas inmediato basado en el valor proyectado de la oleada.
* **🦚 Hera (Paz Olímpica):** Detiene a todos los monstruos en pantalla durante varios segundos.
* **🎯 Artemisa (Diana Cazadora):** Marca a los enemigos en un área para que reciban daño incrementado de todas las torres.
* **👟 Hermes (Viento Veloz):** Acelera drásticamente la cadencia de disparo de todas las torres aliadas durante un tiempo determinado.
* **⏳ Cronos (Distorsión Temporal):** Ralentiza el tiempo de los monstruos mientras acelera las defensas olímpicas.

---

## 🚀 Cómo Ejecutar el Juego

### Opción 1: Inicio Rápido en Windows (Recomendada)
Haz doble clic en el archivo **`iniciar_juego.bat`**. Abrirá automáticamente tu navegador predeterminado en `http://localhost:8000` con el servidor HTTP local activo.

### Opción 2: VS Code / Live Server
1. Abre la carpeta del proyecto en Visual Studio Code.
2. Abre `index.html`.
3. Haz clic derecho y selecciona **"Open with Live Server"**.

### Opción 3: Consola / Terminal
```bash
python -m http.server 8000
```
Visita en tu navegador: `http://localhost:8000`

---

## 📂 Estructura del Proyecto

```text
Gigantomaquia/
├── index.html                   # Interfaz de usuario, HUD, Canvas y modales
├── iniciar_juego.bat            # Lanzador automático local
├── subir_a_github.bat           # Script de sincronización con GitHub
├── README.md                    # Documentación técnica y guía del juego
├── css/
│   └── style.css                # Estética mitológica griega y animaciones
├── src/
│   ├── main.js                  # Bucle principal del juego y coordinador
│   ├── config/
│   │   ├── balance.js           # Variables de economía, bonos de caos y vidas
│   │   ├── towersData.js        # Configuración base de las 5 torres divinas
│   │   ├── enemiesData.js       # Atributos de los monstruos de Tifón
│   │   ├── powersData.js        # Especificaciones de bendiciones olímpicas
│   │   └── mapsData.js          # Matriz del Camino de Flegra
│   ├── core/
│   │   ├── Vector2.js           # Aritmética vectorial 2D
│   │   └── Grid.js              # Conversión cuadrícula/píxel y pathfinding
│   ├── entities/
│   │   ├── Tower.js             # Lógica de torres, Formas 1-3, targeting y mejoras
│   │   ├── Enemy.js             # Comportamiento de hordas y furia de Alóadas
│   │   ├── Projectile.js        # Balística, impactos y efectos de área
│   │   └── RoadBomb.js          # Minas terrestres de Ares
│   ├── systems/
│   │   ├── WaveManager.js       # Generador de oleadas infinitas y bonus de caos
│   │   ├── EconomyManager.js    # Gestión de dracmas y vidas sagradas
│   │   ├── PowerManager.js      # Lanzamiento y enfriamiento de habilidades
│   │   ├── ProgressManager.js   # Persistencia en localStorage
│   │   └── TutorialManager.js   # Sistema guiado paso a paso de Atenea
│   ├── render/
│   │   ├── Renderer.js          # Dibujado del mapa, efectos de aura y templos
│   │   └── ParticleSystem.js    # Chispas, explosiones, rayos y números flotantes
│   └── ui/
│       └── UIManager.js         # Interacción con el HUD, inspector y menús
└── _test_prototype/             # Entorno aislado para pruebas de balance
```

---

## 📜 Licencia
Proyecto distribuido bajo la licencia **MIT**. Desarrollado como tributo a los juegos clásicos de estrategia y defensa de torres.
