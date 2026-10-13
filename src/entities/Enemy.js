/**
 * Enemy.js - Clase base de enemigos con movimiento fluido entre waypoints,
 * cálculo de distancia recorrida (prioridad de apuntado) y mecánica de pareja Alóadas.
 */

import { Vector2 } from '../core/Vector2.js';
import { BALANCE } from '../config/balance.js';

let enemyIdCounter = 1;

export class Enemy {
  constructor(config, waypoints, waveNumber = 1) {
    this.id = enemyIdCounter++;
    this.type = config.type;
    this.name = config.name;
    
    // Escalado de vida según la oleada (exponencial según GDD)
    const waveHpScaling = Math.pow(BALANCE.ENEMY_HP_GROWTH, waveNumber - 1);
    this.maxHp = Math.round(config.hp * waveHpScaling);
    this.hp = this.maxHp;
    
    this.baseSpeed = config.speed;
    this.currentSpeed = this.baseSpeed;
    this.goldReward = config.goldReward;
    this.radius = config.radius;
    this.color = config.color;
    this.borderColor = config.borderColor;

    // Rutas y posición
    this.waypoints = waypoints;
    this.waypointIndex = 0;
    this.pos = waypoints[0].clone();
    this.distanceTravelled = 0;

    // Estados
    this.isDead = false;
    this.reachedExit = false;
    this.isImmune = false;

    // Mecánica de Pareja (Alóadas)
    this.partner = null;             // Referencia a su compañero
    this.isEnraged = false;
    this.frenzyMultiplier = config.frenzySpeedMultiplier || 1.8;

    // Modificadores temporales (Slow, Stun, Marca de Artemisa)
    this.slowTimer = 0;
    this.slowFactor = 1.0;
    this.stunTimer = 0;
    this.markTimer = 0;
    this.markAmp = 0;
  }

  setPartner(otherEnemy) {
    this.partner = otherEnemy;
    otherEnemy.partner = this;
  }

  triggerFrenzy() {
    if (!this.isEnraged && !this.isDead && !this.reachedExit) {
      this.isEnraged = true;
      this.currentSpeed = this.baseSpeed * this.frenzyMultiplier;
      this.color = "#dc2626"; // Resplandor rojo de furia
    }
  }

  takeDamage(amount) {
    // Si ya llegó al final o es inmune, no puede morir por daño ni otorgar oro
    if (this.isDead || this.reachedExit || this.isImmune) return false;

    // Si tiene la marca divina de Artemisa, recibe +20% de daño
    let finalDamage = amount;
    if (this.markTimer > 0) {
      finalDamage = Math.round(amount * (1 + (this.markAmp || 0.20)));
    }

    this.hp -= finalDamage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
      return true; // Enemigo murió legítimamente por daño de torre
    }
    return false;
  }

  die() {
    this.isDead = true;

    // Si era parte de una pareja Alóada, el sobreviviente entra en furia
    if (this.partner && !this.partner.isDead && !this.partner.reachedExit) {
      this.partner.triggerFrenzy();
      this.partner.partner = null;
    }
  }

  update(dt) {
    if (this.isDead || this.reachedExit) return;

    // Reducir temporizador de marca de Artemisa
    if (this.markTimer > 0) {
      this.markTimer = Math.max(0, this.markTimer - dt);
    }

    // Gestión de aturdimiento (Stun)
    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      return;
    }

    // Gestión de ralentización (Slow)
    let effectiveSpeed = this.currentSpeed;
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      effectiveSpeed *= this.slowFactor;
    }

    // Movimiento hacia el siguiente waypoint
    const targetWaypoint = this.waypoints[this.waypointIndex + 1];
    if (!targetWaypoint) {
      this.reachedExit = true;
      this.isImmune = true;
      return;
    }

    const direction = targetWaypoint.clone().sub(this.pos);
    const distToTarget = direction.length();
    const step = effectiveSpeed * dt;

    if (distToTarget <= step) {
      // Llega al waypoint actual
      this.pos = targetWaypoint.clone();
      this.distanceTravelled += distToTarget;
      this.waypointIndex++;

      // Si alcanzó el último waypoint (Monte Olimpo), entra a la base
      if (this.waypointIndex >= this.waypoints.length - 1) {
        this.reachedExit = true;
        this.isImmune = true;
      }
    } else {
      // Avanza en dirección al waypoint
      direction.normalize();
      this.pos.add(direction.multiply(step));
      this.distanceTravelled += step;
    }
  }
}
