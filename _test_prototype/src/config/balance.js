/**
 * balance.js - Configuración centralizada de economía y equilibrio de juego.
 * Como establece el GDD: todos los números en un solo lugar para calibración iterativa.
 */

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

  // Crecimiento de oro por tramos de oleadas
  GOLD_GROWTH_STAGES: [
    { fromWave: 1,  base: 1.05  },
    { fromWave: 30, base: 1.056 },
    { fromWave: 60, base: 1.02  },
  ],

  // Multiplicadores de daño y evolución de torres (escalado reducido a la mitad)
  UPGRADE_DAMAGE_MULT: 1.125,        // +12.5% de daño por nivel (antes +25%)
  EVOLVE_DAMAGE_MULT: 1.225,         // +22.5% de daño por evolución de forma (antes +45%)
  HADES_FORM2_MAXDAMAGE_MULT: 1.4,   // +40% de daño máximo en Forma 2 (antes +80%)
  HADES_FORM3_MAXDAMAGE_MULT: 1.5    // +50% de daño máximo en Forma 3 (antes +100%)
};

export function goldMultiplier(wave) {
  const st = BALANCE.GOLD_GROWTH_STAGES;
  let m = 1;
  for (let i = 0; i < st.length; i++) {
    const end = st[i + 1] ? st[i + 1].fromWave : Infinity;
    m *= Math.pow(st[i].base, Math.max(0, Math.min(wave, end) - st[i].fromWave));
  }
  return m;
}
