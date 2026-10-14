/**
 * PowerManager.js - Gestor de Habilidades y Poderes Divinos en batalla.
 * Implementa las 5 habilidades del GDD:
 * - Deméter (Zona, zarzas 3s, aturde 1.5s)
 * - Hera (Zona, 30% / 20% daño máximo)
 * - Artemisa (Zona, marca de vulnerabilidad +20% daño 3s)
 * - Hermes (Global, +50% oro 5s)
 * - Cronos (Global, +50% cadencia de torres 5s)
 */

import { POWERS_DATA } from '../config/powersData.js';
import { Vector2 } from '../core/Vector2.js';

export class PowerManager {
  constructor(economyManager, progressManager, particleSystem) {
    this.economy = economyManager;
    this.progress = progressManager;
    this.particles = particleSystem;

    this.equippedPowerId = this.progress.getEquippedPower() || null;
    this.cooldownRemaining = 0;
    this.activeEffectRemaining = 0; // Duración restante del efecto activo
    this.isTargeting = false;
    this.mouseWorldPos = new Vector2(0, 0);

    // Zonas activas en el campo de batalla
    this.activeZones = []; // { id, powerId, pos, radius, duration, maxDuration, affectedEnemyIds: Set }
    this.nextZoneId = 1;

    // Buffs globales activos
    this.hermesTimer = 0;
    this.cronosTimer = 0;
  }

  getEquippedPowerConfig() {
    if (!this.equippedPowerId) return null;
    return POWERS_DATA[this.equippedPowerId] || null;
  }

  setEquippedPower(powerId, isSandbox = false) {
    if (powerId === null) {
      this.equippedPowerId = null;
      this.progress.setEquippedPower(null, isSandbox);
      this.cooldownRemaining = 0;
      this.activeEffectRemaining = 0;
      this.isTargeting = false;
      return;
    }
    if (POWERS_DATA[powerId]) {
      this.equippedPowerId = powerId;
      this.progress.setEquippedPower(powerId, isSandbox);
      this.cooldownRemaining = 0;
      this.activeEffectRemaining = 0;
      this.isTargeting = false;
    }
  }

  reset() {
    this.equippedPowerId = this.progress.getEquippedPower() || null;
    this.cooldownRemaining = 0;
    this.activeEffectRemaining = 0;
    this.isTargeting = false;
    this.activeZones = [];
    this.hermesTimer = 0;
    this.cronosTimer = 0;
  }

  canCast() {
    const config = this.getEquippedPowerConfig();
    if (!config) return false;
    return this.activeEffectRemaining <= 0 && this.cooldownRemaining <= 0 && this.economy.canAfford(config.goldCost);
  }

  startCast() {
    const config = this.getEquippedPowerConfig();
    if (!config) {
      return { success: false, reason: "Aún no tienes bendiciones divinas. ¡Juega 5 partidas o activa el Modo Pruebas en el menú!" };
    }
    if (this.activeEffectRemaining > 0) {
      return { success: false, reason: `Efecto divino activo (${Math.ceil(this.activeEffectRemaining)}s)` };
    }
    if (this.cooldownRemaining > 0) {
      return { success: false, reason: `En enfriamiento (${Math.ceil(this.cooldownRemaining)}s)` };
    }
    if (!this.economy.canAfford(config.goldCost)) {
      return { success: false, reason: `Oro insuficiente (requiere 🪙 ${config.goldCost})` };
    }

    // Poderes Globales (Hermes y Cronos): se activan inmediatamente en todo el tablero
    if (config.type === "GLOBAL") {
      const executed = this.executeGlobalCast();
      return { success: executed, mode: "GLOBAL", config };
    }

    // Poderes de Zona (Deméter, Hera, Artemisa): activan modo apuntado
    this.isTargeting = true;
    if (!this.mouseWorldPos || (this.mouseWorldPos.x === 0 && this.mouseWorldPos.y === 0)) {
      this.mouseWorldPos = new Vector2(512, 320); // Centro de la pantalla por defecto
    }
    return { success: true, mode: "ZONE_TARGETING", config };
  }

  cancelCast() {
    this.isTargeting = false;
  }

  updateMousePos(x, y) {
    this.mouseWorldPos.x = x;
    this.mouseWorldPos.y = y;
  }

  /**
   * Ejecuta el lanzamiento de una habilidad de zona en las coordenadas (x, y).
   */
  executeZoneCast(worldX, worldY, enemies = [], towers = []) {
    const config = this.getEquippedPowerConfig();
    if (!this.economy.spendGold(config.goldCost)) {
      this.isTargeting = false;
      return false;
    }

    // El contador de cooldown NO inicia aquí; se inicia solo cuando acaba el efecto
    const effectDuration = config.id === "HERA" ? 1.2 : config.duration;
    this.activeEffectRemaining = effectDuration;
    this.cooldownRemaining = 0;
    this.isTargeting = false;

    const targetPos = new Vector2(worldX, worldY);

    if (config.id === "HERA") {
      // Impacto celestial directo de Hera y cráter flameante durante 1.2s
      this.triggerHeraImpact(targetPos, config, enemies);
      this.activeZones.push({
        id: this.nextZoneId++,
        powerId: "HERA",
        pos: targetPos,
        radius: config.radius,
        duration: 1.2,
        maxDuration: 1.2,
        affectedEnemyIds: new Set()
      });
    } else if (config.id === "DEMETER") {
      // Campo de Zarzas y raíces sagradas (3.5s de duración, aturde 1.5s)
      this.activeZones.push({
        id: this.nextZoneId++,
        powerId: "DEMETER",
        pos: targetPos,
        radius: config.radius,
        duration: config.duration,
        maxDuration: config.duration,
        affectedEnemyIds: new Set()
      });
      if (this.particles) {
        this.particles.addDivineBlast(targetPos, "#22c55e", config.radius);
        this.particles.addFloatingText(targetPos, `🌿 ¡ZARZAS DE DEMÉTER!`, "#22c55e", true);
      }
    } else if (config.id === "ARTEMISA") {
      // Fuerza de Hércules: Zona de poder heroico 3.5s que marca a los enemigos (+20% daño recibido)
      this.activeZones.push({
        id: this.nextZoneId++,
        powerId: "ARTEMISA",
        pos: targetPos,
        radius: config.radius,
        duration: config.duration,
        maxDuration: config.duration,
        affectedEnemyIds: new Set()
      });
      if (this.particles) {
        this.particles.addDivineBlast(targetPos, "#eab308", config.radius);
        this.particles.addFloatingText(targetPos, `🦁 ¡FUERZA DE HÉRCULES!`, "#facc15", true);
      }
    }

    return true;
  }

  triggerHeraImpact(targetPos, config, enemies) {
    if (this.particles) {
      this.particles.addDivineBlast(targetPos, "#ec4899", config.radius * 1.2);
      this.particles.addHitSparks(targetPos, "#fde047", 20);
      this.particles.addFloatingText(targetPos, `🦚 ¡CÓLERA DE HERA!`, "#ec4899", true);
    }

    let hitCount = 0;
    for (const enemy of enemies) {
      if (enemy.isDead || enemy.reachedExit || enemy.isImmune) continue;
      if (enemy.pos.distance(targetPos) <= config.radius) {
        // Daño porcentual: 20% a gigantes/tanques, 30% a normales/rápidos
        const isGiantOrTank = enemy.type === "TANK" || enemy.type === "GIANT" || enemy.type === "BOSS";
        const percent = isGiantOrTank ? config.giantHpPercent : config.normalHpPercent;
        const damage = Math.max(15, Math.round(enemy.maxHp * percent));

        const killed = enemy.takeDamage(damage);
        hitCount++;

        if (this.particles) {
          this.particles.addHitSparks(enemy.pos, "#f43f5e", 8);
          this.particles.addFloatingText(enemy.pos, `-${damage} 💥`, "#f43f5e", false);
        }
      }
    }
  }

  /**
   * Ejecuta una habilidad global (Hermes o Cronos).
   */
  executeGlobalCast() {
    const config = this.getEquippedPowerConfig();
    if (!this.economy.spendGold(config.goldCost)) {
      return false;
    }

    // El contador de cooldown NO inicia aquí; se inicia solo cuando acaba el efecto activo
    this.activeEffectRemaining = config.duration;
    this.cooldownRemaining = 0;
    this.isTargeting = false;

    if (config.id === "HERMES") {
      this.hermesTimer = config.duration;
      if (this.particles) {
        this.particles.addDivineBlast(new Vector2(512, 320), "#facc15", 350);
        this.particles.addFloatingText(new Vector2(512, 140), `🪽 ¡VIENTO DE HERMES! (+50% ORO)`, "#facc15", true);
      }
    } else if (config.id === "CRONOS") {
      this.cronosTimer = config.duration;
      if (this.particles) {
        this.particles.addDivineBlast(new Vector2(512, 320), "#a855f7", 350);
        this.particles.addFloatingText(new Vector2(512, 140), `⏳ ¡DISTORSIÓN DE CRONOS! (+50% CADENCIA)`, "#a855f7", true);
      }
    }

    return true;
  }

  isHermesActive() {
    return this.hermesTimer > 0;
  }

  isCronosActive() {
    return this.cronosTimer > 0;
  }

  update(dt, isWaitingWave, enemies = [], towers = []) {
    // 1. Contador de duración del efecto activo
    if (this.activeEffectRemaining > 0) {
      this.activeEffectRemaining = Math.max(0, this.activeEffectRemaining - dt);
      // El contador de cooldown SOLO inicia cuando acaba el efecto
      if (this.activeEffectRemaining <= 0) {
        const config = this.getEquippedPowerConfig();
        this.cooldownRemaining = config ? config.cooldown : 0;
      }
    } else {
      // 2. Enfriamiento (según el GDD: se pausa mientras se espera entre oleadas)
      if (!isWaitingWave && this.cooldownRemaining > 0) {
        this.cooldownRemaining = Math.max(0, this.cooldownRemaining - dt);
      }
    }

    // 3. Buffs globales
    if (this.hermesTimer > 0) {
      this.hermesTimer = Math.max(0, this.hermesTimer - dt);
    }
    if (this.cronosTimer > 0) {
      this.cronosTimer = Math.max(0, this.cronosTimer - dt);
    }

    // Aplicar buff de Cronos a todas las torres (+50% cadencia de ataque global)
    const cronosMultiplier = this.isCronosActive() ? 1.5 : 1.0;
    for (const tower of towers) {
      tower.attackSpeedMultiplier = cronosMultiplier;
    }

    // 3. Zonas persistentes activas (Deméter y Artemisa)
    for (let i = this.activeZones.length - 1; i >= 0; i--) {
      const zone = this.activeZones[i];
      zone.duration -= dt;

      if (zone.duration <= 0) {
        this.activeZones.splice(i, 1);
        continue;
      }

      // Comprobar colisión con enemigos
      for (const enemy of enemies) {
        if (enemy.isDead || enemy.reachedExit || enemy.isImmune) continue;
        if (enemy.pos.distance(zone.pos) <= zone.radius) {
          if (zone.powerId === "DEMETER") {
            // Aturde 1.5s a cada enemigo que entre, una sola vez por zona
            if (!zone.affectedEnemyIds.has(enemy.id)) {
              zone.affectedEnemyIds.add(enemy.id);
              enemy.stunTimer = 1.5;
              if (this.particles) {
                this.particles.addFloatingText(enemy.pos, `🌿 ¡ATURDIDO!`, "#22c55e", false);
                this.particles.addHitSparks(enemy.pos, "#22c55e", 6);
              }
            }
          } else if (zone.powerId === "ARTEMISA") {
            // Marca de vulnerabilidad heroica de Hércules (+20% de daño recibido por 4s)
            enemy.markTimer = 4.0;
            enemy.markAmp = 0.20;
            if (!zone.affectedEnemyIds.has(enemy.id)) {
              zone.affectedEnemyIds.add(enemy.id);
              if (this.particles) {
                this.particles.addFloatingText(enemy.pos, `🦁 ¡VULNERABLE! (+20% DAÑO)`, "#facc15", false);
              }
            }
          }
        }
      }
    }
  }
}
