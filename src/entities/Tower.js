/**
 * Tower.js - Implementación de las 5 Torres Divinas y sistema de evolución de Formas (1, 2 y 3).
 * La evolución a Forma 2 y 3 está permitida a cualquier nivel, y cada nivel previo descuenta su coste.
 */

import { Vector2 } from '../core/Vector2.js';
import { Projectile } from './Projectile.js';
import { RoadBomb } from './RoadBomb.js';
import { BALANCE, getTowerDamage } from '../config/balance.js';
import { TOWERS } from '../config/towersData.js';

let towerIdCounter = 1;

export const FORM_NAMES = {
  HERCULES: ["Ballesta de Artemisa", "Ballesta Lunar", "Arco Divino de Artemisa"],
  ARTEMISA: ["Ballesta de Artemisa", "Ballesta Lunar", "Arco Divino de Artemisa"],
  ZEUS: ["Rayo Celeste", "Rayo en Cadena (6 obj.)", "Tormenta Cataclísmica (9 obj.)"],
  ARES: ["Mortero de Guerra", "Mortero de Esquirlas", "Fuego Griego del Tártaro"],
  HADES: ["Rayo del Tártaro", "Ojo del Inframundo (Obj. Vital)", "Cosechador de Almas (3 Rayos)"],
  POSEIDON: ["Marea Menor", "Maremoto Expansivo", "Tsunami del Olimpo"]
};

export class Tower {
  constructor(config, gridCol, gridRow, pixelCenter) {
    this.id = towerIdCounter++;
    this.type = config.type;
    this.name = config.name;
    this.role = config.role;
    this.col = gridCol;
    this.row = gridRow;
    this.pos = pixelCenter.clone();

    // Sistema de Formas (1 a 3) y Niveles (1 a 10)
    this.form = 1;
    this.level = 1;
    this.maxLevel = 10;

    this.baseCost = config.cost;
    this.totalInvested = config.cost;

    this.damage = getTowerDamage(this.type, this.form, this.level);
    this.baseRange = config.range || 120;
    this.range = this.baseRange;
    this.fireRate = config.fireRate || 1.0;
    this.projectileSpeed = config.projectileSpeed || 400;
    this.color = config.color;

    // Atributos de Zeus: En Forma 1 NO hay daño concatenado (1 objetivo). Desbloquea en F2 (6 obj.) y F3 (9 obj.)
    this.chainCount = this.type === "ZEUS" ? (this.form === 1 ? 1 : (this.form === 2 ? 6 : 9)) : (config.chainCount || 1);
    this.chainRange = config.chainRange || this.baseRange;
    this.zeusAttackCount = 0;

    // Resaltado temporal del aumento de rango al mejorar (0.5s)
    this.rangeGrowthTimer = 0;
    this.previousRange = this.range;

    // Atributos de Ares (Ramas de Forma 2: Esquirlas o Bombas en el camino)
    this.aresBranch = null; // 'SHRAPNEL' o 'MINES'
    this.maxRoadBombs = 0;
    this.minePlacementTimer = 0;
    this.shrapnelCount = 0;

    // Atributos de Ares y Poseidón
    this.splashRadius = config.splashRadius || 0;
    this.slowFactor = config.slowFactor || 1.0;
    this.slowDuration = config.slowDuration || 0;
    this.attackSpeedMultiplier = 1.0; // Buff temporal de Cronos

    // Atributos de Hades (Torre Infernal con soporte de hasta 3 rayos simultáneos en Forma 3)
    this.baseDamage = config.baseDamage || 15;
    this.maxDamage = this.type === "HADES"
      ? getTowerDamage("HADES", this.form, this.level)
      : (config.maxDamage || 95);
    if (this.type === "HADES") {
      this.damage = this.maxDamage;
    }
    this.rampTime = config.rampTime || 3.0;
    this.beamChannelTime = 0;
    this.hadesBeams = []; // Array de { target, channelTime } para rayos simultáneos

    // Estado interno
    this.cooldownTimer = 0;
    this.currentTarget = null;
    this.angle = 0;
  }

  getFormName() {
    if (this.type === "ARES") {
      if (this.form === 1) return "Mortero de Guerra";
      if (this.form === 2) {
        return this.aresBranch === "MINES" ? "Minas de Flegra" : "Mortero de Esquirlas";
      }
      if (this.form === 3) {
        return this.aresBranch === "MINES" ? "Campo Minado del Tártaro" : "Cataclismo de Esquirlas";
      }
    }
    if (this.type === "HADES") {
      if (this.form === 1) return "Rayo del Tártaro";
      if (this.form === 2) return "Ojo del Inframundo (Obj. Vital)";
      if (this.form === 3) return "Cosechador de Almas (3 Rayos)";
    }
    const list = FORM_NAMES[this.type] || ["Forma 1", "Forma 2", "Forma 3"];
    return list[this.form - 1] || `Forma ${this.form}`;
  }

  getBaseForm2Cost() {
    switch (this.type) {
      case "HERCULES":
      case "ARTEMISA":
        return 4200; // 2200 + 2000
      case "POSEIDON":
        return 4640; // 2640 + 2000
      case "ZEUS":
        return 5100; // 3300 + 1800
      case "ARES":
        return 5020; // 3520 + 1500
      case "HADES":
        return 5460; // 3960 + 1500
      default:
        return 4500;
    }
  }

  getBaseForm3Cost() {
    switch (this.type) {
      case "HERCULES":
      case "ARTEMISA":
        return 41400; // 23,000 * 1.8 (+80%)
      case "POSEIDON":
        return 54000; // 30,000 * 1.8 (+80%)
      case "HADES":
        return 48600; // 27,000 * 1.8 (+80%)
      case "ZEUS":
        return 50400; // 28,000 * 1.8 (+80%)
      case "ARES":
        return this.aresBranch === "MINES" ? 45900 : 47700; // (25,500 / 26,500 * 1.8) (+80%)
      default:
        return 45000; // 25,000 * 1.8 (+80%)
    }
  }

  getUpgradeCost() {
    if (this.form === 2) {
      // Escalado dentro de Forma 2 (según fórmula de la imagen):
      // Semilla del primer incremento (Nivel 2) = 10% del coste de entrada de la Forma 2. Multiplicador 1.4: Coste = semilla * 1.4^(L - 2)
      const baseForm2 = this.getBaseForm2Cost();
      const seed = Math.round(baseForm2 * 0.10);
      return Math.round(seed * Math.pow(1.4, this.level - 1));
    } else if (this.form === 3) {
      // Escalado dentro de Forma 3 (semilla = 10% del coste de entrada de Forma 3 con multiplicador 1.4):
      const baseForm3 = this.getBaseForm3Cost();
      const seed = Math.round(baseForm3 * 0.10);
      return Math.round(seed * Math.pow(1.4, this.level - 1));
    }
    // Forma 1
    return Math.round(this.baseCost * Math.pow(BALANCE.UPGRADE_COST_MULTIPLIER, this.level - 1) * 0.7);
  }

  getSellRefund() {
    return Math.round(this.totalInvested * BALANCE.SELL_REFUND_RATIO);
  }

  /**
   * Cálculo del costo de evolución de Forma con DESCUENTO acumulativo por nivel actual:
   * Cada nivel que sube le resta al costo total de la forma 2 (y forma 3).
   */
  getEvolveCost() {
    if (this.form >= 3) return 0;

    const discount = this.getEvolveDiscount();

    if (this.form === 1) {
      const baseForm2 = this.getBaseForm2Cost();
      return Math.max(25, baseForm2 - discount);
    } else if (this.form === 2) {
      const baseForm3 = this.getBaseForm3Cost();
      return Math.max(35, baseForm3 - discount);
    }
    return 0;
  }

  getEvolveDiscount() {
    const discountPerLevel = this.form === 1
      ? Math.round(this.baseCost * 0.18)
      : Math.round(this.getBaseForm2Cost() * 0.05);
    return (this.level - 1) * discountPerLevel;
  }

  upgrade() {
    if (this.level >= this.maxLevel) return false;

    const cost = this.getUpgradeCost();
    this.totalInvested += cost;
    this.level++;

    // Guardar rango anterior e iniciar timer de 0.5s para resaltar el aumento de rango
    this.previousRange = this.range;
    this.damage = getTowerDamage(this.type, this.form, this.level);
    if (this.type === "HADES") {
      this.maxDamage = getTowerDamage("HADES", this.form, this.level);
      this.damage = this.maxDamage;
    }
    this.range = Math.round(this.range * 1.0175); // Reducido a la mitad: +1.75% de incremento por nivel
    if (this.type === "ZEUS") {
      this.chainRange = Math.round(this.chainRange * 1.0175);
    }
    this.rangeGrowthTimer = 0.5;
    return true;
  }

  getDamage(form = this.form, level = this.level) {
    return getTowerDamage(this.type, form, level);
  }

  getNextLevelDamage() {
    if (this.level >= this.maxLevel) return this.damage;
    return getTowerDamage(this.type, this.form, this.level + 1);
  }

  getNextFormDamage() {
    if (this.form >= 3) return this.damage;
    return getTowerDamage(this.type, this.form + 1, 1);
  }

  /**
   * Evoluciona la torre a su siguiente Forma divina (disponible a cualquier nivel).
   * Para Ares Forma 2, admite la elección de rama: 'SHRAPNEL' o 'MINES'.
   */
  evolveForm(branchChoice = null) {
    if (this.form >= 3) return false;

    const cost = this.getEvolveCost();
    this.totalInvested += cost;
    this.form++;
    this.level = 1; // Reinicia el nivel a 1 al evolucionar para progresar de Nivel 1 a 10 en la nueva Forma

    // Guardar rango anterior e iniciar timer de 0.5s para resaltar el cambio de rango
    this.previousRange = this.range;
    this.damage = getTowerDamage(this.type, this.form, 1);
    if (this.type === "HADES") {
      this.maxDamage = getTowerDamage("HADES", this.form, 1);
      this.damage = this.maxDamage;
    }

    // Ajustes de alcance por dios y forma según especificación técnica:
    if (this.type === "ZEUS") {
      // Zeus Forma 2 y Forma 3: vuelve al rango de ataque base
      this.range = this.baseRange;
      this.chainRange = this.baseRange;
    } else if (this.type === "ARES") {
      if (this.form === 2) {
        this.range = this.baseRange; // Forma 2 reinicia a rango base
      } else if (this.form === 3) {
        if (this.aresBranch === "MINES") {
          // Ares Forma 3 Bombas: mantener rango acumulado
        } else {
          // Ares Forma 3 Esquirlas: volver al rango base
          this.range = this.baseRange;
        }
      }
    } else if (this.type === "POSEIDON") {
      // Poseidón Forma 2 y Forma 3: vuelve al rango base
      this.range = this.baseRange;
    } else if (this.type === "HERCULES") {
      // Hércules Forma 2 y Forma 3: vuelve al rango base
      this.range = this.baseRange;
    } else {
      // HADES u otras: vuelve al rango base si aplica
      this.range = this.baseRange;
    }
    this.rangeGrowthTimer = 0.5;

    // Ajustes por dios según el GDD y peticiones de balance
    if (this.type === "HERCULES") {
      if (this.form === 2) {
        this.fireRate = 1.9; // Aumento sustancial de cadencia en Forma 2 (de 1.1 a 1.9 disp/s)
      } else if (this.form === 3) {
        this.fireRate = 2.8; // Aumento adicional de cadencia en Forma 3 (2.8 disp/s)
      }
    } else if (this.type === "ZEUS") {
      if (this.form === 2) {
        this.chainCount = 6; // Forma 2: 6 objetivos
        this.chainRange = this.baseRange;
      } else if (this.form === 3) {
        this.chainCount = 9; // Forma 3: 9 objetivos
        this.chainRange = this.baseRange;
        this.zeusAttackCount = 0; // Reinicia contador para que el ataque inicial de Forma 3 aplique stun
      }
    } else if (this.type === "ARES") {
      if (this.form === 2) {
        if (branchChoice) {
          this.aresBranch = branchChoice; // 'SHRAPNEL' o 'MINES'
        } else if (!this.aresBranch) {
          this.aresBranch = "SHRAPNEL";
        }

        if (this.aresBranch === "MINES") {
          this.splashRadius = 75;
          this.maxRoadBombs = 6;
          this.cooldownTimer = 0.2; // Lista para sembrar de inmediato
        } else {
          this.splashRadius = 80;
          this.shrapnelCount = 6;
        }
      } else if (this.form === 3) {
        if (this.aresBranch === "MINES") {
          this.splashRadius = 90;
          this.maxRoadBombs = 7;
        } else {
          this.splashRadius = 95;
          this.shrapnelCount = 10;
        }
      }
    } else if (this.type === "HADES") {
      if (this.form === 2) {
        this.rampTime = 2.5; // Rampa más rápida y desbloqueo de objetivo de mayor vida
      } else if (this.form === 3) {
        this.rampTime = 1.3;
      }
    } else if (this.type === "POSEIDON") {
      if (this.form === 2) {
        this.splashRadius = 30;
        this.slowFactor = 0.5; // 50% de ralentización
        this.slowDuration = 1.5;
      } else if (this.form === 3) {
        this.splashRadius = 50;
        this.slowFactor = 0.5; // 50% de ralentización
        this.slowDuration = 2.0;
      }
    }

    return true;
  }

  serialize() {
    return {
      type: this.type,
      col: this.col,
      row: this.row,
      form: this.form,
      level: this.level,
      totalInvested: this.totalInvested,
      aresBranch: this.aresBranch || null,
      range: this.range,
      chainRange: this.chainRange || null
    };
  }

  static deserialize(data, grid, towersConfig = TOWERS) {
    if (!data || !data.type) return null;
    const config = towersConfig[data.type];
    if (!config) return null;

    if (typeof data.col !== 'number' || typeof data.row !== 'number') return null;
    if (data.col < 0 || data.col >= grid.cols || data.row < 0 || data.row >= grid.rows) return null;

    const pixelCenter = grid.gridToPixelCenter(data.col, data.row);
    const tower = new Tower(config, data.col, data.row, pixelCenter);

    tower.form = data.form || 1;
    tower.level = data.level || 1;
    tower.totalInvested = (data.totalInvested !== undefined) ? data.totalInvested : config.cost;
    tower.aresBranch = data.aresBranch || null;

    // Ajustes por dios y forma según evoluciones
    tower.range = tower.baseRange;
    if (tower.type === "HERCULES" || tower.type === "ARTEMISA") {
      if (tower.form === 2) tower.fireRate = 1.9;
      else if (tower.form === 3) tower.fireRate = 2.8;
    } else if (tower.type === "ZEUS") {
      tower.chainRange = tower.baseRange;
      if (tower.form === 1) tower.chainCount = 1;
      else if (tower.form === 2) tower.chainCount = 6;
      else if (tower.form === 3) tower.chainCount = 9;
    } else if (tower.type === "ARES") {
      if (tower.form === 2) {
        if (tower.aresBranch === "MINES") {
          tower.splashRadius = 75;
          tower.maxRoadBombs = 6;
        } else {
          tower.aresBranch = "SHRAPNEL";
          tower.splashRadius = 80;
          tower.shrapnelCount = 6;
        }
      } else if (tower.form === 3) {
        if (tower.aresBranch === "MINES") {
          tower.splashRadius = 90;
          tower.maxRoadBombs = 7;
        } else {
          tower.aresBranch = "SHRAPNEL";
          tower.splashRadius = 95;
          tower.shrapnelCount = 10;
        }
      }
    } else if (tower.type === "HADES") {
      if (tower.form === 2) tower.rampTime = 2.5;
      else if (tower.form === 3) tower.rampTime = 1.3;
    } else if (tower.type === "POSEIDON") {
      if (tower.form === 2) {
        tower.splashRadius = 30;
        tower.slowFactor = 0.5;
        tower.slowDuration = 1.5;
      } else if (tower.form === 3) {
        tower.splashRadius = 50;
        tower.slowFactor = 0.5;
        tower.slowDuration = 2.0;
      }
    }

    // Escalar por nivel (rango y rango de concatenación de Zeus)
    for (let l = 1; l < tower.level; l++) {
      tower.range = Math.round(tower.range * 1.0175);
      if (tower.type === "ZEUS") {
        tower.chainRange = Math.round(tower.chainRange * 1.0175);
      }
    }

    // Si los datos serializados traían el rango exacto, preservarlo con precisión absoluta
    if (typeof data.range === 'number' && data.range > 0) {
      tower.range = data.range;
    }
    if (typeof data.chainRange === 'number' && data.chainRange > 0) {
      tower.chainRange = data.chainRange;
    }
    tower.previousRange = tower.range;

    // Calcular daño puro determinista
    tower.damage = getTowerDamage(tower.type, tower.form, tower.level);
    if (tower.type === "HADES") {
      tower.maxDamage = getTowerDamage("HADES", tower.form, tower.level);
      tower.damage = tower.maxDamage;
    }

    return tower;
  }

  findTarget(enemies) {
    let bestTarget = null;

    if (this.type === "HADES") {
      if (this.form === 1) {
        // En Forma 1 Hades NO tiene objetivo preferido: ataca al más adelantado en el camino
        let maxDistanceTravelled = -1;
        for (const enemy of enemies) {
          if (enemy.isDead || enemy.reachedExit || enemy.isImmune) continue;
          const dist = this.pos.distance(enemy.pos);
          const effectiveReach = this.range + (enemy.radius || 0);
          if (dist <= effectiveReach && enemy.distanceTravelled > maxDistanceTravelled) {
            maxDistanceTravelled = enemy.distanceTravelled;
            bestTarget = enemy;
          }
        }
      } else {
        // En Forma 2 y 3: objetivo preferido desbloqueado (prioriza al de mayor vida)
        let maxHp = -1;
        for (const enemy of enemies) {
          if (enemy.isDead || enemy.reachedExit || enemy.isImmune) continue;
          const dist = this.pos.distance(enemy.pos);
          const effectiveReach = this.range + (enemy.radius || 0);
          if (dist <= effectiveReach && enemy.hp > maxHp) {
            maxHp = enemy.hp;
            bestTarget = enemy;
          }
        }
      }
    } else {
      let maxDistanceTravelled = -1;
      for (const enemy of enemies) {
        if (enemy.isDead || enemy.reachedExit || enemy.isImmune) continue;
        const dist = this.pos.distance(enemy.pos);
        const effectiveReach = this.range + (enemy.radius || 0);
        if (dist <= effectiveReach) {
          if (enemy.distanceTravelled > maxDistanceTravelled) {
            maxDistanceTravelled = enemy.distanceTravelled;
            bestTarget = enemy;
          }
        }
      }
    }

    return bestTarget;
  }

  update(dt, enemies, projectilesList, particleSystem, grid = null, roadBombsList = null) {
    if (this.rangeGrowthTimer > 0) {
      this.rangeGrowthTimer -= dt;
      if (this.rangeGrowthTimer < 0) this.rangeGrowthTimer = 0;
    }

    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= dt * (this.attackSpeedMultiplier || 1.0);
    }

    // ARES - Rama de Bombas en el camino (Forma 2 y 3):
    // El ataque principal se convierte íntegramente en sembrar minas en el camino.
    // No dispara morteros aéreos directos a los enemigos; su labor es crear y reponer el campo minado.
    if (this.type === "ARES" && this.aresBranch === "MINES") {
      this.currentTarget = null;
      if (grid && roadBombsList) {
        const myBombs = roadBombsList.filter(b => b.ownerTower === this);
        if (myBombs.length < this.maxRoadBombs && this.cooldownTimer <= 0) {
          const candidateTiles = [];
          const ts = BALANCE.TILE_SIZE;
          const reachPadding = ts * 0.45;
          const minCol = Math.max(0, Math.floor((this.pos.x - (this.range + reachPadding)) / ts));
          const maxCol = Math.min(grid.cols - 1, Math.floor((this.pos.x + (this.range + reachPadding)) / ts));
          const minRow = Math.max(0, Math.floor((this.pos.y - (this.range + reachPadding)) / ts));
          const maxRow = Math.min(grid.rows - 1, Math.floor((this.pos.y + (this.range + reachPadding)) / ts));

          for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
              if (grid.matrix[r][c] === 1) { // Camino de piedra
                const center = grid.gridToPixelCenter(c, r);
                if (this.pos.distance(center) <= this.range + reachPadding) {
                  const hasNearBomb = roadBombsList.some(b => b.pos.distance(center) < 26);
                  if (!hasNearBomb) {
                    candidateTiles.push(center);
                  }
                }
              }
            }
          }

          if (candidateTiles.length > 0) {
            const chosenPos = candidateTiles[Math.floor(Math.random() * candidateTiles.length)];
            const dir = chosenPos.clone().sub(this.pos);
            this.angle = dir.angle();

            const bombDmg = Math.round(this.damage * (this.form === 3 ? 1.25 : 1.0));
            const blastRadius = this.form === 3 ? 80 : 60;
            roadBombsList.push(new RoadBomb(chosenPos, bombDmg, blastRadius, this, this.form));
            if (particleSystem) {
              particleSystem.addHitSparks(chosenPos, "#f97316", 7);
              particleSystem.addHitSparks(this.pos, "#ef4444", 4);
            }
            this.cooldownTimer = 1 / (this.fireRate * (this.attackSpeedMultiplier || 1.0));
          }
        }
      }
      return;
    }

    if (this.type === "HADES") {
      // HADES: Rayos Infernales continuos (1 rayo en Forma 1 y 2, 3 rayos simultáneos en Forma 3)
      const maxBeams = this.form === 3 ? 3 : 1;

      // 1. Limpiar rayos inválidos (enemigo muerto, inmune o fuera de rango)
      for (let i = this.hadesBeams.length - 1; i >= 0; i--) {
        const b = this.hadesBeams[i];
        const beamReach = this.range + (b.target ? (b.target.radius || 0) : 0);
        if (
          !b.target ||
          b.target.isDead ||
          b.target.reachedExit ||
          b.target.isImmune ||
          this.pos.distance(b.target.pos) > beamReach
        ) {
          this.hadesBeams.splice(i, 1);
        }
      }

      // 2. Asignar nuevos objetivos hasta alcanzar maxBeams
      if (this.hadesBeams.length < maxBeams) {
        const currentlyTargeted = this.hadesBeams.map(b => b.target);
        const candidates = enemies.filter(e =>
          !e.isDead && !e.reachedExit && !e.isImmune &&
          this.pos.distance(e.pos) <= (this.range + (e.radius || 0)) &&
          !currentlyTargeted.includes(e)
        );

        if (this.form === 1) {
          // Forma 1: sin objetivo preferido -> ordena por mayor avance en el camino
          candidates.sort((a, b) => b.distanceTravelled - a.distanceTravelled);
        } else {
          // Forma 2 y 3: objetivo preferido -> ordena por mayor vida
          candidates.sort((a, b) => b.hp - a.hp);
        }

        const needed = maxBeams - this.hadesBeams.length;
        for (let i = 0; i < Math.min(needed, candidates.length); i++) {
          this.hadesBeams.push({
            target: candidates[i],
            channelTime: 0
          });
        }
      }

      if (this.hadesBeams.length === 0) {
        this.currentTarget = null;
        return;
      }

      this.currentTarget = this.hadesBeams[0].target;
      const dir = this.currentTarget.pos.clone().sub(this.pos);
      this.angle = dir.angle();

      // 3. Aplicar daño por segundo progresivo a cada rayo activo simultáneamente
      for (const b of this.hadesBeams) {
        b.channelTime += dt;
        const rampRatio = Math.min(1, b.channelTime / this.rampTime);
        const currentDps = this.baseDamage + (this.maxDamage - this.baseDamage) * rampRatio;
        const frameDamage = currentDps * dt * (this.attackSpeedMultiplier || 1.0);
        const killed = b.target.takeDamage(frameDamage);

        if (particleSystem && Math.random() < 0.35) {
          particleSystem.addHitSparks(b.target.pos, "#c084fc", 2);
        }

        if (killed && this.form === 3 && particleSystem) {
          particleSystem.addExplosion(b.target.pos, 50);
          for (const enemy of enemies) {
            if (!enemy.isDead && !enemy.reachedExit && !enemy.isImmune) {
              if (b.target.pos.distance(enemy.pos) <= 60) {
                enemy.takeDamage(Math.round(this.maxDamage * 0.4));
              }
            }
          }
        }
      }
      return;
    }

    // Para las demás torres (Hércules, Zeus, Ares, Poseidón):
    const currentReach = this.currentTarget ? (this.range + (this.currentTarget.radius || 0)) : this.range;
    if (
      !this.currentTarget ||
      this.currentTarget.isDead ||
      this.currentTarget.reachedExit ||
      this.currentTarget.isImmune ||
      this.pos.distance(this.currentTarget.pos) > currentReach
    ) {
      this.currentTarget = this.findTarget(enemies);
    } else {
      const betterTarget = this.findTarget(enemies);
      if (betterTarget) {
        this.currentTarget = betterTarget;
      }
    }

    if (!this.currentTarget) return;

    const dir = this.currentTarget.pos.clone().sub(this.pos);
    this.angle = dir.angle();

    if (this.cooldownTimer <= 0) {
      this.shoot(enemies, projectilesList, particleSystem);
      this.cooldownTimer = 1 / this.fireRate;
    }
  }

  shoot(enemies, projectilesList, particleSystem) {
    if (!this.currentTarget) return;

    if (this.type === "ZEUS") {
      this.executeChainLightning(enemies, particleSystem);
    } else if (this.type === "ARES") {
      projectilesList.push(new Projectile(
        this.pos,
        this.currentTarget,
        this.damage,
        this.projectileSpeed,
        "ARES",
        {
          splashRadius: this.splashRadius,
          isShrapnel: this.aresBranch === "SHRAPNEL",
          shrapnelCount: this.shrapnelCount || 6
        }
      ));
    } else if (this.type === "POSEIDON") {
      // Forma 3 de Poseidón añade stun la primera vez por monstruo
      const stunDur = this.form === 3 ? 0.8 : 0;
      projectilesList.push(new Projectile(
        this.pos,
        this.currentTarget,
        this.damage,
        this.projectileSpeed,
        "POSEIDON",
        {
          splashRadius: this.splashRadius,
          slowFactor: this.slowFactor,
          slowDuration: this.slowDuration,
          stunDuration: stunDur
        }
      ));
    } else {
      // HÉRCULES:
      // Forma 1: 1 flecha
      // Forma 2: 2 flechas dobles
      // Forma 3: 3 flechas triples (Arco de Heracles)
      if (this.form === 1) {
        projectilesList.push(new Projectile(
          this.pos,
          this.currentTarget,
          this.damage,
          this.projectileSpeed,
          "HERCULES"
        ));
      } else if (this.form === 2) {
        projectilesList.push(new Projectile(
          this.pos,
          this.currentTarget,
          Math.round(this.damage * 0.7),
          this.projectileSpeed,
          "HERCULES",
          { offsetAngle: -0.1 }
        ));
        projectilesList.push(new Projectile(
          this.pos,
          this.currentTarget,
          Math.round(this.damage * 0.7),
          this.projectileSpeed,
          "HERCULES",
          { offsetAngle: 0.1 }
        ));
      } else {
        projectilesList.push(new Projectile(
          this.pos,
          this.currentTarget,
          Math.round(this.damage * 0.6),
          this.projectileSpeed,
          "HERCULES",
          { offsetAngle: -0.18 }
        ));
        projectilesList.push(new Projectile(
          this.pos,
          this.currentTarget,
          Math.round(this.damage * 0.6),
          this.projectileSpeed,
          "HERCULES",
          { offsetAngle: 0 }
        ));
        projectilesList.push(new Projectile(
          this.pos,
          this.currentTarget,
          Math.round(this.damage * 0.6),
          this.projectileSpeed,
          "HERCULES",
          { offsetAngle: 0.18 }
        ));
      }
    }
  }

  executeChainLightning(enemies, particleSystem) {
    this.zeusAttackCount = (this.zeusAttackCount || 0) + 1;
    // En Forma 3: el ataque inicial aplica stun y luego aplica stun cada 4 ataques (1, 5, 9, 13...)
    const shouldStun = this.form === 3 && (this.zeusAttackCount % 4 === 1);

    const chainPoints = [this.pos.clone()];
    const hitEnemies = [this.currentTarget];
    this.currentTarget.takeDamage(this.damage);
    chainPoints.push(this.currentTarget.pos.clone());

    if (shouldStun) {
      this.currentTarget.stunTimer = 0.6; // Stun cada 4 ataques en Forma 3 de Zeus
    }

    // Forma 1 de Zeus NO tiene daño concatenado: impacta únicamente al objetivo principal con rayo directo.
    // La concatenación se desbloquea en Forma 2 (hasta 6 objetivos) y Forma 3 (hasta 9 objetivos con stun cada 4 ataques).
    if (this.form >= 2 && this.chainCount > 1) {
      let current = this.currentTarget;

      for (let jump = 1; jump < this.chainCount; jump++) {
        let nextTarget = null;
        let minDistance = this.chainRange;

        for (const enemy of enemies) {
          if (enemy.isDead || enemy.reachedExit || enemy.isImmune || hitEnemies.includes(enemy)) continue;

          const d = current.pos.distance(enemy.pos);
          if (d < minDistance) {
            minDistance = d;
            nextTarget = enemy;
          }
        }

        if (nextTarget) {
          hitEnemies.push(nextTarget);
          nextTarget.takeDamage(Math.round(this.damage * 0.75));
          if (shouldStun) {
            nextTarget.stunTimer = 0.6;
          }
          chainPoints.push(nextTarget.pos.clone());
          current = nextTarget;
        } else {
          break;
        }
      }
    }

    if (particleSystem) {
      const lightningColor = shouldStun ? "#fef08a" : (this.form === 3 ? "#93c5fd" : "#38bdf8");
      particleSystem.addLightningChain(chainPoints, lightningColor);
      for (const hit of hitEnemies) {
        particleSystem.addHitSparks(hit.pos, shouldStun ? "#fef08a" : "#38bdf8", shouldStun ? 8 : 4);
      }
    }
  }
}
