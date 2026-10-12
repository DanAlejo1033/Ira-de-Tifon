/**
 * WaveManager.js - Gestor de oleadas infinitas y control manual del jugador.
 * La oleada NO inicia automáticamente: el jugador siempre tiene el control de cuándo comenzar.
 */

import { BALANCE } from '../config/balance.js';
import { ENEMIES } from '../config/enemiesData.js';
import { Enemy } from '../entities/Enemy.js';

export class WaveManager {
  constructor(grid, onWaveCompletedCallback, onEarlyCallBonusCallback) {
    this.grid = grid;
    this.onWaveCompleted = onWaveCompletedCallback;
    this.onEarlyCallBonus = onEarlyCallBonusCallback;

    this.currentWave = 0;
    this.isWaveActive = false; // El jugador decide cuándo empieza cada oleada
    this.isTutorialMode = false;

    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawnInterval = 0.85; // Segundos entre spawn de cada enemigo
    this.activeEnemies = [];
    this.totalEnemiesKilled = 0;
    this.enemiesLeakedThisWave = 0;
    this.currentWaveTotalHp = 0;
  }

  reset() {
    this.currentWave = 0;
    this.isWaveActive = false;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.activeEnemies = [];
    this.totalEnemiesKilled = 0;
    this.enemiesLeakedThisWave = 0;
    this.currentWaveTotalHp = 0;
  }

  getEnemiesRemaining() {
    return this.spawnQueue.length + this.activeEnemies.length;
  }

  /**
   * Bono de riesgo por llamar una oleada anticipada (Modelo Híbrido: Base + Caos por congestión).
   */
  getEarlyCallBonus() {
    if (!this.isWaveActive) {
      return 0;
    }

    const nextWave = this.currentWave + 1;
    const waveReward = BALANCE.BASE_WAVE_REWARD + nextWave * BALANCE.WAVE_REWARD_GROWTH;

    // 1. Bonus Base: Premio mínimo garantizado
    const bonusBase = Math.round(waveReward * BALANCE.EARLY_WAVE_BASE_RATIO);

    // 2. Bonus de Caos: Congestión de enemigos vivos en combate y en cola
    let currentHpTotal = 0;
    for (const enemy of this.activeEnemies) {
      if (!enemy.isDead && !enemy.reachedExit) {
        currentHpTotal += Math.max(0, enemy.hp);
      }
    }
    for (const enemy of this.spawnQueue) {
      currentHpTotal += (enemy.maxHp || enemy.hp || 0);
    }

    const ratioRemaining = currentHpTotal / Math.max(1, this.currentWaveTotalHp);
    let chaosFactor = 0;

    if (ratioRemaining > BALANCE.EARLY_CHAOS_HP_THRESHOLD) {
      // Interpolar linealmente entre 0 (en el umbral) y EARLY_WAVE_CHAOS_MAX_RATIO (al 100% de vida restante)
      const progress = (ratioRemaining - BALANCE.EARLY_CHAOS_HP_THRESHOLD) / (1 - BALANCE.EARLY_CHAOS_HP_THRESHOLD);
      const clampedProgress = Math.min(1, Math.max(0, progress));
      chaosFactor = clampedProgress * BALANCE.EARLY_WAVE_CHAOS_MAX_RATIO;
    }

    const bonusChaos = Math.round(waveReward * chaosFactor);

    // 3. Suma total del modelo híbrido
    return bonusBase + bonusChaos;
  }

  /**
   * Llamar oleada manualmente (el jugador decide cuándo empieza cada oleada).
   */
  triggerNextWave() {
    // Si ya había una oleada activa en combate, se premia el riesgo con dracmas
    if (this.isWaveActive) {
      const bonus = this.getEarlyCallBonus();
      if (this.onEarlyCallBonus && bonus > 0) {
        this.onEarlyCallBonus(bonus);
      }
    } else {
      this.enemiesLeakedThisWave = 0;
    }

    this.currentWave++;
    this.isWaveActive = true;

    // Generar la composición de la nueva oleada
    const newEnemies = this.generateWaveComposition(this.currentWave);
    for (const enemy of newEnemies) {
      this.currentWaveTotalHp += (enemy.maxHp || enemy.hp || 0);
    }
    this.spawnQueue.push(...newEnemies);
  }

  /**
   * Generación procedural y progresiva según la Sección 6 del GDD.
   */
  generateWaveComposition(wave) {
    const list = [];
    const waypoints = this.grid.getWaypoints();

    if (wave === 1) {
      // Oleada 1: Solo soldados normales (introducción limpia)
      for (let i = 0; i < 7; i++) {
        const enemy = new Enemy(ENEMIES.NORMAL, waypoints, wave);
        if (this.isTutorialMode && i === 6) {
          // El 7mo soldado resiste con vida extra para alcanzar las puertas del Olimpo y enseñar la pérdida de vida
          enemy.hp = 115;
          enemy.maxHp = 115;
        }
        list.push(enemy);
      }
    } else if (wave === 2) {
      // Oleada 2: Aparecen las rápidas (Harpías)
      for (let i = 0; i < 5; i++) {
        list.push(new Enemy(ENEMIES.NORMAL, waypoints, wave));
      }
      for (let i = 0; i < 4; i++) {
        list.push(new Enemy(ENEMIES.FAST, waypoints, wave));
      }
    } else if (wave === 3) {
      // Oleada 3: Aparece el primer Tanque (Cíclope)
      for (let i = 0; i < 6; i++) {
        list.push(new Enemy(ENEMIES.NORMAL, waypoints, wave));
      }
      list.push(new Enemy(ENEMIES.TANK, waypoints, wave));
      for (let i = 0; i < 5; i++) {
        list.push(new Enemy(ENEMIES.FAST, waypoints, wave));
      }
    } else if (wave === 4) {
      // Oleada 4: Presentación de la Pareja Alóada (Oto y Efialtes)
      for (let i = 0; i < 5; i++) {
        list.push(new Enemy(ENEMIES.NORMAL, waypoints, wave));
      }
      const aloada1 = new Enemy(ENEMIES.ALOADAE, waypoints, wave);
      const aloada2 = new Enemy(ENEMIES.ALOADAE, waypoints, wave);
      aloada1.setPartner(aloada2);
      list.push(aloada1, aloada2);
      for (let i = 0; i < 4; i++) {
        list.push(new Enemy(ENEMIES.FAST, waypoints, wave));
      }
    } else if (wave === 5) {
      // Oleada 5: Presentación del Gigante
      for (let i = 0; i < 6; i++) {
        list.push(new Enemy(ENEMIES.NORMAL, waypoints, wave));
      }
      list.push(new Enemy(ENEMIES.GIANT, waypoints, wave));
      for (let i = 0; i < 6; i++) {
        list.push(new Enemy(ENEMIES.FAST, waypoints, wave));
      }
    } else {
      // Oleada 6+ infinita: Combinaciones ricas y escaladas
      const countNormal = 6 + Math.floor(wave * 1.5);
      const countFast = 4 + Math.floor(wave * 1.2);
      const countTank = 1 + Math.floor(wave / 3);
      const countPairs = Math.floor(wave / 4);
      const countGiants = Math.floor(wave / 6);

      for (let i = 0; i < countNormal; i++) {
        list.push(new Enemy(ENEMIES.NORMAL, waypoints, wave));
      }
      for (let i = 0; i < countFast; i++) {
        list.push(new Enemy(ENEMIES.FAST, waypoints, wave));
      }
      for (let i = 0; i < countTank; i++) {
        list.push(new Enemy(ENEMIES.TANK, waypoints, wave));
      }
      for (let i = 0; i < countPairs; i++) {
        const a1 = new Enemy(ENEMIES.ALOADAE, waypoints, wave);
        const a2 = new Enemy(ENEMIES.ALOADAE, waypoints, wave);
        a1.setPartner(a2);
        list.push(a1, a2);
      }
      for (let i = 0; i < countGiants; i++) {
        list.push(new Enemy(ENEMIES.GIANT, waypoints, wave));
      }
    }

    return list;
  }

  update(dt, onEnemyReachesExitCallback, onEnemyKilledCallback) {
    // Spawn de enemigos desde la cola
    if (this.spawnQueue.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const nextEnemy = this.spawnQueue.shift();
        this.activeEnemies.push(nextEnemy);
        this.spawnTimer = Math.max(0.4, this.spawnInterval - Math.min(0.35, this.currentWave * 0.02));
      }
    }

    // Actualizar enemigos activos
    for (let i = this.activeEnemies.length - 1; i >= 0; i--) {
      const enemy = this.activeEnemies[i];
      enemy.update(dt);

      if (enemy.reachedExit) {
        this.activeEnemies.splice(i, 1);
        this.enemiesLeakedThisWave++;
        // El enemigo llegó al final: resta vida al Olimpo, NUNCA da oro
        if (onEnemyReachesExitCallback) {
          onEnemyReachesExitCallback(enemy);
        }
      } else if (enemy.isDead) {
        this.activeEnemies.splice(i, 1);
        this.totalEnemiesKilled++;
        // El enemigo murió por disparos de torres: otorga oro
        if (onEnemyKilledCallback) {
          onEnemyKilledCallback(enemy);
        }
      }
    }

    // Comprobar si se eliminaron todos los enemigos llamados
    if (this.isWaveActive && this.spawnQueue.length === 0 && this.activeEnemies.length === 0) {
      this.isWaveActive = false;
      this.currentWaveTotalHp = 0;
      const leaked = this.enemiesLeakedThisWave;
      const reward = BALANCE.BASE_WAVE_REWARD + this.currentWave * BALANCE.WAVE_REWARD_GROWTH;

      if (this.onWaveCompleted) {
        this.onWaveCompleted(this.currentWave, reward, leaked);
      }
    }
  }
}
