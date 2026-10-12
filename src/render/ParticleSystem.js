/**
 * ParticleSystem.js - Efectos visuales de impacto, chispas, explosiones, rayos y agua.
 */

import { Vector2 } from '../core/Vector2.js';

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.lightningArcs = [];
  }

  addHitSparks(pos, color = "#ffd166", count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        pos: pos.clone(),
        vel: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
        color: color,
        radius: 2 + Math.random() * 2,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.5
      });
    }
  }

  addExplosion(pos, radius = 50) {
    // Onda expansiva de fuego
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * (radius * 2);
      this.particles.push({
        pos: pos.clone(),
        vel: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
        color: Math.random() > 0.4 ? "#ef4444" : "#f59e0b",
        radius: 3 + Math.random() * 3,
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.6
      });
    }
  }

  addLightningChain(points, color = "#38bdf8") {
    this.lightningArcs.push({
      points: points.map(p => p.clone()),
      color: color,
      life: 0.15,
      maxLife: 0.15
    });
  }

  addWaterSplash(pos, radius = 40) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * (radius * 1.5);
      this.particles.push({
        pos: pos.clone(),
        vel: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
        color: Math.random() > 0.3 ? "#38bdf8" : "#06b6d4",
        radius: 2.5 + Math.random() * 2.5,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.5
      });
    }
  }

  addDivineBlast(pos, color = "#f59e0b", radius = 80) {
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const speed = 40 + Math.random() * (radius * 1.6);
      this.particles.push({
        pos: pos.clone(),
        vel: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
        color: color,
        radius: 3 + Math.random() * 3.5,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7
      });
    }
  }

  addFloatingText(pos, text, color = "#ffffff", isGold = false) {
    this.floatingTexts.push({
      pos: new Vector2(pos.x, pos.y - 10),
      text: text,
      color: color,
      life: 0.8,
      maxLife: 0.8,
      isGold: isGold
    });
  }

  update(dt) {
    // Actualizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.pos.add(p.vel.clone().multiply(dt));
      p.radius = Math.max(0, p.radius - dt * 2);
    }

    // Actualizar arcos de rayo
    for (let i = this.lightningArcs.length - 1; i >= 0; i--) {
      const arc = this.lightningArcs[i];
      arc.life -= dt;
      if (arc.life <= 0) {
        this.lightningArcs.splice(i, 1);
      }
    }

    // Actualizar textos flotantes
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.pos.y -= 25 * dt; // Flota suavemente hacia arriba
    }
  }

  render(ctx) {
    // Dibujar arcos de rayo (Zeus)
    for (const arc of this.lightningArcs) {
      const alpha = Math.max(0, arc.life / arc.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = arc.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let i = 0; i < arc.points.length; i++) {
        const pt = arc.points[i];
        if (i === 0) {
          ctx.moveTo(pt.x, pt.y);
        } else {
          // Línea con zig-zag para efecto eléctrico
          const prev = arc.points[i - 1];
          const midX = (prev.x + pt.x) / 2 + (Math.random() - 0.5) * 12;
          const midY = (prev.y + pt.y) / 2 + (Math.random() - 0.5) * 12;
          ctx.lineTo(midX, midY);
          ctx.lineTo(pt.x, pt.y);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // Dibujar partículas
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Dibujar textos flotantes
    for (const ft of this.floatingTexts) {
      const alpha = Math.max(0, ft.life / ft.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = ft.isGold ? "bold 13px 'Cinzel', sans-serif" : "bold 12px 'Nunito', sans-serif";
      ctx.fillStyle = ft.color;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.pos.x, ft.pos.y);
      ctx.restore();
    }
  }
}
