/**
 * balance.js - Configuración centralizada de economía y equilibrio de juego.
 * Como establece el GDD: todos los números en un solo lugar para calibración iterativa.
 */

import { TOWERS } from './towersData.js';

export const BALANCE = {
  // Dimensiones del tablero
  CANVAS_WIDTH: 1024,
  CANVAS_HEIGHT: 640,
  GRID_COLS: 16,
  GRID_ROWS: 10,
  TILE_SIZE: 64,

  // Economía del Monte Olimpo
  STARTING_GOLD: 250,          // Dracmas iniciales (permite comprar 5 torres de Hércules a 50 c/u)
  STARTING_LIVES: 20,         // Vidas del Olimpo antes de la derrota
  
  // Recompensas de Oleada
  BASE_WAVE_REWARD: 25,       // Recompensa en oro al superar cada oleada
  WAVE_REWARD_GROWTH: 5,      // Crecimiento de recompensa por oleada
  
  // Mecánica de Riesgo y Recompensa: Llamar oleada anticipada (Modelo Híbrido)
  EARLY_WAVE_BASE_RATIO: 0.10,    // 10% del valor de la recompensa de la oleada entrante (premio mínimo garantizado)
  EARLY_WAVE_CHAOS_MAX_RATIO: 0.35, // Hasta +35% adicional de bonus si el camino está congestionado
  EARLY_CHAOS_HP_THRESHOLD: 0.15, // Si queda menos del 15% de HP total en pantalla, el bonus de caos es 0 (evita exploit del último enemigo moribundo)
  WAVE_CALL_COOLDOWN: 5.0,        // Cooldown de 5 segundos para llamar o adelantar nueva oleada (evita spam y sobrecarga)
  
  // Venta y mejoras de torres
  SELL_REFUND_RATIO: 0.7,     // Recupera el 70% del valor invertido
  UPGRADE_COST_MULTIPLIER: 1.4,// Factor de incremento por cada nivel de torre

  // Escalado de dificultad exponencial por oleada para la vida de los enemigos
  ENEMY_HP_GROWTH: 1.1,

  // Crecimiento de oro por tramos de oleadas (valores definitivos calibrados)
  GOLD_GROWTH_STAGES: [
    { fromWave: 1,  base: 1.00  },   // oleadas 1-30: SIN cambios (la economía inicial queda intacta)
    { fromWave: 30, base: 1.046 },   // oleadas 30-60: el oro crece un 4.6% por oleada
    { fromWave: 60, base: 1.02  },   // desde la 60: crece más lento que la vida, así el jugador se queda atrás
  ],

  // Escalado de daño de torres independiente de mejoras previas
  UPGRADE_DAMAGE_MULT: 1.25,
  FORM_LEVEL1_DAMAGE: {          // Daño en nivel 1 de cada forma (Forma 1 usa towersData.js)
    HERCULES: { 2: 194.4, 3: 2100.6 },
    ARTEMISA: { 2: 194.4, 3: 2100.6 },
    ZEUS:     { 2: 280.8, 3: 3034.2 },
    ARES:     { 2: 453.6, 3: 4901.4 },
    POSEIDON: { 2: 151.2, 3: 1633.8 },
    HADES:    { 2: 1340,  3: 19990  },   // se aplican sobre maxDamage; baseDamage de Hades (rampa) no cambia
  },

  // Configuración del Modo Caos (Arcade Extremo & Rejugable)
  CHAOS: {
    STARTING_GOLD: 350,               // 350 Dracmas iniciales
    STARTING_LIVES: 10,              // 10 Vidas del Olimpo (desafío arcade implacable)
    SPAWN_INTERVAL_BASE: 0.55,       // Intervalo base acelerado entre monstruos
    SPAWN_INTERVAL_MIN: 0.28,        // Mínimo intervalo de spawn en oleadas avanzadas
    TITANIC_FURY_INTERVAL: 3,        // Cada 3 oleadas se desata Furia Titánica
    TITANIC_FURY_BUFF: 1.30          // +30% de velocidad o resistencia extra
  }
};

/**
 * Función única de cálculo de daño puro de torre según (tipo, forma, nivel).
 * Calcula siempre desde la base de cada forma sin arrastrar redondeos previos:
 * damage(tipo, forma, nivel) = Math.round(daño_nivel1_de_la_forma × UPGRADE_DAMAGE_MULT^(nivel-1))
 */
export function getTowerDamage(type, form, level = 1) {
  const normType = (type === "ARTEMISA") ? "HERCULES" : type;
  let level1Damage;

  if (form === 1) {
    if (normType === "HADES") {
      level1Damage = TOWERS.HADES.maxDamage; // 150
    } else {
      const conf = TOWERS[normType];
      level1Damage = conf ? conf.damage : 40;
    }
  } else {
    const table = BALANCE.FORM_LEVEL1_DAMAGE[normType];
    level1Damage = (table && table[form] !== undefined) ? table[form] : (TOWERS[normType]?.damage || 40);
  }

  return Math.round(level1Damage * Math.pow(BALANCE.UPGRADE_DAMAGE_MULT, level - 1));
}

export function goldMultiplier(wave) {
  const st = BALANCE.GOLD_GROWTH_STAGES;
  let m = 1;
  for (let i = 0; i < st.length; i++) {
    const end = st[i + 1] ? st[i + 1].fromWave : Infinity;
    m *= Math.pow(st[i].base, Math.max(0, Math.min(wave, end) - st[i].fromWave));
  }
  return m;
}
