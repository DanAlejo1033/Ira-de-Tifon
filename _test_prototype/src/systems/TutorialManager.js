/**
 * TutorialManager.js - Gestor del Tutorial interactivo y guiado por Atenea.
 * Sigue el flujo exacto solicitado con bloqueo estricto de elementos inactivos:
 *  1. Resalta las torres en el HUD inferior mientras explica su uso (bloquea iniciar oleada, pausa, etc.).
 *  2. Resalta el oro de Dracmas en el HUD superior para compras y mejoras.
 *  3. Hace colocar Torre 1 (Hércules) en la posición (4,6) (solo permite Hércules y solo en esa celda).
 *  4. Hace colocar Torre 2 (Hércules) en la posición (4,7).
 *  5. Hace colocar Torre 3 (Zeus) en la posición (5,6) (solo permite Zeus y solo en esa celda).
 *  6. Indica iniciar la oleada 1 con el botón (se habilita iniciar oleada).
 *  7. Cuando 1 monstruo sobrevive y cruza las puertas del Olimpo restando vida (🏛️), Atenea explica la pérdida de vidas.
 *  8. Tras concluir la oleada, indica hacer clic en Hércules y mejorarlo dos veces (Nivel 3) sin opacar ni bloquear la ventana.
 *  9. Indica iniciar la oleada 2 y explica el regalo de oro por adelantar oleadas.
 * 10. Clímax: Indica hacer clic en Zeus, regala el costo de la Forma 2, explica el Rayo en Cadena e invita a buscar la Forma 3.
 *     Fin del tutorial y se desbloquean todos los controles para la partida normal.
 */

export class TutorialManager {
  constructor(ui, progress) {
    this.ui = ui;
    this.progress = progress;
    this.game = null;

    this.isActive = false;
    this.currentStep = 0; // 0 a 8

    // Banderas de control de narrativa y lecciones
    this.hasExplainedLifeLoss = false;
    this.waitingForStep6AfterLifeExplaining = false;
    this.hasExplainedSpeed = false;

    // Coordenadas objetivo en la cuadrícula (desde la esquina inferior izquierda del canvas)
    // Torre 1 (Hércules): celda (col: 3, row: 4) -> (4,6)
    this.hercules1TargetCell = { col: 3, row: 4 };

    // Torre 2 (Hércules): celda (col: 3, row: 3) -> (4,7)
    this.hercules2TargetCell = { col: 3, row: 3 };

    // Torre 3 (Zeus): celda (col: 5, row: 3) -> (5,6)
    this.zeusTargetCell = { col: 5, row: 3 };

    // Referencias a torres construidas en el tutorial
    this.tutorialHercules1Tower = null;
    this.tutorialHercules2Tower = null;
    this.tutorialZeusTower = null;

    // Control de renderizado del marcador en el canvas
    this.highlightCanvasCell = null; // { col, row, label, color }
  }

  start(game) {
    this.game = game;
    this.isActive = true;
    this.currentStep = 0;
    this.hasExplainedLifeLoss = false;
    this.waitingForStep6AfterLifeExplaining = false;
    this.hasExplainedSpeed = false;
    this.tutorialHercules1Tower = null;
    this.tutorialHercules2Tower = null;
    this.tutorialZeusTower = null;
    this.highlightCanvasCell = null;

    if (this.game && this.game.waveManager) {
      this.game.waveManager.isTutorialMode = true;
    }

    this.applyStep(0);
  }

  applyStep(stepIndex) {
    if (!this.isActive) return;
    this.currentStep = stepIndex;

    switch (stepIndex) {
      case 0: // Explicar torres olímpicas (HUD inferior con backdrop)
        this.highlightCanvasCell = null;
        this.ui.setTutorialLocks({
          allowCallWave: false,
          allowPause: false,
          allowSpeed: false,
          readOnlyTowers: true,
          allowedTowers: [],
          allowedInspectorActions: []
        });
        this.ui.setSpotlight("#towers-selector", true);
        this.ui.showAthenaTutorialStep(
          "Paso 1 de 8: Torres Divinas",
          "¡Saludos, estratega! Soy Atenea. Aquí abajo tienes a tus campeones del Olimpo: Artemisa, Zeus, Ares, Hades y Poseidón. Cada uno porta poderes divinos únicos.",
          "Siguiente ➔",
          () => this.applyStep(1),
          () => this.skip()
        );
        break;

      case 1: // Explicar oro (HUD superior con backdrop)
        this.highlightCanvasCell = null;
        this.ui.setTutorialLocks({
          allowCallWave: false,
          allowPause: false,
          allowSpeed: false,
          allowedTowers: [],
          allowedInspectorActions: []
        });
        this.ui.setSpotlight(".gold-badge", true);
        this.ui.showAthenaTutorialStep(
          "Paso 2 de 8: Dracmas de Oro",
          "Aquí arriba tienes tus Dracmas de oro (🪙). Las ganarás derrotando monstruos y las necesitas para convocar a los dioses y aumentar su poder en el campo de batalla.",
          "Siguiente ➔",
          () => this.applyStep(2),
          () => this.skip()
        );
        break;

      case 2: // Colocar Torre 1: Hércules en (4,6) (Solo se habilita Hércules)
        this.ui.clearSpotlight();
        this.ui.setTutorialLocks({
          allowCallWave: false,
          allowPause: false,
          allowSpeed: false,
          allowedTowers: ["HERCULES"],
          allowedInspectorActions: []
        });
        this.highlightCard("#btn-hercules");
        this.highlightCanvasCell = {
          col: this.hercules1TargetCell.col,
          row: this.hercules1TargetCell.row,
          label: "🏹 ARTEMISA 1 (4,6)",
          color: "#22c55e"
        };
        this.ui.showAthenaTutorialStep(
          "Paso 3 de 8: Primera Torre",
          "Selecciona a Artemisa (🏹 50🪙) y colócala en la posición (4,6) en la colina junto al camino para vigilar el flanco.",
          "Esperando colocación...",
          null,
          () => this.skip()
        );
        break;

      case 3: // Colocar Torre 2: Artemisa en (4,7)
        this.ui.clearSpotlight();
        this.ui.setTutorialLocks({
          allowCallWave: false,
          allowPause: false,
          allowSpeed: false,
          allowedTowers: ["HERCULES"],
          allowedInspectorActions: []
        });
        this.highlightCard("#btn-hercules");
        this.highlightCanvasCell = {
          col: this.hercules2TargetCell.col,
          row: this.hercules2TargetCell.row,
          label: "🏹 ARTEMISA 2 (4,7)",
          color: "#22c55e"
        };
        this.ui.showAthenaTutorialStep(
          "Paso 4 de 8: Segunda Torre",
          "¡Bien hecho! Ahora convoca a una segunda Artemisa (🏹 50🪙) en la posición (4,7) para duplicar la cadencia de virotes en la entrada.",
          "Esperando colocación...",
          null,
          () => this.skip()
        );
        break;

      case 4: // Colocar Torre 3: Zeus en (5,6)
        this.ui.clearSpotlight();
        this.ui.setTutorialLocks({
          allowCallWave: false,
          allowPause: false,
          allowSpeed: false,
          allowedTowers: ["ZEUS"],
          allowedInspectorActions: []
        });
        this.highlightCard("#btn-zeus");
        this.highlightCanvasCell = {
          col: this.zeusTargetCell.col,
          row: this.zeusTargetCell.row,
          label: "⚡ ZEUS (5,6)",
          color: "#38bdf8"
        };
        this.ui.showAthenaTutorialStep(
          "Paso 5 de 8: Invocación de Zeus",
          "¡Excelente formación! Ahora selecciona a Zeus (⚡ 75🪙) y colócalo en la posición (5,6) sobre la colina sagrada para dominar el cruce con rayos.",
          "Esperando colocación...",
          null,
          () => this.skip()
        );
        break;

      case 5: // Iniciar Oleada 1 (Se habilita exclusivamente el botón de oleada)
        this.clearCardHighlights();
        this.highlightCanvasCell = null;
        this.ui.clearSpotlight();
        this.ui.setTutorialLocks({
          allowCallWave: true,
          allowPause: false,
          allowSpeed: false,
          allowedTowers: [],
          allowedInspectorActions: []
        });
        this.ui.highlightElement("#call-wave-btn");
        this.ui.showAthenaTutorialStep(
          "Paso 6 de 8: Control de Oleadas",
          "Tus tres defensores están en posición. Presiona el botón verde 'INICIAR OLEADA' para que Tifón envíe a sus primeros soldados.",
          "Esperando inicio...",
          null,
          () => this.skip()
        );
        break;

      case 6: // Mejorar Hércules a Nivel 3 (dos mejoras) - Solo se habilita el botón Nivel
        this.ui.clearSpotlight();
        this.clearCardHighlights();
        this.ui.setTutorialLocks({
          allowCallWave: false,
          allowPause: false,
          allowSpeed: this.hasExplainedSpeed,
          allowedTowers: [],
          allowedInspectorActions: ["UPGRADE"]
        });

        // Asegurar que el jugador tenga oro suficiente para ambas mejoras
        if (this.game && this.game.economy.gold < 150) {
          this.game.economy.addGold(150);
        }

        const targetHerc = this.tutorialHercules1Tower || this.tutorialHercules2Tower;
        if (targetHerc) {
          this.highlightCanvasCell = {
            col: targetHerc.col,
            row: targetHerc.row,
            label: "👆 HAZ CLIC AQUÍ",
            color: "#22c55e"
          };
        }

        this.ui.showAthenaTutorialStep(
          "Paso 7 de 8: Mejoras de Nivel",
          "¡Oleada superada! Haz clic en la torre de Artemisa y presiona 'Nivel' dos veces para llevarla a Nivel 3 y aumentar su daño y cadencia.",
          "Esperando mejoras...",
          null,
          () => this.skip()
        );

        // Si la torre ya estaba inspeccionada al entrar a este paso:
        if (this.game && this.game.inspectedTower && this.game.inspectedTower.type === "HERCULES") {
          this.onTowerInspected(this.game.inspectedTower);
        }
        break;

      case 7: // Iniciar Oleada 2 y explicar oro por adelantar
        this.highlightCanvasCell = null;
        this.ui.clearSpotlight();
        this.ui.setTutorialLocks({
          allowCallWave: true,
          allowPause: false,
          allowSpeed: this.hasExplainedSpeed,
          allowedTowers: [],
          allowedInspectorActions: []
        });
        this.ui.highlightElement("#call-wave-btn");
        this.ui.showAthenaTutorialStep(
          "Paso 8 de 8: Adelanto de Oleadas",
          "¡Artemisa ha alcanzado el Nivel 3! Ahora presiona 'INICIAR OLEADA' para desatar la siguiente incursión enemiga.",
          "Esperando inicio...",
          null,
          () => this.skip()
        );
        break;

      case 8: // Clímax final: Zeus Forma 2 de regalo e invitación a Forma 3 (Solo se habilita Forma 2)
        this.ui.clearSpotlight();
        this.ui.setTutorialLocks({
          allowCallWave: false,
          allowPause: false,
          allowSpeed: this.hasExplainedSpeed,
          allowedTowers: [],
          allowedInspectorActions: ["EVOLVE"]
        });
        if (this.tutorialZeusTower) {
          this.highlightCanvasCell = {
            col: this.tutorialZeusTower.col,
            row: this.tutorialZeusTower.row,
            label: "⚡ HAZ CLIC EN ZEUS",
            color: "#38bdf8"
          };
        }
        this.ui.showAthenaTutorialStep(
          "Enseñanza Final: Forma 2 Divina",
          "¡Es momento de desatar el verdadero poder divino! Haz clic sobre la torre de Zeus (⚡).",
          "Esperando selección...",
          null,
          () => this.skip()
        );

        // Si Zeus ya estaba seleccionado al entrar a este paso:
        if (this.game && this.game.inspectedTower && this.game.inspectedTower.type === "ZEUS") {
          this.onTowerInspected(this.game.inspectedTower);
        }
        break;
    }
  }

  highlightCard(selector) {
    this.clearCardHighlights();
    const card = document.querySelector(selector);
    if (card) {
      card.classList.add("tutorial-highlighted");
      const hudBottom = card.closest("#hud-bottom");
      if (hudBottom) {
        hudBottom.classList.add("hud-spotlight-elevated");
      }
    }
  }

  clearCardHighlights() {
    document.querySelectorAll(".tower-card.tutorial-highlighted").forEach(c => c.classList.remove("tutorial-highlighted"));
  }

  isTowerTypeAllowed(type) {
    if (!this.isActive) return true;
    if (this.currentStep === 2 || this.currentStep === 3) {
      return type === "HERCULES";
    }
    if (this.currentStep === 4) {
      return type === "ZEUS";
    }
    return false;
  }

  isPlacementAllowed(type, col, row) {
    if (!this.isActive) return true;
    if (this.currentStep === 2) {
      return type === "HERCULES" && col === this.hercules1TargetCell.col && row === this.hercules1TargetCell.row;
    }
    if (this.currentStep === 3) {
      return type === "HERCULES" && col === this.hercules2TargetCell.col && row === this.hercules2TargetCell.row;
    }
    if (this.currentStep === 4) {
      return type === "ZEUS" && col === this.zeusTargetCell.col && row === this.zeusTargetCell.row;
    }
    return false;
  }

  getPlacementHint() {
    if (this.currentStep === 2) return "¡Coloca a Artemisa en la casilla resaltada (4,6)!";
    if (this.currentStep === 3) return "¡Coloca a Artemisa en la casilla resaltada (4,7)!";
    if (this.currentStep === 4) return "¡Coloca a Zeus en la casilla resaltada (5,6)!";
    return "¡Espera las órdenes de Atenea antes de construir!";
  }

  isTowerInspectionAllowed(tower) {
    if (!this.isActive) return true;
    if (this.currentStep === 6) {
      return tower.type === "HERCULES";
    }
    if (this.currentStep === 8) {
      return tower.type === "ZEUS";
    }
    return false;
  }

  getInspectionHint() {
    if (this.currentStep === 6) return "¡Haz clic en la torre de Artemisa para mejorarla!";
    if (this.currentStep === 8) return "¡Haz clic en la torre de Zeus para evolucionarla!";
    return "¡Sigue las instrucciones de Atenea en este momento!";
  }

  onTowerBuilt(tower) {
    if (!this.isActive) return;

    if (this.currentStep === 2 && tower.type === "HERCULES") {
      this.tutorialHercules1Tower = tower;
      this.highlightCanvasCell = null;
      this.applyStep(3);
    } else if (this.currentStep === 3 && tower.type === "HERCULES") {
      this.tutorialHercules2Tower = tower;
      this.highlightCanvasCell = null;
      this.applyStep(4);
    } else if (this.currentStep === 4 && tower.type === "ZEUS") {
      this.tutorialZeusTower = tower;
      this.highlightCanvasCell = null;
      this.applyStep(5);
    }
  }

  onWaveStarted(wave) {
    if (!this.isActive) return;

    if (this.currentStep === 5) {
      this.ui.clearSpotlight();
      this.ui.setTutorialLocks({
        allowCallWave: false,
        allowPause: false,
        allowSpeed: this.hasExplainedSpeed,
        allowedTowers: [],
        allowedInspectorActions: []
      });
      this.ui.showAthenaMessage("¡Los monstruos atacan! Observa cómo tus tres torres defienden el camino.", 4000);
    } else if (this.currentStep === 7) {
      this.ui.clearSpotlight();
      this.ui.setTutorialLocks({
        allowCallWave: false,
        allowPause: false,
        allowSpeed: this.hasExplainedSpeed,
        allowedTowers: [],
        allowedInspectorActions: []
      });
      this.ui.showAthenaTutorialStep(
        "Bono de Adelanto",
        "¡Atención estratega! Durante el combate puedes 'ADELANTAR OLEADA'. Si te arriesgas a llamar monstruos antes de tiempo, ¡el Olimpo te regalará Dracmas de oro extra de bonificación!",
        "Entendido ➔",
        () => this.applyStep(8),
        () => this.skip()
      );
    }
  }

  /**
   * Reacción pedagógica al abatir el primer enemigo: enseña el botón de velocidad.
   */
  onEnemyKilled(enemy) {
    if (!this.isActive) return;

    if (!this.hasExplainedSpeed) {
      this.hasExplainedSpeed = true;

      // Habilitar y resaltar el botón de velocidad en el HUD
      this.ui.setTutorialLocks({
        allowCallWave: false,
        allowPause: false,
        allowSpeed: true,
        allowedTowers: [],
        allowedInspectorActions: []
      });

      this.ui.highlightElement("#speed-btn");

      this.ui.showAthenaTutorialStep(
        "Control del Tiempo: Velocidad",
        "¡Primer monstruo abatido! Arriba a la derecha tienes el botón de velocidad (1x ⏩). Puedes pulsarlo en cualquier momento para acelerar el combate a 2x o 3x a tu gusto.",
        "¡Entendido! ➔",
        () => {
          this.ui.clearSpotlight();
          const speedBtn = document.querySelector("#speed-btn");
          if (speedBtn) speedBtn.classList.remove("tutorial-highlighted");
          this.ui.showAthenaMessage("¡Acelerador disponible! Puedes alternar la velocidad en cualquier momento.", 3000);
        },
        () => this.skip()
      );
    }
  }

  /**
   * Reacción pedagógica cuando un monstruo traspasa las defensas y resta vidas.
   */
  onLifeLost(remainingLives) {
    if (!this.isActive) return;
    if (this.hasExplainedLifeLoss) return; // Solo se explica una vez en el tutorial
    this.hasExplainedLifeLoss = true;

    // Resaltar suavemente el contador de vidas en el HUD superior
    this.ui.highlightLivesBadge(true);

    this.ui.showAthenaTutorialStep(
      "¡Alerta en las Puertas del Olimpo!",
      `¡Cuidado, mortal! Un monstruo ha superado nuestras defensas y alcanzado las puertas sagradas, restándonos 1 Vida (🏛️ ahora nos quedan ${remainingLives}). Si las vidas llegan a 0, el Olimpo caerá. ¡Por eso debemos reforzar y subir de nivel a nuestros héroes!`,
      "Entendido ➔",
      () => {
        this.ui.highlightLivesBadge(false);
        if (this.waitingForStep6AfterLifeExplaining) {
          this.waitingForStep6AfterLifeExplaining = false;
          this.applyStep(6);
        } else {
          this.ui.showAthenaMessage("¡Defiende el santuario! Al terminar la oleada reforzaremos a Artemisa.", 3500);
        }
      },
      () => this.skip()
    );
  }

  onWaveCompleted(wave) {
    if (!this.isActive) return;

    if (this.currentStep === 5 && wave === 1) {
      // Oleada 1 terminada: si el jugador aún lee el mensaje de vida perdida, esperar su click
      if (this.hasExplainedLifeLoss && this.ui.isAthenaBannerShowing()) {
        this.waitingForStep6AfterLifeExplaining = true;
      } else {
        setTimeout(() => {
          this.applyStep(6);
        }, 500);
      }
    }
  }

  onTowerInspected(tower) {
    if (!this.isActive) return;

    if (this.currentStep === 6 && tower.type === "HERCULES") {
      this.highlightCanvasCell = null;

      // Asegurar dracmas de oro suficientes para las mejoras
      if (this.game && this.game.economy.gold < 150) {
        this.game.economy.addGold(150);
        this.ui.updateInspector(tower, this.game.economy);
      }

      this.ui.highlightInspectorUpgrade(true);

      this.ui.showAthenaTutorialStep(
        "Paso 7 de 8: Mejorar a Nivel 3",
        `Artemisa está en Nivel ${tower.level}. Presiona 'Nivel' hasta llevarlo a Nivel 3 para potenciar sus disparos.`,
        "Esperando nivel 3...",
        null,
        () => this.skip()
      );
    } else if (this.currentStep === 8 && tower.type === "ZEUS") {
      this.highlightCanvasCell = null;
      const evolveCost = tower.getEvolveCost();
      if (this.game) {
        this.game.economy.addGold(evolveCost);
        this.game.particles.addFloatingText(tower.pos, `+${evolveCost} 🪙 ¡Regalo divino de Atenea!`, "#38bdf8", true);
        this.game.particles.addHitSparks(tower.pos, "#38bdf8", 20);
        this.ui.updateInspector(tower, this.game.economy);
      }

      this.ui.highlightInspectorEvolve(true);

      this.ui.showAthenaTutorialStep(
        "Enseñanza Final: Forma 2 de Zeus",
        "¡Te he concedido las dracmas de oro necesarias! Presiona 'Forma 2' para evolucionar a Zeus y desatar el Rayo en Cadena contra 6 objetivos.",
        "Esperando Forma 2...",
        null,
        () => this.skip()
      );
    }
  }

  onInspectorClosed() {
    if (!this.isActive) return;

    if (this.currentStep === 6) {
      this.ui.highlightInspectorUpgrade(false);
      const targetHerc = this.tutorialHercules1Tower || this.tutorialHercules2Tower;
      if (targetHerc && targetHerc.level < 3) {
        this.highlightCanvasCell = {
          col: targetHerc.col,
          row: targetHerc.row,
          label: "👆 HAZ CLIC AQUÍ",
          color: "#22c55e"
        };
      }
    } else if (this.currentStep === 8) {
      this.ui.highlightInspectorEvolve(false);
      if (this.tutorialZeusTower && this.tutorialZeusTower.form < 2) {
        this.highlightCanvasCell = {
          col: this.tutorialZeusTower.col,
          row: this.tutorialZeusTower.row,
          label: "⚡ HAZ CLIC EN ZEUS",
          color: "#38bdf8"
        };
      }
    }
  }

  onTowerUpgraded(tower) {
    if (!this.isActive) return;

    if (this.currentStep === 6 && tower.type === "HERCULES") {
      if (tower.level >= 3) {
        this.ui.highlightInspectorUpgrade(false);
        this.ui.closeInspector();
        this.applyStep(7);
      } else {
        // Asegurar que haya oro para la siguiente mejora
        if (this.game && this.game.economy.gold < tower.getUpgradeCost()) {
          this.game.economy.addGold(100);
          this.ui.updateInspector(tower, this.game.economy);
        }
        this.ui.highlightInspectorUpgrade(true);
        this.ui.showAthenaTutorialStep(
          "Paso 7 de 8: Mejorar a Nivel 3",
          `¡Nivel ${tower.level} alcanzado! Presiona 'Nivel' una vez más para alcanzar el Nivel 3.`,
          "Esperando nivel 3...",
          null,
          () => this.skip()
        );
      }
    }
  }

  onTowerEvolved(tower) {
    if (!this.isActive) return;

    if (this.currentStep === 8 && tower.type === "ZEUS" && tower.form >= 2) {
      this.ui.highlightInspectorEvolve(false);
      if (this.game && this.game.particles) {
        this.game.particles.addHitSparks(tower.pos, "#ffd166", 35);
        this.game.particles.addFloatingText(tower.pos, "¡Zeus Forma 2 Desatado!", "#ffd166", true);
      }

      this.finish(true);
    }
  }

  render(renderer) {
    if (!this.isActive || !this.highlightCanvasCell) return;
    renderer.renderTutorialHighlight(
      this.highlightCanvasCell.col,
      this.highlightCanvasCell.row,
      this.highlightCanvasCell.label,
      this.highlightCanvasCell.color
    );
  }

  skip() {
    this.isActive = false;
    this.highlightCanvasCell = null;
    this.clearCardHighlights();
    this.ui.clearSpotlight();
    this.ui.clearTutorialLocks();
    if (this.game && this.game.waveManager) {
      this.game.waveManager.isTutorialMode = false;
    }
    this.progress.completeTutorial();
    this.ui.hideAthenaBanner();
    this.ui.showAthenaMessage("Tutorial omitido. ¡Defiende el Olimpo a tu manera, estratega!", 3000);
    if (this.game && this.game.saveActiveMatchState) {
      this.game.saveActiveMatchState();
    }
  }

  finish(isTrophySuccess = false) {
    this.isActive = false;
    this.highlightCanvasCell = null;
    this.clearCardHighlights();
    this.ui.clearSpotlight();
    this.ui.clearTutorialLocks();
    if (this.game && this.game.waveManager) {
      this.game.waveManager.isTutorialMode = false;
    }
    this.progress.completeTutorial();
    this.ui.hideAthenaBanner();

    if (isTrophySuccess) {
      this.ui.showAthenaMessage("¡Tutorial completado! Zeus domina el Rayo en Cadena. ¡Busca llevarlo a Forma 3 y defiende el Monte Olimpo!", 6000);
    }
    if (this.game && this.game.saveActiveMatchState) {
      this.game.saveActiveMatchState();
    }
  }

  onGameOver() {
    this.highlightCanvasCell = null;
    this.clearCardHighlights();
    this.ui.clearSpotlight();
    this.ui.clearTutorialLocks();
    if (this.game && this.game.waveManager) {
      this.game.waveManager.isTutorialMode = false;
    }
    if (this.isActive || !this.progress.isTutorialCompleted()) {
      this.progress.completeTutorial();
      setTimeout(() => {
        this.ui.showAthenaMessage("Atenea: ¡Bien luchado! Cada derrota te hace más sabio. ¡El Olimpo confía en ti para la gran guerra infinita!", 6000);
      }, 500);
    }
  }
}
