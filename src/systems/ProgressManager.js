/**
 * ProgressManager.js - Persistencia del progreso y récords en localStorage.
 * Registra partidas jugadas (según Sección 7 del GDD), récords y estado del tutorial.
 */

const STORAGE_KEY = "gigantomaquia_progress_v1";
const ACTIVE_MATCH_KEY = "gigantomaquia_active_match_v1";

export class ProgressManager {
  constructor() {
    this.data = this.loadProgress();
  }

  loadProgress() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const games = parsed.gamesPlayed || 0;
        const unlocked = this.computeUnlockedPowers(games, parsed.unlockedPowers);
        let equipped = parsed.equippedPower || null;
        if (equipped && !unlocked.includes(equipped)) {
          equipped = unlocked.length > 0 ? unlocked[0] : null;
        } else if (!equipped && unlocked.length > 0) {
          equipped = unlocked[0];
        }
        return {
          gamesPlayed: games,
          highestWave: parsed.highestWave || 0,
          totalEnemiesKilled: parsed.totalEnemiesKilled || 0,
          chaosGamesPlayed: parsed.chaosGamesPlayed || 0,
          chaosHighestWave: parsed.chaosHighestWave || 0,
          chaosEnemiesKilled: parsed.chaosEnemiesKilled || 0,
          tutorialCompleted: parsed.tutorialCompleted || false,
          loreSeen: parsed.loreSeen || false,
          unlockedPowers: unlocked,
          equippedPower: equipped
        };
      }
    } catch (e) {
      console.warn("No se pudo acceder a localStorage:", e);
    }

    return {
      gamesPlayed: 0,
      highestWave: 0,
      totalEnemiesKilled: 0,
      chaosGamesPlayed: 0,
      chaosHighestWave: 0,
      chaosEnemiesKilled: 0,
      tutorialCompleted: false,
      loreSeen: false,
      unlockedPowers: [],
      equippedPower: null
    };
  }

  computeUnlockedPowers(gamesPlayed, existingUnlocked = []) {
    const list = new Set(existingUnlocked && existingUnlocked.length ? existingUnlocked : []);
    if (gamesPlayed >= 5) list.add("HERA");
    if (gamesPlayed >= 15) list.add("ARTEMISA");
    if (gamesPlayed >= 25) list.add("DEMETER");
    if (gamesPlayed >= 35) list.add("HERMES");
    if (gamesPlayed >= 45) list.add("CRONOS");
    return Array.from(list);
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

    const previouslyUnlocked = [...(this.data.unlockedPowers || [])];
    this.data.unlockedPowers = this.computeUnlockedPowers(this.data.gamesPlayed, this.data.unlockedPowers);
    const newlyUnlocked = this.data.unlockedPowers.filter(p => !previouslyUnlocked.includes(p));

    // Si no había poder equipado y se acaba de desbloquear el primer poder, auto-equipar
    if (!this.data.equippedPower && this.data.unlockedPowers.length > 0) {
      this.data.equippedPower = this.data.unlockedPowers[0];
    }

    this.saveProgress();
    return {
      gamesPlayed: this.data.gamesPlayed,
      newlyUnlocked
    };
  }

  recordChaosGameFinished(waveReached, enemiesKilled) {
    this.data.chaosGamesPlayed = (this.data.chaosGamesPlayed || 0) + 1;
    if (waveReached > (this.data.chaosHighestWave || 0)) {
      this.data.chaosHighestWave = waveReached;
    }
    this.data.chaosEnemiesKilled = (this.data.chaosEnemiesKilled || 0) + enemiesKilled;
    this.saveProgress();
    return {
      chaosGamesPlayed: this.data.chaosGamesPlayed,
      chaosHighestWave: this.data.chaosHighestWave,
      chaosEnemiesKilled: this.data.chaosEnemiesKilled
    };
  }

  isPowerUnlocked(powerId) {
    return Boolean(this.data.unlockedPowers && this.data.unlockedPowers.includes(powerId));
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
      chaosGamesPlayed: 0,
      chaosHighestWave: 0,
      chaosEnemiesKilled: 0,
      tutorialCompleted: false,
      loreSeen: false,
      unlockedPowers: [],
      equippedPower: null
    };
    this.saveProgress();
    this.clearActiveMatch();
  }

  getGamesPlayed() {
    return this.data.gamesPlayed;
  }

  getHighestWave() {
    return this.data.highestWave;
  }

  getChaosHighestWave() {
    return this.data.chaosHighestWave || 0;
  }

  getChaosEnemiesKilled() {
    return this.data.chaosEnemiesKilled || 0;
  }

  getChaosGamesPlayed() {
    return this.data.chaosGamesPlayed || 0;
  }

  getTotalEnemiesKilled() {
    return this.data.totalEnemiesKilled;
  }

  getUnlockedPowers() {
    return this.data.unlockedPowers || [];
  }

  getEquippedPower() {
    return this.data.equippedPower || null;
  }

  setEquippedPower(powerId) {
    if (powerId === null || this.isPowerUnlocked(powerId)) {
      this.data.equippedPower = powerId;
      this.saveProgress();
    }
  }

  // ==================== PARTIDA ACTIVA EN CURSO ====================
  saveActiveMatch(matchData) {
    try {
      localStorage.setItem(ACTIVE_MATCH_KEY, JSON.stringify(matchData));
    } catch (e) {
      console.warn("Error guardando partida activa en localStorage:", e);
    }
  }

  loadActiveMatch() {
    try {
      const raw = localStorage.getItem(ACTIVE_MATCH_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && data.version && data.economy && data.waveManager && Array.isArray(data.towers)) {
        if (data.economy.lives <= 0) {
          this.clearActiveMatch();
          return null;
        }
        return data;
      }
    } catch (e) {
      console.warn("Error cargando partida activa:", e);
    }
    return null;
  }

  hasActiveMatch() {
    return this.loadActiveMatch() !== null;
  }

  clearActiveMatch() {
    try {
      localStorage.removeItem(ACTIVE_MATCH_KEY);
    } catch (e) {
      console.warn("Error limpiando partida activa en localStorage:", e);
    }
  }
}
