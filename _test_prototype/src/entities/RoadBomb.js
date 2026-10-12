/**
 * RoadBomb.js - Mina / Bomba colocada en el camino de piedra por la torre de Ares (Forma 2 y 3).
 * Detona en una violenta explosión de área cuando los monstruos pisan la loseta.
 */

import { Vector2 } from '../core/Vector2.js';

export class RoadBomb {
  constructor(pos, damage, explosionRadius = 55, ownerTower = null, form = 2) {
    this.pos = pos.clone();
    this.damage = damage;
    this.triggerRadius = 24;
    this.explosionRadius = explosionRadius;
    this.ownerTower = ownerTower;
    this.form = form;

    this.isDetonated = false;
    this.armTimer = 0.25; // Pequeño retraso de armado al caer en el camino
    this.pulseTime = 0;
  }

  update(dt, enemiesList, particleSystem) {
    if (this.isDetonated) return;

    this.pulseTime += dt;

    if (this.armTimer > 0) {
      this.armTimer -= dt;
      return;
    }

    // Comprobar si algún enemigo pisa la mina
    for (const enemy of enemiesList) {
      if (enemy.isDead || enemy.reachedExit || enemy.isImmune) continue;

      const dist = this.pos.distance(enemy.pos);
      if (dist <= this.triggerRadius + enemy.radius) {
        this.detonate(enemiesList, particleSystem);
        break;
      }
    }
  }

  detonate(enemiesList, particleSystem) {
    this.isDetonated = true;

    if (particleSystem) {
      particleSystem.addExplosion(this.pos, this.explosionRadius);
    }

    // Daño en área a todos los monstruos dentro del radio de explosión
    for (const enemy of enemiesList) {
      if (enemy.isDead || enemy.reachedExit || enemy.isImmune) continue;

      const dist = this.pos.distance(enemy.pos);
      if (dist <= this.explosionRadius + enemy.radius) {
        enemy.takeDamage(this.damage);
      }
    }
  }

  render(ctx) {
    if (this.isDetonated) return;

    const { x, y } = this.pos;
    const pulse = Math.sin(this.pulseTime * 6) * 1.5;

    ctx.save();

    // 1. Aura de calor / advertencia en el suelo
    ctx.beginPath();
    ctx.arc(x, y, 12 + pulse, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(239, 68, 68, 0.22)";
    ctx.fill();

    // 2. Base esférica de hierro de la bomba
    ctx.beginPath();
    ctx.arc(x, y, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = "#1e293b";
    ctx.fill();
    ctx.strokeStyle = this.form === 3 ? "#f97316" : "#ef4444";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Runa de fuego central
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = this.form === 3 ? "#fbbf24" : "#f87171";
    ctx.fill();

    // 4. Mecha / chispa encendida parpadeante
    const sparkPulse = Math.sin(this.pulseTime * 14);
    ctx.beginPath();
    ctx.arc(x + 2, y - 7, 2 + Math.abs(sparkPulse) * 1.2, 0, Math.PI * 2);
    ctx.fillStyle = sparkPulse > 0 ? "#fef08a" : "#f97316";
    ctx.fill();

    ctx.restore();
  }
}
