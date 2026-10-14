/**
 * powersData.js - Configuración centralizada de las 5 Habilidades / Poderes Divinos
 * según las especificaciones del GDD de Gigantomaquia.
 */

export const POWERS_DATA = {
  DEMETER: {
    id: "DEMETER",
    name: "Bendición de Deméter",
    god: "Deméter",
    subtitle: "Zarzas & Aturdimiento",
    icon: "🌿",
    type: "ZONE",
    radius: 95,          // Radio en píxeles del área de efecto
    duration: 3.0,       // Duración del área activa (3s)
    stunDuration: 1.5,   // Aturde 1.5s a cada enemigo que entra (una vez por criatura)
    cooldown: 70,        // Enfriamiento de 70s
    goldCost: 100,       // Costo en Dracmas (100)
    unlockGames: 25,     // Desbloquea a las 25 partidas (10 tras Artemisa)
    themeColor: "#22c55e",
    description: "Siembra un campo de zarzas sagradas durante 3.0s. Aturde durante 1.5s a cada monstruo que cruce la zona.",
    quote: "¡Que la Madre Tierra sujete y paralice a los gigantes!"
  },

  HERA: {
    id: "HERA",
    name: "Cólera de Hera",
    god: "Hera",
    subtitle: "Daño Porcentual de Área",
    icon: "🦚",
    type: "ZONE",
    radius: 105,
    duration: 0.8,       // Impacto inmediato con animación
    normalHpPercent: 0.60,// 60% de la vida máxima
    giantHpPercent: 0.60, // 60% de la vida máxima
    cooldown: 70,        // Enfriamiento de 70s
    goldCost: 100,       // Costo en Dracmas (100)
    unlockGames: 5,      // Desbloquea tras 5 partidas jugadas (GDD)
    themeColor: "#ec4899",
    description: "Descarga una esfera de fuego celestial. Inflige 60% de la vida máxima a los monstruos en el área.",
    quote: "¡La Reina del Olimpo fulmina a los insolentes!"
  },

  ARTEMISA: {
    id: "ARTEMISA",
    name: "Fuerza de Hércules",
    god: "Hércules",
    subtitle: "Golpe Heroico & Vulnerabilidad",
    icon: "🦁",
    type: "ZONE",
    radius: 105,
    duration: 3.5,       // Zona activa durante 3.5s
    markDuration: 4.0,   // La marca dura 4s en cada enemigo
    damageAmp: 0.20,     // Aumenta el daño recibido en un 20%
    cooldown: 70,        // Enfriamiento de 70s
    goldCost: 100,       // Costo en Dracmas (100)
    unlockGames: 15,     // Desbloquea a las 15 partidas (10 tras Hera)
    themeColor: "#eab308", // Color Amarillo
    description: "Zona de impacto heroico de 3.5s que marca a los enemigos. Los marcados reciben un +20% de daño de todas las torres durante 4s.",
    quote: "¡El Campeón del Olimpo quiebra la resistencia de los gigantes!"
  },

  HERMES: {
    id: "HERMES",
    name: "Viento de Hermes",
    god: "Hermes",
    subtitle: "Oro Global de Batalla",
    icon: "🪽",
    type: "GLOBAL",
    duration: 6.0,       // Activo globalmente durante 6s
    goldMultiplier: 1.5, // +50% de oro por todos los enemigos derrotados en el tiempo
    cooldown: 70,        // Enfriamiento de 70s
    goldCost: 120,       // Costo en Dracmas (120)
    unlockGames: 35,     // Desbloquea a las 35 partidas (10 tras Deméter)
    themeColor: "#facc15",
    description: "Bendición global durante 6s: todos los monstruos derrotados en el campo de batalla otorgan un +50% de Dracmas de oro.",
    quote: "¡El oro y la fortuna vuelan veloces al tesoro del Olimpo!"
  },

  CRONOS: {
    id: "CRONOS",
    name: "Distorsión de Cronos",
    god: "Cronos",
    subtitle: "Cadencia Global de Torres",
    icon: "⏳",
    type: "GLOBAL",
    duration: 6.0,       // Aceleración temporal global durante 6s
    attackSpeedBuff: 0.50,// +50% de cadencia de ataque a todas las torres
    cooldown: 70,        // Enfriamiento de 70s
    goldCost: 110,       // Costo en Dracmas (110)
    unlockGames: 45,     // Desbloquea a las 45 partidas (10 tras Hermes)
    themeColor: "#a855f7",
    description: "Distorsión temporal global durante 6s: aumenta un +50% la cadencia y velocidad de ataque de todas las torres del Olimpo.",
    quote: "¡El Titán del Tiempo acelera el castigo del Olimpo!"
  }
};
