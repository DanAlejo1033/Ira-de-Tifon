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
    cooldown: 60,        // Enfriamiento rápido para pruebas (10s)
    goldCost: 40,        // Costo en Dracmas (15)
    unlockGames: 0,      // Disponible para pruebas
    themeColor: "#22c55e",
    description: "Siembra un campo de zarzas sagradas durante 3.5s. Aturde durante 1.5s a cada monstruo que cruce la zona.",
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
    normalHpPercent: 0.60,// 30% de la vida máxima a monstruos normales y rápidos
    giantHpPercent: 0.45, // 20% a gigantes y tanques
    cooldown: 50,        // Enfriamiento rápido para pruebas (12s)
    goldCost: 30,        // Costo en Dracmas (20)
    unlockGames: 0,      // Disponible para pruebas
    themeColor: "#ec4899",
    description: "Descarga una esfera de fuego celestial. Inflige 30% de la vida máxima a los monstruos (20% a gigantes y tanques).",
    quote: "¡La Reina del Olimpo fulmina a los insolentes!"
  },

  ARTEMISA: {
    id: "ARTEMISA",
    name: "Diana de Artemisa",
    god: "Artemisa",
    subtitle: "Vulnerabilidad Divina",
    icon: "🏹",
    type: "ZONE",
    radius: 105,
    duration: 3.5,       // Zona activa durante 3.5s
    markDuration: 4.0,   // La marca dura 4s en cada enemigo
    damageAmp: 0.40,     // Aumenta el daño recibido en un 20%
    cooldown: 60,        // Enfriamiento rápido para pruebas (10s)
    goldCost: 40,        // Costo en Dracmas (15)
    unlockGames: 0,      // Disponible para pruebas
    themeColor: "#38bdf8",
    description: "Zona estelar de 3.5s que marca a los enemigos. Los marcados reciben un +20% de daño de todas las torres durante 4s.",
    quote: "¡La Cazadora divina marca a su presa con luz inextinguible!"
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
    cooldown: 80,        // Enfriamiento (12s)
    goldCost: 60,        // Costo en Dracmas (15)
    unlockGames: 0,
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
    cooldown: 80,        // Enfriamiento (12s)
    goldCost: 80,        // Costo en Dracmas (20)
    unlockGames: 0,
    themeColor: "#a855f7",
    description: "Distorsión temporal global durante 6s: aumenta un +50% la cadencia y velocidad de ataque de todas las torres del Olimpo.",
    quote: "¡El Titán del Tiempo acelera el castigo del Olimpo!"
  }
};
