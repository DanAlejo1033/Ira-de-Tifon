/**
 * Projectile.js - Flechas, virotes, bombas de Ares y orbes de agua de Poseidón.
 */

import { Vector2 } from '../core/Vector2.js';

export class Projectile {
  constructor(startPos, targetEnemy, damage, speed = 480, type = "HERCULES", options = {}) {
    this.pos = startPos.clone();
    this.target = targetEnemy;
    this.lastTargetPos = targetEnemy ? targetEnemy.pos.clone() : startPos.clone();
    this.damage = damage;
    this.speed = speed;
    this.type = type;
    this.splashRadius = options.splashRadius || 0;
    this.slowFactor = options.slowFactor || 1.0;
    this.slowDuration = options.slowDuration || 0;
    this.stunDuration = options.stunDuration || 0;
    this.offsetAngle = options.offsetAngle || 0; // Para flechas dobles/triples de Hércules

    this.radius = type === "ARES" ? 6 : type === "POSEIDON" ? 5 : type === "SHRAPNEL" ? 3 : 4;
    this.hasHit = false;
    this.rotation = 0;

    // Opciones de Esquirlas (Ares Forma 2 y 3)
    this.isShrapnel = options.isShrapnel || false;
    this.shrapnelCount = options.shrapnelCount || 6;
    this.angle = options.angle || 0;
    this.maxDistance = options.maxDistance || 80;
    this.traveled = 0;
  }

  update(dt, enemiesList, particleSystem, projectilesList = null) {
    if (this.hasHit) return;

    // Manejo de proyectil tipo Esquirla
    if (this.type === "SHRAPNEL") {
      const step = this.speed * dt;
      this.pos.x += Math.cos(this.angle) * step;
      this.pos.y += Math.sin(this.angle) * step;
      this.traveled += step;
      this.rotation = this.angle;

      if (this.traveled >= this.maxDistance) {
        this.hasHit = true;
        return;
      }

      // Colisión con enemigos
      if (enemiesList) {
        for (const enemy of enemiesList) {
          if (enemy.isDead || enemy.reachedExit || enemy.isImmune) continue;
          if (this.pos.distance(enemy.pos) <= 12 + enemy.radius) {
            enemy.takeDamage(this.damage);
            if (particleSystem) {
              particleSystem.addHitSparks(this.pos, "#f97316", 4);
            }
            this.hasHit = true;
            return;
          }
        }
      }
      return;
    }

    if (this.target && (this.target.reachedExit || this.target.isImmune)) {
      this.hasHit = true;
      return;
    }

    const dest = (this.target && !this.target.isDead) ? this.target.pos : this.lastTargetPos;
    this.lastTargetPos = dest.clone();

    const dir = dest.clone().sub(this.pos);
    const dist = dir.length();
    this.rotation = dir.angle() + this.offsetAngle;

    const step = this.speed * dt;

    if (dist <= step || dist < 12) {
      this.hasHit = true;

      if (this.splashRadius > 0 && enemiesList) {
        // Impacto en área (Ares / Poseidón)
        if (this.type === "ARES" && particleSystem) {
          particleSystem.addExplosion(this.pos, this.splashRadius);

          // Si es Ares rama Esquirlas, desatar proyectiles radiales de esquirlas
          if (this.isShrapnel && projectilesList) {
            const count = this.shrapnelCount || 6;
            const shrapnelDmg = Math.max(8, Math.round(this.damage * 0.45));
            for (let i = 0; i < count; i++) {
              const ang = (i * (Math.PI * 2 / count)) + (Math.random() * 0.3 - 0.15);
              projectilesList.push(new Projectile(
                this.pos.clone(),
                null,
                shrapnelDmg,
                390,
                "SHRAPNEL",
                { angle: ang, maxDistance: 78 }
              ));
            }
          }
        } else if (this.type === "POSEIDON" && particleSystem) {
          particleSystem.addWaterSplash(this.pos, this.splashRadius);
        }

        for (const enemy of enemiesList) {
          if (enemy.isDead || enemy.reachedExit || enemy.isImmune) continue;

          const distToEnemy = this.pos.distance(enemy.pos);
          if (distToEnemy <= this.splashRadius + enemy.radius) {
            enemy.takeDamage(this.damage);

            if (this.slowDuration > 0) {
              enemy.slowTimer = this.slowDuration;
              enemy.slowFactor = this.slowFactor;
            }

            // Stun de Forma 3 de Poseidón (una sola vez por monstruo según el GDD)
            if (this.stunDuration > 0 && !enemy.hasBeenStunnedByPoseidon) {
              enemy.stunTimer = this.stunDuration;
              enemy.hasBeenStunnedByPoseidon = true;
            }
          }
        }
      } else {
        // Impacto directo a un objetivo (Hércules)
        if (this.target && !this.target.isDead && !this.target.reachedExit && !this.target.isImmune) {
          this.target.takeDamage(this.damage);
          if (particleSystem) {
            particleSystem.addHitSparks(this.pos, "#ffd166", 5);
          }
        }
      }
    } else {
      dir.normalize();
      this.pos.add(dir.multiply(step));
    }
  }
}
