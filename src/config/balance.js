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
  
  // Venta y mejoras de torres
  SELL_REFUND_RATIO: 0.7,     // Recupera el 70% del valor invertido
  UPGRADE_COST_MULTIPLIER: 1.4// Factor de incremento por cada nivel de torre
};
