/**
 * Renderer.js - Motor de renderizado en HTML5 Canvas con estética de mitología griega.
 */

import { BALANCE } from '../config/balance.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.tileSize = BALANCE.TILE_SIZE;
    this.time = 0; // Para animaciones de vórtice y resplandor
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  updateTime(dt) {
    this.time += dt;
  }

  /**
   * Dibuja las celdas del mapa (terreno, caminos, obstáculos, Tifón y Olimpo).
   */
  renderMap(grid) {
    const ctx = this.ctx;
    const ts = this.tileSize;

    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const x = c * ts;
        const y = r * ts;
        const tile = grid.matrix[r][c];

        if (tile === 0) {
          // Terreno construible: Colinas de Flegra (verde oliva antiguo)
          ctx.fillStyle = (r + c) % 2 === 0 ? "#1b251e" : "#172019";
          ctx.fillRect(x, y, ts, ts);
          
          // Cuadrícula sutil
          ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
          ctx.strokeRect(x, y, ts, ts);
        } else if (tile === 1) {
          // Camino de piedra griega
          ctx.fillStyle = "#333d4b";
          ctx.fillRect(x, y, ts, ts);

          // Detalles de losas de piedra
          ctx.strokeStyle = "#252d37";
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 4, y + 4, ts - 8, ts - 8);
        } else if (tile === 2) {
          // Obstáculo: Rocas sagradas y columnas caídas
          ctx.fillStyle = "#161b22";
          ctx.fillRect(x, y, ts, ts);

          // Columna de mármol rota
          ctx.fillStyle = "#4b5563";
          ctx.beginPath();
          ctx.arc(x + ts / 2, y + ts / 2, ts * 0.35, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = "#94a3b8";
          ctx.font = "14px serif";
          ctx.textAlign = "center";
          ctx.fillText("🏛️", x + ts / 2, y + ts / 2 + 5);
        } else if (tile === 3) {
          // ENTRADA: Fisura de Tifón (Fuego y lava pulsante)
          this.renderTyphonPortal(x, y, ts);
        } else if (tile === 4) {
          // SALIDA: Monte Olimpo (Templo sagrado con luz divina)
          this.renderOlympusSanctuary(x, y, ts);
        }
      }
    }
  }

  /**
   * Renderiza una vista previa del mapa en miniatura para la tarjeta del menú principal (estilo Endless Siege).
   */
  renderMapPreview(previewCanvas, grid) {
    if (!previewCanvas || !grid) return;
    const pctx = previewCanvas.getContext('2d');
    const cols = grid.cols;
    const rows = grid.rows;
    const ts = previewCanvas.width / cols;

    pctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * ts;
        const y = r * ts;
        const tile = grid.matrix[r][c];

        if (tile === 0) {
          // Terreno
          pctx.fillStyle = (r + c) % 2 === 0 ? "#1b251e" : "#172019";
          pctx.fillRect(x, y, ts, ts);
          pctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
          pctx.lineWidth = 0.5;
          pctx.strokeRect(x, y, ts, ts);
        } else if (tile === 1) {
          // Camino de piedra
          pctx.fillStyle = "#3b4554";
          pctx.fillRect(x, y, ts, ts);
          pctx.strokeStyle = "#252e3b";
          pctx.lineWidth = 1;
          pctx.strokeRect(x + 2, y + 2, ts - 4, ts - 4);
        } else if (tile === 2) {
          // Obstáculo / colina sagrada
          pctx.fillStyle = "#161b22";
          pctx.fillRect(x, y, ts, ts);
          pctx.fillStyle = "#4b5563";
          pctx.beginPath();
          pctx.arc(x + ts / 2, y + ts / 2, ts * 0.35, 0, Math.PI * 2);
          pctx.fill();
        } else if (tile === 3) {
          // ENTRADA: Fisura de Tifón
          pctx.fillStyle = "#450a0a";
          pctx.fillRect(x, y, ts, ts);
          pctx.fillStyle = "#ef4444";
          pctx.beginPath();
          pctx.arc(x + ts / 2, y + ts / 2, ts * 0.4, 0, Math.PI * 2);
          pctx.fill();
          pctx.fillStyle = "#ffffff";
          pctx.font = `${Math.round(ts * 0.6)}px serif`;
          pctx.textAlign = "center";
          pctx.textBaseline = "middle";
          pctx.fillText("🔥", x + ts / 2, y + ts / 2);
        } else if (tile === 4) {
          // SALIDA: Monte Olimpo
          pctx.fillStyle = "#1e293b";
          pctx.fillRect(x, y, ts, ts);
          pctx.fillStyle = "#fbbf24";
          pctx.beginPath();
          pctx.arc(x + ts / 2, y + ts / 2, ts * 0.4, 0, Math.PI * 2);
          pctx.fill();
          pctx.fillStyle = "#ffffff";
          pctx.font = `${Math.round(ts * 0.6)}px serif`;
          pctx.textAlign = "center";
          pctx.textBaseline = "middle";
          pctx.fillText("🏛️", x + ts / 2, y + ts / 2);
        }
      }
    }
  }

  renderTyphonPortal(x, y, ts) {
    const ctx = this.ctx;
    const cx = x + ts / 2;
    const cy = y + ts / 2;

    // Fondo del portal
    ctx.fillStyle = "#261010";
    ctx.fillRect(x, y, ts, ts);

    // Ondas de magma pulsante
    const pulse = Math.sin(this.time * 4) * 4;
    const gradient = ctx.createRadialGradient(cx, cy, 4, cx, cy, ts * 0.45 + pulse);
    gradient.addColorStop(0, "#f97316");
    gradient.addColorStop(0.6, "#dc2626");
    gradient.addColorStop(1, "transparent");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, ts * 0.45 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Icono de Tifón / Cuernos demoníacos
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px serif";
    ctx.textAlign = "center";
    ctx.fillText("🔥", cx, cy + 7);
  }

  renderOlympusSanctuary(x, y, ts) {
    const ctx = this.ctx;
    const cx = x + ts / 2;
    const cy = y + ts / 2;

    // Fondo sagrado
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x, y, ts, ts);

    // Resplandor celestial
    const pulse = Math.sin(this.time * 3) * 3;
    const gradient = ctx.createRadialGradient(cx, cy, 5, cx, cy, ts * 0.45 + pulse);
    gradient.addColorStop(0, "#fbbf24");
    gradient.addColorStop(0.7, "#3b82f6");
    gradient.addColorStop(1, "transparent");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, ts * 0.45 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Templo sagrado
    ctx.fillStyle = "#ffffff";
    ctx.font = "22px serif";
    ctx.textAlign = "center";
    ctx.fillText("🏛️", cx, cy + 8);
  }

  /**
   * Previsualización de colocación de torre bajo el cursor del ratón.
   */
  renderPlacementPreview(gridCol, gridRow, towerConfig, isValid, grid) {
    const ctx = this.ctx;
    const ts = this.tileSize;
    const x = gridCol * ts;
    const y = gridRow * ts;
    const cx = x + ts / 2;
    const cy = y + ts / 2;

    // Celda resaltada
    ctx.fillStyle = isValid ? "rgba(34, 197, 94, 0.35)" : "rgba(239, 68, 68, 0.4)";
    ctx.fillRect(x, y, ts, ts);
    ctx.strokeStyle = isValid ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, ts, ts);

    // Círculo de alcance
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, towerConfig.range, 0, Math.PI * 2);
    ctx.fillStyle = isValid ? "rgba(245, 179, 53, 0.12)" : "rgba(239, 68, 68, 0.1)";
    ctx.fill();
    ctx.strokeStyle = isValid ? "rgba(245, 179, 53, 0.6)" : "rgba(239, 68, 68, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Rango de la torre seleccionada en el mapa.
   * Se mantiene visible mientras la ventana de mejora/información esté abierta.
   * Muestra el aumento de rango con animación durante 0.5 segundos al mejorar.
   */
  renderSelectedTowerRange(tower) {
    if (!tower) return;
    const ctx = this.ctx;

    // 1. Círculo de área de ataque actual (Rango de la torre)
    ctx.save();
    ctx.shadowColor = "rgba(245, 179, 53, 0.65)";
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(tower.pos.x, tower.pos.y, tower.range, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(245, 179, 53, 0.16)";
    ctx.fill();

    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([7, 5]);
    ctx.lineDashOffset = -this.time * 12; // Rotación sutil del borde punteado
    ctx.stroke();

    // Pequeño anillo sagrado concéntrico al 35% del rango
    ctx.beginPath();
    ctx.arc(tower.pos.x, tower.pos.y, Math.min(45, tower.range * 0.35), 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(253, 224, 71, 0.35)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();

    ctx.restore();

    // 2. Aumento de rango visual por 0.5 segundos al mejorar / evolucionar
    if (tower.rangeGrowthTimer > 0 && tower.previousRange && tower.range > tower.previousRange) {
      const progress = 1 - (tower.rangeGrowthTimer / 0.5); // 0 -> 1
      const pulseAlpha = Math.sin(progress * Math.PI) * 0.5;

      ctx.save();
      // Zona añadida entre el rango anterior y el nuevo
      ctx.beginPath();
      ctx.arc(tower.pos.x, tower.pos.y, tower.range, 0, Math.PI * 2);
      ctx.arc(tower.pos.x, tower.pos.y, tower.previousRange, 0, Math.PI * 2, true);
      ctx.fillStyle = `rgba(34, 197, 94, ${0.22 + pulseAlpha})`;
      ctx.fill();

      // Círculo anterior de referencia
      ctx.beginPath();
      ctx.arc(tower.pos.x, tower.pos.y, tower.previousRange, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(245, 179, 53, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();

      // Onda expansiva de energía dorada/verde creciendo hacia el nuevo rango
      const expandingR = tower.previousRange + (tower.range - tower.previousRange) * progress;
      ctx.beginPath();
      ctx.arc(tower.pos.x, tower.pos.y, expandingR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(134, 239, 172, ${1 - progress * 0.4})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = "#86efac";
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Etiqueta flotante "+X RANGO" sobre la torre
      ctx.font = "bold 12px 'Cinzel', 'Nunito', sans-serif";
      ctx.fillStyle = "#86efac";
      ctx.textAlign = "center";
      const diff = tower.range - tower.previousRange;
      ctx.fillText(`+${diff} RANGO`, tower.pos.x, tower.pos.y - tower.range - 10);
      ctx.restore();
    }
  }

  /**
   * Renderiza torres construidas.
   */
  /**
   * Renderiza torres construidas de los 5 dioses.
   */
  renderTowers(towers) {
    const ctx = this.ctx;

    for (const tower of towers) {
      const { x, y } = tower.pos;

      // Pedestal de mármol de la torre
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = tower.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Nivel de la torre (anillo exterior dorado según nivel)
      if (tower.level > 1) {
        ctx.strokeStyle = "#ffd166";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, (Math.PI * 2) * (tower.level / tower.maxLevel));
        ctx.stroke();
      }

      // Auras divinas según Forma (Forma 2 y Forma 3)
      if (tower.form === 2) {
        ctx.save();
        ctx.strokeStyle = "#c084fc";
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(x, y, 27, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (tower.form === 3) {
        ctx.save();
        const pulse = Math.sin(this.time * 5) * 2;
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, y, 28 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Aura temporal del buff de Cronos
      if (tower.attackSpeedMultiplier > 1.0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 27 + Math.sin(this.time * 8) * 2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(168, 85, 247, 0.85)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();
      }

      // Rayos Infernales de Hades (1 en F1 y F2, 3 rayos simultáneos en F3)
      if (tower.type === "HADES") {
        const beams = (tower.hadesBeams && tower.hadesBeams.length > 0)
          ? tower.hadesBeams
          : (tower.currentTarget && !tower.currentTarget.isDead ? [{ target: tower.currentTarget, channelTime: tower.beamChannelTime }] : []);

        for (const beam of beams) {
          if (!beam.target || beam.target.isDead || beam.target.reachedExit) continue;
          const targetPos = beam.target.pos;
          const rampRatio = Math.min(1, beam.channelTime / tower.rampTime);

          ctx.save();
          // Resplandor exterior violeta
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.4 + rampRatio * 0.5})`;
          ctx.lineWidth = 3.5 + rampRatio * 6;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(targetPos.x, targetPos.y);
          ctx.stroke();

          // Núcleo caliente blanco-rosado
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.2 + rampRatio * 2.8;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(targetPos.x, targetPos.y);
          ctx.stroke();

          // Foco de calor en el enemigo
          ctx.fillStyle = "#f43f5e";
          ctx.beginPath();
          ctx.arc(targetPos.x, targetPos.y, 3.5 + rampRatio * 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Torrecilla orientada según tower.angle
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tower.angle);

      if (tower.type === "HERCULES") {
        // ARTEMISA: Ballesta / Arco divino verde
        ctx.fillStyle = tower.color;
        ctx.fillRect(-6, -5, 18, 10);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(4, 0, 14, -Math.PI / 2.2, Math.PI / 2.2);
        ctx.stroke();
        ctx.strokeStyle = "#86efac";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(16, 0);
        ctx.stroke();
      } else if (tower.type === "ZEUS") {
        // ZEUS: Obelisco celestial con esfera de rayos
        ctx.fillStyle = "#1e3a8a";
        ctx.fillRect(-8, -8, 16, 16);
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#bae6fd";
        ctx.lineWidth = 2;
        ctx.stroke();
        // Rayo saliente
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(4, -2, 10, 4);
      } else if (tower.type === "ARES") {
        // ARES: Cañón mortero pesado
        ctx.fillStyle = "#7f1d1d";
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(-2, -6, 20, 12);
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.strokeRect(14, -7, 4, 14);
      } else if (tower.type === "HADES") {
        // HADES: Altar del inframundo con ojo flamígero
        ctx.fillStyle = "#3b0764";
        ctx.fillRect(-9, -9, 18, 18);
        ctx.fillStyle = "#c084fc";
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        // Cuernos infernales
        ctx.strokeStyle = "#9333ea";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 12, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
      } else if (tower.type === "POSEIDON") {
        // POSEIDÓN: Tridente marino
        ctx.fillStyle = "#0c4a6e";
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#06b6d4";
        ctx.fillRect(0, -3, 16, 6);
        // Puntas del tridente
        ctx.fillStyle = "#67e8f9";
        ctx.fillRect(14, -8, 4, 16);
      }

      ctx.restore();
    }
  }

  /**
   * Renderiza los proyectiles en vuelo.
   */
  renderProjectiles(projectiles) {
    const ctx = this.ctx;

    for (const proj of projectiles) {
      ctx.save();
      ctx.translate(proj.pos.x, proj.pos.y);
      ctx.rotate(proj.rotation);

      if (proj.type === "ARES") {
        // Bomba mortero de Ares
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(-2, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (proj.type === "POSEIDON") {
        // Esfera marina de Poseidón
        ctx.fillStyle = "rgba(6, 182, 212, 0.85)";
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#a5f3fc";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (proj.type === "SHRAPNEL") {
        // Esquirla ardiente afilada de Ares
        ctx.fillStyle = "#f97316";
        ctx.fillRect(-5, -1, 10, 2);
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(2, -2.5);
        ctx.lineTo(2, 2.5);
        ctx.closePath();
        ctx.fillStyle = "#fef08a";
        ctx.fill();
      } else {
        // Virote de Artemisa (Verde)
        ctx.fillStyle = "#86efac";
        ctx.fillRect(-8, -1.5, 16, 3);
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(4, -4);
        ctx.lineTo(4, 4);
        ctx.closePath();
        ctx.fillStyle = "#22c55e";
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Renderiza las bombas/minas terrestres sembradas en el camino por Ares.
   */
  renderRoadBombs(roadBombs) {
    if (!roadBombs || roadBombs.length === 0) return;
    for (const bomb of roadBombs) {
      bomb.render(this.ctx);
    }
  }

  /**
   * Renderiza enemigos con sus atributos visuales y barras de vida.
   */
  renderEnemies(enemies) {
    const ctx = this.ctx;

    for (const enemy of enemies) {
      if (enemy.isDead || enemy.reachedExit) continue;

      const { x, y } = enemy.pos;

      // Aura de Ralentización (Poseidón)
      if (enemy.slowTimer > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, enemy.radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(6, 182, 212, 0.8)";
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.restore();
      }

      // Si está enfurecido (Alóada frenético), dibuja aura roja
      if (enemy.isEnraged) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, enemy.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
        ctx.fill();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Cuerpo del enemigo
      ctx.beginPath();
      ctx.arc(x, y, enemy.radius, 0, Math.PI * 2);
      ctx.fillStyle = enemy.color;
      ctx.fill();
      ctx.strokeStyle = enemy.borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Detalle estilizado según el tipo
      if (enemy.type === "TANK") {
        // Ojo de cíclope
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (enemy.type === "GIANT") {
        // Corona/cuernos titánicos
        ctx.strokeStyle = "#ea580c";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, enemy.radius - 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Si está aturdido por Deméter, dibuja zarzas y estrellas
      if (enemy.stunTimer > 0) {
        ctx.save();
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y + enemy.radius - 2, enemy.radius * 0.7, 0, Math.PI);
        ctx.stroke();

        ctx.font = "14px serif";
        ctx.textAlign = "center";
        ctx.fillText("💫", x, y - enemy.radius - 14);
        ctx.restore();
      }

      // Si está marcado por la Fuerza de Hércules, dibuja marca de vulnerabilidad amarilla
      if (enemy.markTimer > 0) {
        ctx.save();
        ctx.font = "13px serif";
        ctx.textAlign = "center";
        ctx.fillText("🦁", x, y - enemy.radius - (enemy.stunTimer > 0 ? 26 : 14));
        ctx.beginPath();
        ctx.arc(x, y, enemy.radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(250, 204, 21, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 2]);
        ctx.stroke();
        ctx.restore();
      }

      // Barra de vida
      const barWidth = Math.max(26, enemy.radius * 2);
      const barHeight = 4;
      const barX = x - barWidth / 2;
      const barY = y - enemy.radius - 8;

      // Fondo de la barra
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Relleno de vida
      const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
      ctx.fillStyle = hpRatio > 0.5 ? "#22c55e" : hpRatio > 0.25 ? "#eab308" : "#ef4444";
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

      // Borde de la barra
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
  }

  /**
   * Dibuja un aura divina y flecha indicadora sobre una celda del tutorial.
   */
  renderTutorialHighlight(col, row, label = "", color = "#ffd166") {
    const ctx = this.ctx;
    const ts = this.tileSize;
    const x = col * ts;
    const y = row * ts;
    const cx = x + ts / 2;
    const cy = y + ts / 2;

    const pulse = Math.sin(this.time * 6) * 3;

    ctx.save();
    // Resplandor áureo sobre la celda
    ctx.fillStyle = "rgba(245, 179, 53, 0.28)";
    ctx.fillRect(x, y, ts, ts);

    // Marco de la celda
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x + 2, y + 2, ts - 4, ts - 4);

    // Anillo mítico pulsante
    ctx.beginPath();
    ctx.arc(cx, cy, (ts / 2 - 4) + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Flecha animada apuntando a la celda
    const arrowBounce = Math.sin(this.time * 8) * 5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#000";
    ctx.fillStyle = color;
    ctx.font = "20px 'Cinzel', serif";
    ctx.textAlign = "center";
    ctx.fillText("⬇️", cx, y - 6 + arrowBounce);

    if (label) {
      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, cx, y - 28 + arrowBounce);
    }
    ctx.restore();
  }

  /**
   * Renderiza las zonas de habilidades divinas activas en el campo de batalla (Deméter, Artemisa).
   */
  renderActivePowerZones(zones) {
    if (!zones || zones.length === 0) return;
    const ctx = this.ctx;

    for (const zone of zones) {
      const pulse = Math.sin(this.time * 5 + zone.id) * 4;
      ctx.save();

      if (zone.powerId === "DEMETER") {
        // Campo de Zarzas y Raíces de Deméter
        ctx.beginPath();
        ctx.arc(zone.pos.x, zone.pos.y, zone.radius + pulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(34, 197, 94, 0.22)";
        ctx.fill();
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Anillo rúnico
        ctx.beginPath();
        ctx.arc(zone.pos.x, zone.pos.y, zone.radius * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(134, 239, 172, 0.55)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();

        // Emblema central
        ctx.font = "24px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🌿", zone.pos.x, zone.pos.y);
      } else if (zone.powerId === "HERA") {
        // Cráter y llamaradas celestiales de Hera
        ctx.beginPath();
        ctx.arc(zone.pos.x, zone.pos.y, zone.radius + pulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(236, 72, 153, 0.25)";
        ctx.fill();
        ctx.strokeStyle = "#ec4899";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#f43f5e";
        ctx.shadowBlur = 10;
        ctx.stroke();

        ctx.font = "24px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🦚", zone.pos.x, zone.pos.y);
      } else if (zone.powerId === "ARTEMISA") {
        // Zona Heroica de Fuerza de Hércules (Amarillo)
        ctx.beginPath();
        ctx.arc(zone.pos.x, zone.pos.y, zone.radius + pulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(234, 179, 8, 0.25)";
        ctx.fill();
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#facc15";
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Círculo astronómico de poder
        ctx.beginPath();
        ctx.arc(zone.pos.x, zone.pos.y, zone.radius * 0.55, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(254, 240, 138, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        ctx.font = "24px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🦁", zone.pos.x, zone.pos.y);
      }

      ctx.restore();
    }
  }

  /**
   * Renderiza auras y efectos atmosféricos cuando una habilidad global (Cronos o Hermes) está activa.
   */
  renderGlobalPowerAuras(powerManager, towers = []) {
    if (!powerManager) return;
    const ctx = this.ctx;
    const width = this.canvas ? this.canvas.width : 1024;
    const height = this.canvas ? this.canvas.height : 640;

    try {
      // 1. Cronos: Distorsión temporal global (acelera todas las torres +50%)
      if (powerManager.isCronosActive()) {
        const remaining = Math.ceil(powerManager.cronosTimer);
        const pulse = Math.sin(this.time * 6) * 0.04;

        ctx.save();
        // Viñeta violeta en los bordes del lienzo
        const grad = ctx.createRadialGradient(
          width / 2, height / 2, width * 0.35,
          width / 2, height / 2, width * 0.72
        );
        grad.addColorStop(0, "rgba(168, 85, 247, 0)");
        grad.addColorStop(1, `rgba(168, 85, 247, ${Math.max(0, 0.22 + pulse)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Aura de aceleración en cada torre
        for (const tower of towers) {
          ctx.save();
          ctx.beginPath();
          const spinAngle = this.time * 4;
          ctx.arc(tower.pos.x, tower.pos.y, 22 + Math.sin(this.time * 8) * 2, spinAngle, spinAngle + Math.PI * 1.5);
          ctx.strokeStyle = "#c084fc";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#a855f7";
          ctx.shadowBlur = 8;
          ctx.stroke();

          ctx.font = "11px serif";
          ctx.textAlign = "center";
          ctx.fillText("⚡", tower.pos.x + 12, tower.pos.y - 12);
          ctx.restore();
        }

        // Banner indicador en la parte superior del canvas
        ctx.font = "bold 13px 'Cinzel', serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#e9d5ff";
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 8;
        ctx.fillText(`⏳ DISTORSIÓN DE CRONOS: +50% CADENCIA EN TODAS LAS TORRES (${remaining}s)`, width / 2, 8);
        ctx.restore();
      }

      // 2. Hermes: Viento de oro global (+50% de Dracmas por cada enemigo derrotado)
      if (powerManager.isHermesActive()) {
        const remaining = Math.ceil(powerManager.hermesTimer);
        const pulse = Math.sin(this.time * 7) * 0.05;

        ctx.save();
        // Viñeta dorada en los bordes del lienzo
        const grad = ctx.createRadialGradient(
          width / 2, height / 2, width * 0.35,
          width / 2, height / 2, width * 0.72
        );
        grad.addColorStop(0, "rgba(250, 204, 21, 0)");
        grad.addColorStop(1, `rgba(250, 204, 21, ${Math.max(0, 0.24 + pulse)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Banner indicador en la parte superior del canvas
        ctx.font = "bold 13px 'Cinzel', serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#fef08a";
        ctx.shadowColor = "#eab308";
        ctx.shadowBlur = 8;
        ctx.fillText(`🪽 VIENTO DE HERMES: +50% DRACMAS DE ORO POR CADA ENEMIGO (${remaining}s)`, width / 2, 8);
        ctx.restore();
      }
    } catch (e) {
      console.warn("Error rendering global power auras:", e);
    }
  }

  /**
   * Renderiza la retícula de apuntado cuando el jugador va a lanzar una habilidad de zona.
   */
  renderPowerTargeting(mousePos, powerConfig) {
    if (!mousePos || !powerConfig) return;
    const ctx = this.ctx;
    const radius = powerConfig.radius || 100;
    const pulse = Math.sin(this.time * 8) * 3;
    const color = powerConfig.themeColor || "#ffd166";

    ctx.save();
    // 1. Área de efecto translúcida con el color característico del dios
    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, radius + pulse, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.22;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 2. Borde exterior brillante con pulso y resplandor
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.0;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Anillo concéntrico discontinuo decorativo
    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, radius * 0.65, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Cruz de mira central
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(mousePos.x - radius, mousePos.y);
    ctx.lineTo(mousePos.x + radius, mousePos.y);
    ctx.moveTo(mousePos.x, mousePos.y - radius);
    ctx.lineTo(mousePos.x, mousePos.y + radius);
    ctx.stroke();

    // 5. Icono divino central
    ctx.font = "26px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(powerConfig.icon, mousePos.x, mousePos.y);

    // 6. Placa superior con nombre del poder y radio en píxeles
    ctx.font = "bold 13px 'Cinzel', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 6;
    ctx.fillText(`${powerConfig.name} (Radio: ${radius}px)`, mousePos.x, mousePos.y - radius - 8);

    // 7. Instrucciones tácticas para el jugador
    ctx.font = "bold 12px 'Cinzel', sans-serif";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fde047";
    ctx.fillText(`✨ [CLIC] Invocar aquí · [Clic Der / ESC] Cancelar`, mousePos.x, mousePos.y + radius + 10);

    ctx.restore();
  }
}
