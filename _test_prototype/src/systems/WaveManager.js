/**
 * WaveManager.js - Gestor de oleadas infinitas y control manual del jugador.
 * La oleada NO inicia automáticamente: el jugador siempre tiene el control de cuándo comenzar.
 */

import { BALANCE, goldMultiplier } from '../config/balance.js';
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

    // Canales de spawn concurrentes (permite que múltiples oleadas y entidades nazcan simultáneamente)
    this.activeSpawners = [];
    this.spawnQueueTotalHp = 0;
    this.spawnInterval = 0.85; // Segundos base entre spawn de cada enemigo
    this.callCooldown = 0; // Cooldown de 5 segundos para llamar o adelantar nueva oleada
    this.activeEnemies = [];
    this.totalEnemiesKilled = 0;
    this.enemiesLeakedThisWave = 0;
    this.currentWaveTotalHp = 0;
    this.isChaosMode = false;
    this.onTitanicFuryCallback = null;
  }

  setChaosMode(enabled, onTitanicFuryCallback = null) {
    this.isChaosMode = Boolean(enabled);
    this.onTitanicFuryCallback = onTitanicFuryCallback;
  }

  reset() {
    this.currentWave = 0;
    this.isWaveActive = false;
    this.activeSpawners = [];
    this.spawnQueueTotalHp = 0;
    this.callCooldown = 0;
    this.activeEnemies = [];
    this.totalEnemiesKilled = 0;
    this.enemiesLeakedThisWave = 0;
    this.currentWaveTotalHp = 0;
    this.isChaosMode = false;
    this.onTitanicFuryCallback = null;
  }

  // Getter de compatibilidad
  get spawnQueue() {
    const list = [];
    for (const spawner of this.activeSpawners) {
      list.push(...spawner.queue);
    }
    return list;
  }

  canTriggerNextWave() {
    return this.callCooldown <= 0;
  }

  get isWaitingNextWave() {
    return !this.isWaveActive;
  }

  getEnemiesRemaining() {
    let queued = 0;
    for (const spawner of this.activeSpawners) {
      queued += spawner.queue.length;
    }
    return queued + this.activeEnemies.length;
  }

  /**
   * Bono de riesgo por llamar una oleada anticipada (Modelo Híbrido: Base + Caos por congestión).
   */
  getEarlyCallBonus() {
    if (!this.isWaveActive) {
      return 0;
    }

    const nextWave = this.currentWave + 1;
    const waveReward = (BALANCE.BASE_WAVE_REWARD + nextWave * BALANCE.WAVE_REWARD_GROWTH) * goldMultiplier(nextWave);

    // 1. Bonus Base: Premio mínimo garantizado
    const bonusBase = Math.round(waveReward * BALANCE.EARLY_WAVE_BASE_RATIO);

    // 2. Bonus de Caos: Congestión de enemigos vivos en combate y en cola
    let currentHpTotal = 0;
    for (const enemy of this.activeEnemies) {
      if (!enemy.isDead && !enemy.reachedExit) {
        currentHpTotal += Math.max(0, enemy.hp);
      }
    }
    currentHpTotal += this.spawnQueueTotalHp;

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
   * Aplica un cooldown de 5 segundos para evitar sobrecarga y crasheos por spam.
   */
  triggerNextWave() {
    if (!this.canTriggerNextWave()) {
      return false;
    }

    // Activar cooldown de 5 segundos
    this.callCooldown = BALANCE.WAVE_CALL_COOLDOWN || 5.0;

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
    let newEnemies;
    let interval;

    if (this.isChaosMode) {
      newEnemies = this.generateChaosWaveComposition(this.currentWave);
      // Spawn acelerado de alta densidad (0.55s base bajando hasta 0.28s)
      const chaosBase = BALANCE.CHAOS?.SPAWN_INTERVAL_BASE || 0.55;
      const chaosMin = BALANCE.CHAOS?.SPAWN_INTERVAL_MIN || 0.28;
      interval = Math.max(chaosMin, chaosBase - (this.currentWave * 0.012));

      // Furia Titánica cada 3 oleadas (Oleadas 3, 6, 9, 12...)
      const furyInterval = BALANCE.CHAOS?.TITANIC_FURY_INTERVAL || 3;
      if (this.currentWave % furyInterval === 0) {
        const furyCycle = Math.floor(this.currentWave / furyInterval);
        const furyType = (furyCycle % 2 === 1) ? 'SPEED' : 'RESISTANCE';
        const buffMultiplier = BALANCE.CHAOS?.TITANIC_FURY_BUFF || 1.30;

        for (const enemy of newEnemies) {
          enemy.applyTitanicFury(furyType, buffMultiplier);
        }

        if (this.onTitanicFuryCallback) {
          this.onTitanicFuryCallback(this.currentWave, furyType, 30);
        }
      }
    } else {
      newEnemies = this.generateWaveComposition(this.currentWave);
      interval = Math.max(0.45, this.spawnInterval - Math.min(0.35, this.currentWave * 0.02));
    }

    for (const enemy of newEnemies) {
      const hp = (enemy.maxHp || enemy.hp || 0);
      this.currentWaveTotalHp += hp;
      this.spawnQueueTotalHp += hp;
    }

    // Crear un canal de spawn independiente y concurrente para esta oleada
    // timer = 0 permite que la primera entidad nazca INMEDIATAMENTE al adelantar la oleada
    this.activeSpawners.push({
      wave: this.currentWave,
      queue: newEnemies,
      timer: 0,
      interval: interval
    });

    return true;
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
          // El 7mo soldado resiste con vida colosal (550 HP) para superar el fuego cruzado de las 3 torres y alcanzar las puertas del Olimpo, enseñando pedagógicamente la pérdida de vida
          enemy.hp = 550;
          enemy.maxHp = 550;
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

  /**
   * Generación caótica, masiva y anárquica para el MODO CAOS.
   * Monstruos avanzados desde la oleada 1, parejas Alóadas desde oleada 2, Gigantes desde oleada 3,
   * y una densidad masiva con interleaving pseudo-aleatorio para alta rejugabilidad.
   */
  generateChaosWaveComposition(wave) {
    const list = [];
    const waypoints = this.grid.getWaypoints();

    let countNormal = 0;
    let countFast = 0;
    let countTank = 0;
    let countPairs = 0;
    let countGiants = 0;

    if (wave === 1) {
      countNormal = 9;
      countFast = 5;
      countTank = 1;
      countPairs = 0;
      countGiants = 0;
    } else if (wave === 2) {
      countNormal = 8;
      countFast = 6;
      countTank = 2;
      countPairs = 1;
      countGiants = 0;
    } else if (wave === 3) {
      countNormal = 9;
      countFast = 7;
      countTank = 2;
      countPairs = 1;
      countGiants = 1;
    } else {
      // Oleada 4+: escalado arcade infinito denso
      countNormal = 8 + Math.floor(wave * 1.5);
      countFast = 6 + Math.floor(wave * 1.2);
      countTank = 2 + Math.floor(wave * 0.6);
      countPairs = 1 + Math.floor(wave / 3);
      countGiants = Math.floor(wave / 2.5);
    }

    // Crear lista de enemigos individuales para barajar (anarquía)
    const singles = [];
    for (let i = 0; i < countNormal; i++) {
      singles.push(new Enemy(ENEMIES.NORMAL, waypoints, wave));
    }
    for (let i = 0; i < countFast; i++) {
      singles.push(new Enemy(ENEMIES.FAST, waypoints, wave));
    }
    for (let i = 0; i < countTank; i++) {
      singles.push(new Enemy(ENEMIES.TANK, waypoints, wave));
    }
    for (let i = 0; i < countGiants; i++) {
      singles.push(new Enemy(ENEMIES.GIANT, waypoints, wave));
    }

    // Barajar ligeramente las unidades individuales para orden impredecible
    for (let i = singles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = singles[i];
      singles[i] = singles[j];
      singles[j] = temp;
    }

    // Crear parejas Alóadas y vincularlas
    const pairs = [];
    for (let i = 0; i < countPairs; i++) {
      const a1 = new Enemy(ENEMIES.ALOADAE, waypoints, wave);
      const a2 = new Enemy(ENEMIES.ALOADAE, waypoints, wave);
      a1.setPartner(a2);
      pairs.push([a1, a2]);
    }

    // Insertar las parejas distribuidas entre las unidades individuales
    if (pairs.length === 0) {
      return singles;
    }

    const step = Math.max(3, Math.floor(singles.length / (pairs.length + 1)));
    let currentPairIdx = 0;

    for (let i = 0; i < singles.length; i++) {
      list.push(singles[i]);
      if ((i + 1) % step === 0 && currentPairIdx < pairs.length) {
        list.push(pairs[currentPairIdx][0], pairs[currentPairIdx][1]);
        currentPairIdx++;
      }
    }

    while (currentPairIdx < pairs.length) {
      list.push(pairs[currentPairIdx][0], pairs[currentPairIdx][1]);
      currentPairIdx++;
    }

    return list;
  }

  update(dt, onEnemyReachesExitCallback, onEnemyKilledCallback) {
    // Actualizar cooldown de llamada de oleada
    if (this.callCooldown > 0) {
      this.callCooldown = Math.max(0, this.callCooldown - dt);
    }

    // Spawn simultáneo: procesar concurrentemente cada canal de oleada activa
    for (let sIdx = this.activeSpawners.length - 1; sIdx >= 0; sIdx--) {
      const spawner = this.activeSpawners[sIdx];
      if (spawner.queue.length > 0) {
        spawner.timer -= dt;
        if (spawner.timer <= 0) {
          const nextEnemy = spawner.queue.shift();
          const nextHp = (nextEnemy.maxHp || nextEnemy.hp || 0);
          this.spawnQueueTotalHp = Math.max(0, this.spawnQueueTotalHp - nextHp);

          // Leve variación lateral sobre el ancho del carril para legibilidad al spawnear juntos
          nextEnemy.pos.y += (Math.random() - 0.5) * 16;
          this.activeEnemies.push(nextEnemy);

          // Si es una pareja Alóada, spawnear ambos simultáneamente
          if (nextEnemy.partner && spawner.queue.includes(nextEnemy.partner)) {
            const pIdx = spawner.queue.indexOf(nextEnemy.partner);
            const partner = spawner.queue.splice(pIdx, 1)[0];
            const partnerHp = (partner.maxHp || partner.hp || 0);
            this.spawnQueueTotalHp = Math.max(0, this.spawnQueueTotalHp - partnerHp);
            partner.pos.y += (Math.random() - 0.5) * 16;
            this.activeEnemies.push(partner);
          }

          spawner.timer = spawner.interval;
        }
      }

      if (spawner.queue.length === 0) {
        this.activeSpawners.splice(sIdx, 1);
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
    const remainingQueued = this.activeSpawners.reduce((acc, s) => acc + s.queue.length, 0);
    if (this.isWaveActive && remainingQueued === 0 && this.activeEnemies.length === 0) {
      this.isWaveActive = false;
      this.currentWaveTotalHp = 0;
      this.spawnQueueTotalHp = 0;
      const leaked = this.enemiesLeakedThisWave;
      const reward = (BALANCE.BASE_WAVE_REWARD + this.currentWave * BALANCE.WAVE_REWARD_GROWTH) * goldMultiplier(this.currentWave);

      if (this.onWaveCompleted) {
        this.onWaveCompleted(this.currentWave, reward, leaked);
      }
    }
  }

  serialize() {
    return {
      currentWave: this.currentWave,
      totalEnemiesKilled: this.totalEnemiesKilled,
      isWaveActive: this.isWaveActive
    };
  }

  restore(data) {
    if (!data) return;
    this.reset();
    // Si la partida se guardó mientras una oleada estaba en marcha,
    // restauramos al inicio de esa oleada para que el jugador pueda disputarla limpiamente.
    if (data.isWaveActive && data.currentWave > 0) {
      this.currentWave = Math.max(0, data.currentWave - 1);
    } else {
      this.currentWave = data.currentWave || 0;
    }
    this.totalEnemiesKilled = data.totalEnemiesKilled || 0;
    this.isWaveActive = false;
  }
}
