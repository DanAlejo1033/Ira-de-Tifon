/**
 * enemiesData.js - Definición de los enemigos y sus atributos base.
 * Sigue al detalle la sección 5 del documento de diseño.
 */

export const ENEMIES = {
  NORMAL: {
    type: "NORMAL",
    name: "Soldado Caído",
    description: "Infantería básica de Tifón. Estadísticas equilibradas.",
    hp: 90,
    speed: 70,           // píxeles por segundo
    goldReward: 2,
    radius: 12,
    color: "#94a3b8",    // Gris armadura
    borderColor: "#475569"
  },
  FAST: {
    type: "FAST",
    name: "Harpía",
    description: "Rápida y ágil, pero con poca resistencia.",
    hp: 45,
    speed: 135,
    goldReward: 1,
    radius: 10,
    color: "#f87171",    // Rojo alado
    borderColor: "#b91c1c"
  },
  TANK: {
    type: "TANK",
    name: "Cíclope",
    description: "Muy resistente y lento. Absorbe una gran cantidad de daño.",
    hp: 360,
    speed: 40,
    goldReward: 6,
    radius: 18,
    color: "#4ade80",    // Verde piel monstruosa
    borderColor: "#15803d"
  },
  ALOADAE: {
    type: "ALOADAE",
    name: "Alóada (Oto y Efialtes)",
    description: "Marchan en pareja. Cuando uno cae, el otro entra en cólera (+80% velocidad).",
    hp: 180,
    speed: 65,
    frenzySpeedMultiplier: 1.85,
    goldReward: 5,
    radius: 14,
    color: "#c084fc",    // Púrpura mítico
    borderColor: "#7e22ce"
  },
  GIANT: {
    type: "GIANT",
    name: "Gigante Porphyrion",
    description: "Gigante de la Gigantomaquia con colosal reserva de vitalidad.",
    hp: 650,
    speed: 35,
    goldReward: 18,
    radius: 22,
    color: "#fb923c",    // Naranja titánico
    borderColor: "#c2410c"
  }
};
