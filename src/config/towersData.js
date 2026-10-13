/**
 * towersData.js - Definición de las 5 torres divinas olímpicas.
 * Todas las torres disponibles sin restricción de etapa.
 */

export const TOWERS = {
  HERCULES: {
    type: "HERCULES",
    name: "Hércules",
    role: "Cadencia & Precisión",
    description: "Ballesta divina de disparo rápido a un solo objetivo.",
    cost: 50,
    range: 120,
    damage: 40,
    fireRate: 1.1,
    projectileSpeed: 490,
    color: "#f59e0b",
    icon: "🏹"
  },
  ZEUS: {
    type: "ZEUS",
    name: "Zeus",
    role: "Rayo Fulminante",
    description: "Rayo divino a un solo objetivo. Desbloquea daño concatenado en Forma 2 (6 obj.) y Forma 3 (9 obj.).",
    cost: 75,
    range: 120,
    damage: 45,
    fireRate: 1.3,
    chainCount: 1, // Forma 1: SIN concatenación
    chainRange: 120,
    color: "#38bdf8",
    icon: "⚡"
  },
  ARES: {
    type: "ARES",
    name: "Ares",
    role: "Daño en Área",
    description: "Mortero de guerra. En Forma 2 elige rama permanente: Esquirlas radiales o Bombas en el camino.",
    cost: 80,
    range: 100,
    damage: 55,
    fireRate: 1.5,
    splashRadius: 65,
    projectileSpeed: 300,
    color: "#ef4444",
    icon: "⚔️"
  },
  HADES: {
    type: "HADES",
    name: "Hades",
    role: "Torre Infernal",
    description: "Rayo del Tártaro continuo. En Forma 2 desbloquea objetivo vital (mayor vida) y en Forma 3 dispara 3 rayos simultáneos.",
    cost: 90,
    range: 140,
    baseDamage: 15,
    maxDamage: 150,
    rampTime: 3.0,
    tickRate: 6,
    color: "#a855f7",
    icon: "💀"
  },
  POSEIDON: {
    type: "POSEIDON",
    name: "Poseidón",
    role: "Ralentización",
    description: "Olas marinas que dañan y reducen un 50% la velocidad enemiga.",
    cost: 60,
    range: 110,
    damage: 40,
    fireRate: 0.6,
    slowFactor: 0.8,
    slowDuration: 1.0,
    splashRadius: 10,
    projectileSpeed: 360,
    color: "#06b6d4",
    icon: "🔱"
  }
};
