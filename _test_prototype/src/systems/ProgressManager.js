/**
 * ProgressManager.js - Persistencia del progreso y récords en localStorage.
 * Registra partidas jugadas (según Sección 7 del GDD), récords y estado del tutorial.
 */

const STORAGE_KEY = "gigantomaquia_progress_test_prototype";

export class ProgressManager {
  constructor() {
    this.data = this.loadProgress();
  }

  loadProgress() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const allPowers = ["DEMETER", "HERA", "ARTEMISA", "HERMES", "CRONOS"];
        return {
          gamesPlayed: parsed.gamesPlayed || 0,
          highestWave: parsed.highestWave || 0,
          totalEnemiesKilled: parsed.totalEnemiesKilled || 0,
          tutorialCompleted: parsed.tutorialCompleted || false,
          loreSeen: parsed.loreSeen || false,
          unlockedPowers: allPowers,
          equippedPower: parsed.equippedPower || "DEMETER"
        };
      }
    } catch (e) {
      console.warn("No se pudo acceder a localStorage:", e);
    }

    return {
      gamesPlayed: 0,
      highestWave: 0,
      totalEnemiesKilled: 0,
      tutorialCompleted: false,
      loreSeen: false,
      unlockedPowers: ["DEMETER", "HERA", "ARTEMISA", "HERMES", "CRONOS"],
      equippedPower: "DEMETER"
    };
  }

  saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn("Error guardando progreso en localStorage:", e);
    }
  }

  recordGameFinished(waveReached, enemiesKilled) {
    this.data.gamesPlayed++;
    if (waveReached > this.data.highestWave) {
      this.data.highestWave = waveReached;
    }
    this.data.totalEnemiesKilled += enemiesKilled;

    // Desbloqueo progresivo de poderes divinos cada 5 partidas según el GDD
    if (this.data.gamesPlayed >= 0 && !this.data.unlockedPowers.includes("DEMETER")) {
      this.data.unlockedPowers.push("DEMETER");
    }
    if (this.data.gamesPlayed >= 5 && !this.data.unlockedPowers.includes("HERA")) {
      this.data.unlockedPowers.push("HERA");
    }
    if (this.data.gamesPlayed >= 10 && !this.data.unlockedPowers.includes("ARTEMISA")) {
      this.data.unlockedPowers.push("ARTEMISA");
    }
    if (this.data.gamesPlayed >= 15 && !this.data.unlockedPowers.includes("HERMES")) {
      this.data.unlockedPowers.push("HERMES");
    }
    if (this.data.gamesPlayed >= 20 && !this.data.unlockedPowers.includes("CRONOS")) {
      this.data.unlockedPowers.push("CRONOS");
    }

    this.saveProgress();
    return this.data.gamesPlayed;
  }

  isTutorialCompleted() {
    return !!this.data.tutorialCompleted;
  }

  completeTutorial() {
    this.data.tutorialCompleted = true;
    this.saveProgress();
  }

  isLoreSeen() {
    return !!this.data.loreSeen;
  }

  setLoreSeen(seen = true) {
    this.data.loreSeen = seen;
    this.saveProgress();
  }

  resetProgress() {
    this.data = {
      gamesPlayed: 0,
      highestWave: 0,
      totalEnemiesKilled: 0,
      tutorialCompleted: false,
      loreSeen: false,
      unlockedPowers: ["DEMETER"],
      equippedPower: "DEMETER"
    };
    this.saveProgress();
  }

  getGamesPlayed() {
    return this.data.gamesPlayed;
  }

  getHighestWave() {
    return this.data.highestWave;
  }

  getTotalEnemiesKilled() {
    return this.data.totalEnemiesKilled;
  }

  getUnlockedPowers() {
    return this.data.unlockedPowers || ["DEMETER"];
  }

  isPowerUnlocked(powerId) {
    return true; // Todos los poderes desbloqueados para pruebas
  }

  getEquippedPower() {
    return this.data.equippedPower || "DEMETER";
  }

  setEquippedPower(powerId) {
    this.data.equippedPower = powerId;
    if (!this.data.unlockedPowers.includes(powerId)) {
      this.data.unlockedPowers.push(powerId);
    }
    this.saveProgress();
  }
}
