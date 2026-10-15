/**
 * UIManager.js - Gestión del HUD, botones de torres, inspector y modales.
 */

import { TOWERS } from '../config/towersData.js';
import { POWERS_DATA } from '../config/powersData.js';
import { getTowerDamage } from '../config/balance.js';

export class UIManager {
  constructor(handlers) {
    this.handlers = handlers;

    // Elementos del Top HUD
    this.goldDisplay = document.getElementById("gold-display");
    this.testGoldBtn = document.getElementById("test-gold-btn");
    this.livesDisplay = document.getElementById("lives-display");
    this.waveDisplay = document.getElementById("wave-display");
    this.enemiesDisplay = document.getElementById("enemies-display");
    this.speedBtn = document.getElementById("speed-btn");
    this.speedLabel = document.getElementById("speed-label");
    this.pauseBtn = document.getElementById("pause-btn");
    this.pauseIcon = document.getElementById("pause-icon");
    this.fullscreenBtn = document.getElementById("fullscreen-btn");
    this.fullscreenIcon = document.getElementById("fullscreen-icon");
    this.rotateFullscreenBtn = document.getElementById("rotate-fullscreen-btn");

    // Elementos de Oleada
    this.callWaveBtn = document.getElementById("call-wave-btn");
    this.waveBtnSubtitle = document.getElementById("wave-btn-subtitle");

    // Selector de torres
    this.towerCards = document.querySelectorAll(".tower-card");

    // Panel inspector de torre
    this.inspectorPanel = document.getElementById("inspector-panel");
    this.inspectName = document.getElementById("inspect-name");
    this.inspectDamage = document.getElementById("inspect-damage");
    this.inspectRange = document.getElementById("inspect-range");
    this.inspectSpeed = document.getElementById("inspect-speed");
    this.upgradeCost = document.getElementById("upgrade-cost");
    this.upgradeCostWrapper = document.getElementById("upgrade-cost-wrapper");
    this.upgradeBtnText = document.getElementById("upgrade-btn-text");
    this.sellRefund = document.getElementById("sell-refund");
    this.upgradeBtn = document.getElementById("upgrade-tower-btn");
    this.evolveBtn = document.getElementById("evolve-tower-btn");
    this.evolveBtnText = document.getElementById("evolve-btn-text");
    this.evolveCostWrapper = document.getElementById("evolve-cost-wrapper");
    this.evolveCost = document.getElementById("evolve-cost");
    this.evolveDiscountBadge = document.getElementById("evolve-discount-badge");
    this.sellBtn = document.getElementById("sell-tower-btn");
    this.closeInspectBtn = document.getElementById("close-inspect-btn");

    // Elementos de Ramas de Ares (Forma 2)
    this.aresBranchContainer = document.getElementById("ares-branch-container");
    this.aresShrapnelBtn = document.getElementById("ares-shrapnel-btn");
    this.aresMinesBtn = document.getElementById("ares-mines-btn");
    this.aresShrapnelCost = document.getElementById("ares-shrapnel-cost");
    this.aresMinesCost = document.getElementById("ares-mines-cost");
    this.aresShrapnelDiscount = document.getElementById("ares-shrapnel-discount");
    this.aresMinesDiscount = document.getElementById("ares-mines-discount");
    this._lastInspectorStateKey = null;

    // Modal Game Over
    this.gameOverModal = document.getElementById("gameover-modal");
    this.goWave = document.getElementById("go-wave-reached");
    this.goGold = document.getElementById("go-gold-earned");
    this.goKills = document.getElementById("go-enemies-killed");
    this.goGames = document.getElementById("go-games-count");
    this.restartBtn = document.getElementById("restart-game-btn");
    this.gameoverMenuBtn = document.getElementById("gameover-menu-btn");

    // Modal de Pausa
    this.pauseModal = document.getElementById("pause-modal");
    this.resumeGameBtn = document.getElementById("resume-game-btn");
    this.restartFromPauseBtn = document.getElementById("restart-from-pause-btn");
    this.exitMenuBtn = document.getElementById("exit-menu-btn");

    // Modal Menú Principal (Etapa 6)
    this.mainMenuModal = document.getElementById("main-menu-modal");
    this.menuContinueContainer = document.getElementById("menu-continue-container");
    this.menuContinueBtn = document.getElementById("menu-continue-btn");
    this.menuContinueDetails = document.getElementById("menu-continue-details");
    this.menuPlayBtn = document.getElementById("menu-play-btn");
    this.menuTutorialBtn = document.getElementById("menu-tutorial-btn");
    this.menuLoreBtn = document.getElementById("menu-lore-btn");
    this.menuPlayPointer = document.getElementById("menu-play-pointer");
    this.menuCodexBtn = document.getElementById("menu-codex-btn");
    this.menuStatsBtn = document.getElementById("menu-stats-btn");
    this.menuSummaryStats = document.getElementById("menu-summary-stats");
    this.menuRecordWave = document.getElementById("menu-record-wave");
    this.menuRecordKills = document.getElementById("menu-record-kills");
    this.menuMapPreview = document.getElementById("menu-map-preview");
    this.mapPreviewTag = document.getElementById("map-preview-tag");
    this.modeStoryBtn = document.getElementById("mode-story-btn");
    this.modeSandboxBtn = document.getElementById("mode-sandbox-btn");
    this.menuModeDesc = document.getElementById("menu-mode-desc");

    // Modal Lore / Prólogo Inicial
    this.loreModal = document.getElementById("lore-modal");
    this.closeLoreBtn = document.getElementById("close-lore-btn");

    // Backdrop de Spotlight del Tutorial
    this.spotlightBackdrop = document.getElementById("tutorial-spotlight-backdrop");

    // Pantalla Dedicada de Habilidades Divinas (Cambio de Pantalla desde Menú)
    this.powersScreen = document.getElementById("powers-screen");
    this.btnPowersBack = document.getElementById("btn-powers-back");
    this.btnPowersDone = document.getElementById("btn-powers-done");
    this.btnPowersBackBottom = document.getElementById("btn-powers-back-bottom");
    this.btnPowersDoneBottom = document.getElementById("btn-powers-done-bottom");
    this.powersEquippedStatusText = document.getElementById("powers-equipped-status-text");

    // Modal Códice (compatibilidad)
    this.codexModal = this.powersScreen;
    this.closeCodexBtn = this.btnPowersDone;

    // Modal Récords y Progreso
    this.statsModal = document.getElementById("stats-modal");
    this.closeStatsBtn = document.getElementById("close-stats-btn");
    this.btnStatsBackTop = document.getElementById("btn-stats-back-top");
    this.resetProgressBtn = document.getElementById("reset-progress-btn");
    this.stGamesCount = document.getElementById("st-games-count");
    this.stHighestWave = document.getElementById("st-highest-wave");
    this.stEnemiesKilled = document.getElementById("st-enemies-killed");
    this.stTutorialStatus = document.getElementById("st-tutorial-status");
    this.stPowersDesc = document.getElementById("st-powers-desc");

    // Banner de Atenea & Tutorial Guiado
    this.athenaBanner = document.getElementById("athena-banner");
    this.athenaText = document.getElementById("athena-text");
    this.athenaBadge = document.getElementById("athena-step-badge");
    this.athenaActions = document.getElementById("athena-actions");
    this.athenaNextBtn = document.getElementById("athena-next-btn");
    this.athenaSkipBtn = document.getElementById("athena-skip-btn");
    this.athenaNextHandler = null;
    this.athenaSkipHandler = null;

    // Elementos de Habilidad Divina en el HUD y Altar
    this.btnCastPower = document.getElementById("btn-cast-power");
    this.hudPowerIcon = document.getElementById("hud-power-icon");
    this.hudPowerName = document.getElementById("hud-power-name");
    this.hudPowerCost = document.getElementById("hud-power-cost");
    this.hudPowerCooldown = document.getElementById("hud-power-cooldown");
    this.hudCooldownText = document.getElementById("hud-cooldown-text");

    this.tabBtnPowers = document.getElementById("tab-btn-powers");
    this.tabBtnTowers = document.getElementById("tab-btn-towers");
    this.altarPowersView = document.getElementById("altar-powers-view");
    this.altarTowersView = document.getElementById("altar-towers-view");
    this.equipPowerBtns = document.querySelectorAll(".equip-power-btn");

    this.selectedTowerType = null;
    this.inspectedTower = null;

    this.initEvents();
  }

  initEvents() {
    // Selección y arrastre de torres para construir
    this.towerCards.forEach(card => {
      const type = card.dataset.tower;

      card.addEventListener("pointerdown", (e) => {
        if (card.classList.contains("locked-tower") || card.classList.contains("tutorial-locked") || card.disabled) return;
        if (this.handlers.onTowerCardPointerDown) {
          this.handlers.onTowerCardPointerDown(type, e);
        }
      });

      card.addEventListener("click", (e) => {
        if (card.classList.contains("locked-tower") || card.classList.contains("tutorial-locked") || card.disabled) return;
        if (this.handlers.onTowerCardClick) {
          this.handlers.onTowerCardClick(type, e);
        }
      });
    });

    // Botón de llamar/adelantar oleada
    this.callWaveBtn.addEventListener("click", () => {
      if (this.callWaveBtn.classList.contains("tutorial-locked") || this.callWaveBtn.disabled) return;
      if (this.handlers.onTriggerWave) {
        this.handlers.onTriggerWave();
      }
    });

    // Inspector
    this.upgradeBtn.addEventListener("click", () => {
      if (this.upgradeBtn.classList.contains("tutorial-locked") || this.upgradeBtn.disabled) return;
      if (this.inspectedTower && this.handlers.onUpgradeTower) {
        this.handlers.onUpgradeTower(this.inspectedTower);
      }
    });

    this.evolveBtn.addEventListener("click", () => {
      if (this.evolveBtn.classList.contains("tutorial-locked") || this.evolveBtn.disabled) return;
      if (this.inspectedTower && this.handlers.onEvolveTower) {
        this.handlers.onEvolveTower(this.inspectedTower);
      }
    });

    this.aresShrapnelBtn.addEventListener("click", () => {
      if (this.aresShrapnelBtn.classList.contains("tutorial-locked") || this.aresShrapnelBtn.disabled) return;
      if (this.inspectedTower && this.handlers.onEvolveTower) {
        this.handlers.onEvolveTower(this.inspectedTower, "SHRAPNEL");
      }
    });

    this.aresMinesBtn.addEventListener("click", () => {
      if (this.aresMinesBtn.classList.contains("tutorial-locked") || this.aresMinesBtn.disabled) return;
      if (this.inspectedTower && this.handlers.onEvolveTower) {
        this.handlers.onEvolveTower(this.inspectedTower, "MINES");
      }
    });

    this.sellBtn.addEventListener("click", () => {
      if (this.sellBtn.classList.contains("tutorial-locked") || this.sellBtn.disabled) return;
      if (this.inspectedTower && this.handlers.onSellTower) {
        this.handlers.onSellTower(this.inspectedTower);
      }
    });

    this.closeInspectBtn.addEventListener("click", () => {
      this.closeInspector();
    });

    if (this.inspectorPanel) {
      this.inspectorPanel.addEventListener("click", (e) => e.stopPropagation());
      this.inspectorPanel.addEventListener("pointerdown", (e) => e.stopPropagation());
      this.inspectorPanel.addEventListener("pointerup", (e) => e.stopPropagation());
      this.inspectorPanel.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
      this.inspectorPanel.addEventListener("touchend", (e) => e.stopPropagation(), { passive: true });
    }

    // Control de velocidad
    this.speedBtn.addEventListener("click", () => {
      if (this.speedBtn.classList.contains("tutorial-locked") || this.speedBtn.disabled) return;
      if (this.handlers.onToggleSpeed) {
        const newSpeed = this.handlers.onToggleSpeed();
        this.speedLabel.textContent = `${newSpeed}x ⏩`;
        if (newSpeed >= 5) {
          this.speedBtn.style.borderColor = "#c084fc";
          this.speedBtn.style.color = "#f3e8ff";
          this.speedBtn.style.background = "rgba(88, 28, 135, 0.6)";
        } else if (newSpeed === 3) {
          this.speedBtn.style.borderColor = "#f97316";
          this.speedBtn.style.color = "#fed7aa";
          this.speedBtn.style.background = "rgba(154, 52, 18, 0.6)";
        } else if (newSpeed === 2) {
          this.speedBtn.style.borderColor = "#facc15";
          this.speedBtn.style.color = "#fef08a";
          this.speedBtn.style.background = "rgba(161, 98, 7, 0.5)";
        } else {
          this.speedBtn.style.borderColor = "";
          this.speedBtn.style.color = "";
          this.speedBtn.style.background = "";
        }
      }
    });

    // Botón de Prueba: +10,000 Oro para testing
    if (this.testGoldBtn) {
      this.testGoldBtn.addEventListener("click", () => {
        if (this.handlers.onAddTestGold) {
          this.handlers.onAddTestGold(10000);
        }
      });
    }

    // Botón de Pausa en el HUD
    this.pauseBtn.addEventListener("click", () => {
      if (this.pauseBtn.classList.contains("tutorial-locked") || this.pauseBtn.disabled) return;
      if (this.handlers.onOpenPause) {
        this.handlers.onOpenPause();
      }
    });

    // Control de Pantalla Completa y Bloqueo Horizontal
    const triggerFullscreen = async () => {
      try {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            await document.documentElement.webkitRequestFullscreen();
          }
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock("landscape").catch(() => {});
          }
        } else {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
          }
        }
      } catch (e) {
        console.warn("Fullscreen toggle warning:", e);
      }
    };

    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener("click", triggerFullscreen);
    }
    if (this.rotateFullscreenBtn) {
      this.rotateFullscreenBtn.addEventListener("click", triggerFullscreen);
    }

    const onFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      if (this.fullscreenIcon) {
        this.fullscreenIcon.textContent = isFs ? "🗗" : "⛶";
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);

    // Acciones del Menú de Pausa
    this.resumeGameBtn.addEventListener("click", () => {
      if (this.handlers.onResumeGame) {
        this.handlers.onResumeGame();
      }
    });

    this.restartFromPauseBtn.addEventListener("click", () => {
      this.closePauseModal();
      if (this.handlers.onRestartGame) {
        this.handlers.onRestartGame();
      }
    });

    this.exitMenuBtn.addEventListener("click", () => {
      this.closePauseModal();
      if (this.handlers.onExitMenu) {
        this.handlers.onExitMenu();
      }
    });

    // Reiniciar desde Game Over
    this.restartBtn.addEventListener("click", () => {
      this.gameOverModal.classList.add("hidden");
      if (this.handlers.onRestartGame) {
        this.handlers.onRestartGame();
      }
    });

    // Salir al Menú desde Game Over
    this.gameoverMenuBtn.addEventListener("click", () => {
      this.gameOverModal.classList.add("hidden");
      if (this.handlers.onExitMenu) {
        this.handlers.onExitMenu();
      }
    });

    // Acciones del Menú Principal (Etapa 6)
    if (this.modeStoryBtn) {
      this.modeStoryBtn.addEventListener("click", () => {
        if (this.handlers.onSelectGameMode) {
          this.handlers.onSelectGameMode("NORMAL");
        }
      });
    }

    if (this.modeSandboxBtn) {
      this.modeSandboxBtn.addEventListener("click", () => {
        if (this.handlers.onSelectGameMode) {
          this.handlers.onSelectGameMode("SANDBOX");
        }
      });
    }

    if (this.menuContinueBtn) {
      this.menuContinueBtn.addEventListener("click", () => {
        if (this.handlers.onContinueGame) {
          this.handlers.onContinueGame();
        }
      });
    }

    this.menuPlayBtn.addEventListener("click", () => {
      if (this.handlers.onStartGame) {
        this.handlers.onStartGame();
      }
    });

    if (this.menuTutorialBtn) {
      this.menuTutorialBtn.addEventListener("click", () => {
        if (this.handlers.onStartTutorial) {
          this.handlers.onStartTutorial();
        }
      });
    }

    if (this.menuLoreBtn) {
      this.menuLoreBtn.addEventListener("click", () => {
        if (this.handlers.onOpenLore) {
          this.handlers.onOpenLore();
        } else {
          this.openLore();
        }
      });
    }

    if (this.closeLoreBtn) {
      this.closeLoreBtn.addEventListener("click", () => {
        if (this.handlers.onCloseLore) {
          this.handlers.onCloseLore();
        } else {
          this.closeLore();
        }
      });
    }

    if (this.menuCodexBtn) {
      this.menuCodexBtn.addEventListener("click", () => {
        if (this.handlers.onOpenCodex) {
          this.handlers.onOpenCodex();
        } else {
          this.openPowersScreen();
        }
      });
    }

    // Botones ATRÁS y HECHO para volver al menú principal desde la pantalla de habilidades
    const returnToMainMenu = () => {
      this.closePowersScreen();
    };

    if (this.btnPowersBack) this.btnPowersBack.addEventListener("click", returnToMainMenu);
    if (this.btnPowersDone) this.btnPowersDone.addEventListener("click", returnToMainMenu);
    if (this.btnPowersBackBottom) this.btnPowersBackBottom.addEventListener("click", returnToMainMenu);
    if (this.btnPowersDoneBottom) this.btnPowersDoneBottom.addEventListener("click", returnToMainMenu);

    // Clic en tarjetas de dioses olímpicos para equipar
    document.querySelectorAll(".power-god-card").forEach(card => {
      card.addEventListener("click", () => {
        const pId = card.dataset.power;
        if (card.classList.contains("power-card-locked")) {
          const conf = POWERS_DATA[pId];
          if (conf) {
            this.showAthenaMessage(`🔒 ${conf.god} está bloqueado. Requiere ${conf.unlockGames} partidas jugadas para desbloquearse.`, 3000);
          }
          return;
        }
        if (pId && this.handlers.onEquipPower) {
          this.handlers.onEquipPower(pId);
        }
      });
    });

    document.querySelectorAll(".god-card-equip-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const pId = btn.dataset.power;
        const card = btn.closest(".power-god-card");
        if (btn.disabled || (card && card.classList.contains("power-card-locked"))) {
          const conf = POWERS_DATA[pId];
          if (conf) {
            this.showAthenaMessage(`🔒 ${conf.god} requiere ${conf.unlockGames} partidas para desbloquearse.`, 3000);
          }
          return;
        }
        if (pId && this.handlers.onEquipPower) {
          this.handlers.onEquipPower(pId);
        }
      });
    });

    // Botón de invocar Habilidad Divina en el HUD de batalla
    if (this.btnCastPower) {
      this.btnCastPower.addEventListener("click", () => {
        if (this.handlers.onCastPower) {
          this.handlers.onCastPower();
        }
      });
    }

    this.menuStatsBtn.addEventListener("click", () => {
      if (this.handlers.onOpenStats) {
        this.handlers.onOpenStats();
      } else {
        this.openStats();
      }
    });

    this.closeStatsBtn.addEventListener("click", () => {
      this.closeStats();
    });

    if (this.btnStatsBackTop) {
      this.btnStatsBackTop.addEventListener("click", () => {
        this.closeStats();
      });
    }

    this.resetProgressBtn.addEventListener("click", () => {
      if (confirm("¿Deseas reiniciar todas tus estadísticas y progreso del Monte Olimpo?")) {
        if (this.handlers.onResetProgress) {
          this.handlers.onResetProgress();
        }
      }
    });

    // Botones del Banner Interactivo de Atenea (Tutorial)
    this.athenaNextBtn.addEventListener("click", () => {
      if (this.athenaNextHandler) {
        this.athenaNextHandler();
      }
    });

    this.athenaSkipBtn.addEventListener("click", () => {
      if (this.athenaSkipHandler) {
        this.athenaSkipHandler();
      }
    });
  }

  openPauseModal() {
    this.pauseModal.classList.remove("hidden");
    this.pauseIcon.textContent = "▶️";
    this.clearTowerSelection();
    this.closeInspector();
  }

  closePauseModal() {
    this.pauseModal.classList.add("hidden");
    this.pauseIcon.textContent = "⏸️";
  }

  selectTowerType(type) {
    this.selectedTowerType = type;
    this.closeInspector();
    this.towerCards.forEach(card => {
      if (card.dataset.tower === type) {
        card.classList.add("selected");
      } else {
        card.classList.remove("selected");
      }
    });
    if (this.handlers.onSelectTowerType) {
      this.handlers.onSelectTowerType(type);
    }
  }

  clearTowerSelection() {
    this.selectedTowerType = null;
    this.towerCards.forEach(card => card.classList.remove("selected"));
    if (this.handlers.onSelectTowerType) {
      this.handlers.onSelectTowerType(null);
    }
  }

  updateHUD(economy, waveManager) {
    this.goldDisplay.textContent = Math.floor(economy.gold);
    this.livesDisplay.textContent = economy.lives;
    this.waveDisplay.textContent = waveManager.currentWave;
    // Contador de enemigos muertos/derrotados en la batalla
    this.enemiesDisplay.textContent = waveManager.totalEnemiesKilled;

    // Actualizar disponibilidad de compra para todas las torres olímpicas
    this.towerCards.forEach(card => {
      const type = card.dataset.tower;
      const config = TOWERS[type];
      if (config) {
        if (economy.gold < config.cost) {
          card.classList.add("cannot-afford");
        } else {
          card.classList.remove("cannot-afford");
        }
      }
    });

    // Actualizar botón de oleada según si está en cooldown o combate en curso
    if (waveManager.callCooldown > 0) {
      const remainingSec = waveManager.callCooldown.toFixed(1);
      this.callWaveBtn.classList.add("cooldown");
      this.callWaveBtn.disabled = true;
      this.callWaveBtn.querySelector(".wave-btn-title").textContent = `ESPERA (${remainingSec}s)`;
      this.waveBtnSubtitle.textContent = waveManager.isWaveActive ? "Oleada en marcha..." : "Preparando enemigos...";
      this.callWaveBtn.style.background = "linear-gradient(135deg, #374151 0%, #1f2937 100%)";
      this.callWaveBtn.style.borderColor = "#4b5563";
    } else {
      this.callWaveBtn.classList.remove("cooldown");
      if (!this.callWaveBtn.classList.contains("tutorial-locked")) {
        this.callWaveBtn.disabled = false;
      }

      if (!waveManager.isWaveActive) {
        const nextWave = waveManager.currentWave + 1;
        this.callWaveBtn.querySelector(".wave-btn-title").textContent = `INICIAR OLEADA ${nextWave}`;
        this.waveBtnSubtitle.textContent = waveManager.currentWave === 0 ? "¡Prepara tus defensas!" : "Comenzar cuando estés listo";
        this.callWaveBtn.style.background = "linear-gradient(135deg, #15803d 0%, #166534 100%)";
        this.callWaveBtn.style.borderColor = "#22c55e";
      } else {
        const bonus = waveManager.getEarlyCallBonus();
        this.callWaveBtn.querySelector(".wave-btn-title").textContent = "ADELANTAR OLEADA";
        this.waveBtnSubtitle.textContent = `¡Riesgo! (+${Math.round(bonus)} 🪙)`;
        this.callWaveBtn.style.background = "linear-gradient(135deg, #d97706 0%, #b45309 100%)";
        this.callWaveBtn.style.borderColor = "#f59e0b";
      }
    }

    // Actualizar inspector si está abierto
    if (this.inspectedTower) {
      this.updateInspector(this.inspectedTower, economy);
    }
  }

  openInspector(tower, economy) {
    this.inspectedTower = tower;
    this.selectedTowerType = null;
    this.towerCards.forEach(card => card.classList.remove("selected"));

    // Posicionar la ventana flotante junto a la torre adaptada a la escala visual actual
    const canvasEl = document.getElementById("game-canvas");
    const rect = canvasEl.getBoundingClientRect();
    const intrinsicRatio = 1024 / 640;
    const elementRatio = rect.width / rect.height;

    let renderWidth = rect.width;
    let renderHeight = rect.height;
    let renderOffsetX = 0;
    let renderOffsetY = 0;

    if (elementRatio > intrinsicRatio) {
      renderWidth = rect.height * intrinsicRatio;
      renderOffsetX = (rect.width - renderWidth) / 2;
    } else if (elementRatio < intrinsicRatio) {
      renderHeight = rect.width / intrinsicRatio;
      renderOffsetY = (rect.height - renderHeight) / 2;
    }

    const scaleVisualX = renderWidth / 1024;
    const scaleVisualY = renderHeight / 640;

    const panelWidth = 220;
    const panelHeight = 170;

    let posX = renderOffsetX + (tower.pos.x + 36) * scaleVisualX;
    if (posX + panelWidth > renderOffsetX + renderWidth) {
      posX = renderOffsetX + (tower.pos.x - 36) * scaleVisualX - panelWidth;
    }

    let posY = renderOffsetY + (tower.pos.y - panelHeight / 2) * scaleVisualY;
    posY = Math.max(renderOffsetY + 10, Math.min(renderOffsetY + renderHeight - panelHeight - 10, posY));
    posX = Math.max(renderOffsetX + 10, posX);

    this.inspectorPanel.style.left = `${posX}px`;
    this.inspectorPanel.style.top = `${posY}px`;

    this._lastInspectorStateKey = null;
    this.inspectorPanel.classList.remove("hidden");
    this.updateInspector(tower, economy);
  }

  updateInspector(tower, economy) {
    if (!tower) return;

    const cost = tower.getUpgradeCost();
    const refund = tower.getSellRefund();
    const evolveCost = tower.getEvolveCost();
    const discount = tower.getEvolveDiscount();
    const canAffordUpgrade = economy.canAfford(cost) && tower.level < tower.maxLevel;
    const canAffordEvolve = economy.canAfford(evolveCost) && tower.form < 3;
    const tutorialLocksJson = this.activeTutorialLocks ? JSON.stringify(this.activeTutorialLocks.allowedInspectorActions) : "";

    // Caché de estado: Si los atributos relevantes no han cambiado, evitamos mutaciones innecesarias del DOM
    // Esto asegura que los eventos de clic/toque no se interrumpan por reconstrucción del árbol DOM a 60 FPS
    const stateKey = `${tower.col}_${tower.row}_${tower.type}_${tower.level}_${tower.form}_${tower.branch || ""}_${tower.damage}_${tower.range}_${tower.fireRate}_${cost}_${refund}_${evolveCost}_${discount}_${canAffordUpgrade}_${canAffordEvolve}_${tutorialLocksJson}`;
    if (this._lastInspectorStateKey === stateKey) {
      return;
    }
    this._lastInspectorStateKey = stateKey;

    this.inspectName.textContent = `${tower.name} - ${tower.getFormName()} (Nv.${tower.level})`;
    this.inspectDamage.textContent = tower.damage;
    this.inspectRange.textContent = tower.range;
    this.inspectSpeed.textContent = `${tower.fireRate.toFixed(2)}/s`;

    if (this.upgradeCost) this.upgradeCost.textContent = cost;
    if (this.sellRefund) this.sellRefund.textContent = refund;

    // Previsualización de daño con la función pura getTowerDamage
    const nextLevelDamage = tower.getNextLevelDamage ? tower.getNextLevelDamage() : getTowerDamage(tower.type, tower.form, tower.level + 1);
    const nextFormDamage = tower.getNextFormDamage ? tower.getNextFormDamage() : getTowerDamage(tower.type, tower.form + 1, 1);

    // Botón de Nivel (1 a 10)
    this.upgradeBtn.disabled = !canAffordUpgrade;
    this.upgradeBtn.style.opacity = canAffordUpgrade ? "1" : "0.5";

    if (tower.level >= tower.maxLevel) {
      if (this.upgradeBtnText) this.upgradeBtnText.textContent = "Nivel Máx. (10)";
      if (this.upgradeCostWrapper) this.upgradeCostWrapper.style.display = "none";
      this.upgradeBtn.title = "Nivel máximo alcanzado";
    } else {
      if (this.upgradeBtnText) this.upgradeBtnText.textContent = "Nivel";
      if (this.upgradeCostWrapper) this.upgradeCostWrapper.style.display = "";
      this.upgradeBtn.title = `Mejorar a Nivel ${tower.level + 1} (Daño: ${nextLevelDamage})`;
    }

    // Comprobar si es Ares en Forma 1 (ofrece elección de rama permanente para Forma 2)
    if (tower.type === "ARES" && tower.form === 1) {
      this.evolveBtn.classList.add("hidden");
      this.aresBranchContainer.classList.remove("hidden");

      if (this.aresShrapnelCost) this.aresShrapnelCost.textContent = evolveCost;
      if (this.aresMinesCost) this.aresMinesCost.textContent = evolveCost;

      this.aresShrapnelBtn.disabled = !canAffordEvolve;
      this.aresMinesBtn.disabled = !canAffordEvolve;
      this.aresShrapnelBtn.style.opacity = canAffordEvolve ? "1" : "0.5";
      this.aresMinesBtn.style.opacity = canAffordEvolve ? "1" : "0.5";

      if (this.aresShrapnelBtn) {
        this.aresShrapnelBtn.title = `💥 Esquirlas F2 (Daño Nv.1: ${nextFormDamage})`;
      }
      if (this.aresMinesBtn) {
        this.aresMinesBtn.title = `💣 Bombas F2 (Daño Nv.1: ${nextFormDamage})`;
      }

      if (this.aresShrapnelDiscount) {
        if (discount > 0) {
          this.aresShrapnelDiscount.textContent = ` -${discount}`;
          this.aresShrapnelDiscount.style.display = "";
        } else {
          this.aresShrapnelDiscount.style.display = "none";
        }
      }
      if (this.aresMinesDiscount) {
        if (discount > 0) {
          this.aresMinesDiscount.textContent = ` -${discount}`;
          this.aresMinesDiscount.style.display = "";
        } else {
          this.aresMinesDiscount.style.display = "none";
        }
      }
    } else {
      this.aresBranchContainer.classList.add("hidden");
      this.evolveBtn.classList.remove("hidden");

      // Botón de Evolución de Forma (disponible a cualquier nivel con descuento acumulativo)
      if (tower.form < 3) {
        const nextFormNum = tower.form + 1;
        this.evolveBtn.disabled = !canAffordEvolve;
        this.evolveBtn.style.opacity = canAffordEvolve ? "1" : "0.5";

        if (this.evolveBtnText) this.evolveBtnText.textContent = `Forma ${nextFormNum}`;
        if (this.evolveCostWrapper) this.evolveCostWrapper.style.display = "";
        if (this.evolveCost) this.evolveCost.textContent = evolveCost;

        const discountText = discount > 0 ? ` [Descuento -${discount} 🪙 por ${tower.level - 1} niveles]` : "";
        this.evolveBtn.title = `Evolucionar a Forma ${nextFormNum} (Daño Nv.1: ${nextFormDamage})${discountText}`;

        if (this.evolveDiscountBadge) {
          if (discount > 0) {
            this.evolveDiscountBadge.textContent = ` -${discount}`;
            this.evolveDiscountBadge.style.display = "";
          } else {
            this.evolveDiscountBadge.style.display = "none";
          }
        }
      } else {
        this.evolveBtn.disabled = true;
        this.evolveBtn.style.opacity = "0.6";
        if (this.evolveBtnText) this.evolveBtnText.textContent = "Forma Máx. (3)";
        if (this.evolveCostWrapper) this.evolveCostWrapper.style.display = "none";
        this.evolveBtn.title = "La torre ha alcanzado su máximo poder divino";
      }
    }

    // Aplicar restricciones del tutorial en botones del inspector
    if (this.activeTutorialLocks && Array.isArray(this.activeTutorialLocks.allowedInspectorActions)) {
      const allowed = this.activeTutorialLocks.allowedInspectorActions;
      if (!allowed.includes("UPGRADE")) {
        this.upgradeBtn.classList.add("tutorial-locked");
        this.upgradeBtn.disabled = true;
      } else {
        this.upgradeBtn.classList.remove("tutorial-locked");
      }

      if (!allowed.includes("EVOLVE")) {
        this.evolveBtn.classList.add("tutorial-locked");
        this.evolveBtn.disabled = true;
        this.aresShrapnelBtn.classList.add("tutorial-locked");
        this.aresShrapnelBtn.disabled = true;
        this.aresMinesBtn.classList.add("tutorial-locked");
        this.aresMinesBtn.disabled = true;
      } else {
        this.evolveBtn.classList.remove("tutorial-locked");
      }

      if (!allowed.includes("SELL")) {
        this.sellBtn.classList.add("tutorial-locked");
        this.sellBtn.disabled = true;
      } else {
        this.sellBtn.classList.remove("tutorial-locked");
      }
    } else {
      this.upgradeBtn.classList.remove("tutorial-locked");
      this.evolveBtn.classList.remove("tutorial-locked");
      this.aresShrapnelBtn.classList.remove("tutorial-locked");
      this.aresMinesBtn.classList.remove("tutorial-locked");
      this.sellBtn.classList.remove("tutorial-locked");
    }
  }

  closeInspector() {
    this.inspectedTower = null;
    this._lastInspectorStateKey = null;
    this.inspectorPanel.classList.add("hidden");
    if (this.handlers.onDeselectTower) {
      this.handlers.onDeselectTower();
    }
    if (this.handlers.onInspectorClosed) {
      this.handlers.onInspectorClosed();
    }
  }

  showGameOver(wave, gold, kills, games, isSandbox = false) {
    this.goWave.textContent = wave;
    this.goGold.textContent = Math.floor(gold);
    this.goKills.textContent = kills;
    this.goGames.textContent = isSandbox ? `${games} (Pruebas)` : games;
    this.gameOverModal.classList.remove("hidden");
  }

  setGameMode(mode = "NORMAL") {
    const isSandbox = mode === "SANDBOX";
    if (this.modeStoryBtn) {
      if (!isSandbox) {
        this.modeStoryBtn.classList.add("active");
      } else {
        this.modeStoryBtn.classList.remove("active");
      }
    }
    if (this.modeSandboxBtn) {
      if (isSandbox) {
        this.modeSandboxBtn.classList.add("active");
      } else {
        this.modeSandboxBtn.classList.remove("active");
      }
    }

    if (this.menuModeDesc) {
      if (isSandbox) {
        this.menuModeDesc.textContent = "Modo Pruebas / Sandbox · Todo desbloqueado · Botón +10,000 🪙 disponible";
        this.menuModeDesc.style.color = "#fde047";
      } else {
        this.menuModeDesc.textContent = "Progresión legítima · Desbloqueo de bendiciones divinas";
        this.menuModeDesc.style.color = "#94a3b8";
      }
    }

    if (this.mapPreviewTag) {
      this.mapPreviewTag.textContent = isSandbox ? "CAMINO DE FLEGRA · PRUEBAS" : "CAMINO DE FLEGRA · HISTORIA";
    }

    if (this.testGoldBtn) {
      if (isSandbox) {
        this.testGoldBtn.classList.remove("hidden-mode");
      } else {
        this.testGoldBtn.classList.add("hidden-mode");
      }
    }
  }

  showTestGoldButton(show = true) {
    if (!this.testGoldBtn) return;
    if (show) {
      this.testGoldBtn.classList.remove("hidden-mode");
    } else {
      this.testGoldBtn.classList.add("hidden-mode");
    }
  }

  updateContinueButton(activeMatch) {
    if (!this.menuContinueContainer) return;
    if (activeMatch && activeMatch.economy && activeMatch.economy.lives > 0) {
      this.menuContinueContainer.classList.remove("hidden");
      const wave = activeMatch.waveManager ? activeMatch.waveManager.currentWave : 1;
      const gold = activeMatch.economy ? Math.floor(activeMatch.economy.gold) : 0;
      const lives = activeMatch.economy ? activeMatch.economy.lives : 20;
      const isWaveActive = Boolean(activeMatch.waveManager && activeMatch.waveManager.isWaveActive);
      const modeTag = activeMatch.gameMode === "SANDBOX" ? "[Pruebas] " : "";
      const waveText = wave === 0 ? "Oleada 1 (Prep.)" : (isWaveActive ? `Oleada ${wave} (En combate)` : `Oleada ${wave} lista`);
      if (this.menuContinueDetails) {
        this.menuContinueDetails.textContent = `${modeTag}${waveText} · 🪙 ${gold.toLocaleString()} · 🏛️ ${lives} vidas`;
      }
    } else {
      this.menuContinueContainer.classList.add("hidden");
    }
  }

  openMainMenu(progressData, activeMatch = null) {
    this.updateMenuStats(progressData);
    this.updateContinueButton(activeMatch);
    this.mainMenuModal.classList.remove("hidden");
    if (this.handlers.onRenderMenuMap) {
      this.handlers.onRenderMenuMap();
    }
  }

  closeMainMenu() {
    this.mainMenuModal.classList.add("hidden");
  }

  openLore() {
    this.loreModal.classList.remove("hidden");
  }

  closeLore() {
    this.loreModal.classList.add("hidden");
  }

  setMenuGuidedPlay(active = true) {
    if (active) {
      this.mainMenuModal.classList.add("menu-guided-play");
      if (this.menuPlayPointer) {
        this.menuPlayPointer.classList.remove("hidden");
      }
    } else {
      this.mainMenuModal.classList.remove("menu-guided-play");
      if (this.menuPlayPointer) {
        this.menuPlayPointer.classList.add("hidden");
      }
    }
  }

  setSpotlight(elementOrSelector, showBackdrop = true) {
    this.clearSpotlight();
    let el = null;
    if (typeof elementOrSelector === "string") {
      el = document.querySelector(elementOrSelector);
    } else {
      el = elementOrSelector;
    }

    if (el) {
      if (showBackdrop && this.spotlightBackdrop) {
        this.spotlightBackdrop.classList.remove("hidden");
      }
      el.classList.add("tutorial-highlighted");
      this.currentSpotlightEl = el;

      // Romper el stacking context elevando el contenedor HUD correspondiente (nunca canvas ni inspector)
      const parentHud = el.closest("#hud-top, #hud-bottom");
      if (parentHud) {
        parentHud.classList.add("hud-spotlight-elevated");
      }
    }
  }

  highlightElement(elementOrSelector) {
    this.setSpotlight(elementOrSelector, false);
  }

  highlightInspectorUpgrade(active = true) {
    if (this.upgradeBtn) {
      if (active) {
        this.upgradeBtn.classList.add("tutorial-highlighted");
      } else {
        this.upgradeBtn.classList.remove("tutorial-highlighted");
      }
    }
  }

  highlightInspectorEvolve(active = true) {
    if (this.evolveBtn) {
      if (active) {
        this.evolveBtn.classList.add("tutorial-highlighted");
      } else {
        this.evolveBtn.classList.remove("tutorial-highlighted");
      }
    }
  }

  highlightLivesBadge(active = true) {
    const livesBadge = document.querySelector(".lives-badge");
    if (livesBadge) {
      if (active) {
        livesBadge.classList.add("tutorial-highlighted");
      } else {
        livesBadge.classList.remove("tutorial-highlighted");
      }
    }
  }

  isAthenaBannerShowing() {
    return this.athenaBanner && !this.athenaBanner.classList.contains("hidden");
  }

  clearSpotlight() {
    if (this.currentSpotlightEl) {
      this.currentSpotlightEl.classList.remove("tutorial-highlighted");
      this.currentSpotlightEl = null;
    }
    document.querySelectorAll(".tutorial-highlighted").forEach(el => el.classList.remove("tutorial-highlighted"));
    document.querySelectorAll(".hud-spotlight-elevated").forEach(el => el.classList.remove("hud-spotlight-elevated"));
    if (this.spotlightBackdrop) {
      this.spotlightBackdrop.classList.add("hidden");
    }
  }

  setTutorialLocks(locks = null) {
    this.activeTutorialLocks = locks;
    if (!locks) {
      this.clearTutorialLocks();
      return;
    }

    // 1. Botón de oleada
    if (locks.allowCallWave) {
      this.callWaveBtn.classList.remove("tutorial-locked");
      if (!this.callWaveBtn.classList.contains("cooldown")) {
        this.callWaveBtn.disabled = false;
      }
    } else {
      this.callWaveBtn.classList.add("tutorial-locked");
      this.callWaveBtn.disabled = true;
    }

    // 2. Botón de pausa
    if (locks.allowPause) {
      this.pauseBtn.classList.remove("tutorial-locked");
      this.pauseBtn.disabled = false;
    } else {
      this.pauseBtn.classList.add("tutorial-locked");
      this.pauseBtn.disabled = true;
    }

    // 3. Botón de velocidad
    if (locks.allowSpeed) {
      this.speedBtn.classList.remove("tutorial-locked");
      this.speedBtn.disabled = false;
    } else {
      this.speedBtn.classList.add("tutorial-locked");
      this.speedBtn.disabled = true;
    }

    // 4. Cartas de torres
    const allowedTowers = locks.allowedTowers || [];
    const readOnlyTowers = locks.readOnlyTowers || false;
    this.towerCards.forEach(card => {
      const type = card.dataset.tower;
      if (readOnlyTowers) {
        // Modo presentación (Paso 1): colores vibrantes y nítidos, pero sin arrastrar/clic
        card.classList.remove("tutorial-locked");
        card.disabled = false;
        card.style.pointerEvents = "none";
        card.style.opacity = "1";
        card.style.filter = "none";
      } else if (allowedTowers.includes(type)) {
        card.classList.remove("tutorial-locked");
        card.disabled = false;
        card.style.pointerEvents = "auto";
        card.style.opacity = "";
        card.style.filter = "";
      } else {
        card.classList.add("tutorial-locked");
        card.disabled = true;
        card.style.pointerEvents = "none";
        card.style.opacity = "";
        card.style.filter = "";
      }
    });

    // 5. Botones del inspector
    if (this.inspectedTower && Array.isArray(locks.allowedInspectorActions)) {
      if (!locks.allowedInspectorActions.includes("UPGRADE")) {
        this.upgradeBtn.classList.add("tutorial-locked");
        this.upgradeBtn.disabled = true;
      } else {
        this.upgradeBtn.classList.remove("tutorial-locked");
      }

      if (!locks.allowedInspectorActions.includes("EVOLVE")) {
        this.evolveBtn.classList.add("tutorial-locked");
        this.evolveBtn.disabled = true;
        this.aresShrapnelBtn.classList.add("tutorial-locked");
        this.aresShrapnelBtn.disabled = true;
        this.aresMinesBtn.classList.add("tutorial-locked");
        this.aresMinesBtn.disabled = true;
      } else {
        this.evolveBtn.classList.remove("tutorial-locked");
      }

      if (!locks.allowedInspectorActions.includes("SELL")) {
        this.sellBtn.classList.add("tutorial-locked");
        this.sellBtn.disabled = true;
      } else {
        this.sellBtn.classList.remove("tutorial-locked");
      }
    }
  }

  clearTutorialLocks() {
    this.activeTutorialLocks = null;
    this.callWaveBtn.classList.remove("tutorial-locked");
    if (!this.callWaveBtn.classList.contains("cooldown")) {
      this.callWaveBtn.disabled = false;
    }

    this.pauseBtn.classList.remove("tutorial-locked");
    this.pauseBtn.disabled = false;

    this.speedBtn.classList.remove("tutorial-locked");
    this.speedBtn.disabled = false;

    this.towerCards.forEach(card => {
      card.classList.remove("tutorial-locked");
      card.disabled = false;
      card.style.pointerEvents = "";
      card.style.opacity = "";
      card.style.filter = "";
    });

    this.upgradeBtn.classList.remove("tutorial-locked");
    this.evolveBtn.classList.remove("tutorial-locked");
    this.aresShrapnelBtn.classList.remove("tutorial-locked");
    this.aresMinesBtn.classList.remove("tutorial-locked");
    this.sellBtn.classList.remove("tutorial-locked");
  }

  updateMenuStats(progressData) {
    if (!progressData) return;
    const games = progressData.gamesPlayed || 0;
    const wave = progressData.highestWave || 0;
    const kills = progressData.totalEnemiesKilled || 0;
    if (this.menuRecordWave) {
      this.menuRecordWave.textContent = `Oleada ${wave}`;
    }
    if (this.menuRecordKills) {
      this.menuRecordKills.textContent = kills;
    }
    if (this.menuSummaryStats) {
      this.menuSummaryStats.textContent = `Partidas: ${games} · Récord: Oleada ${wave}`;
    }
  }

  openPowersScreen(equippedPowerId = "DEMETER", unlockedPowers = ["DEMETER"], gamesPlayed = 0, isSandbox = false) {
    this.updatePowersScreenCards(equippedPowerId, unlockedPowers, gamesPlayed, isSandbox);
    if (this.mainMenuModal) this.mainMenuModal.classList.add("hidden");
    if (this.powersScreen) this.powersScreen.classList.remove("hidden");
  }

  closePowersScreen(returnToMenu = true) {
    if (this.powersScreen) this.powersScreen.classList.add("hidden");
    if (returnToMenu && this.mainMenuModal) {
      this.mainMenuModal.classList.remove("hidden");
    }
  }

  // Alias para mantener compatibilidad con llamadas existentes
  openCodex(equippedPowerId = "DEMETER", unlockedPowers = ["DEMETER"], gamesPlayed = 0, isSandbox = false) {
    this.openPowersScreen(equippedPowerId, unlockedPowers, gamesPlayed, isSandbox);
  }

  closeCodex() {
    this.closePowersScreen();
  }

  switchAltarTab(tab) {
    // Si se usan pestañas en el códice
  }

  updatePowersScreenCards(equippedPowerId, unlockedPowers = ["DEMETER"], gamesPlayed = 0, isSandbox = false) {
    document.querySelectorAll(".power-god-card").forEach(card => {
      const pId = card.dataset.power;
      const btn = card.querySelector(".god-card-equip-btn");
      const conf = POWERS_DATA[pId];
      const reqGames = conf ? conf.unlockGames : 0;
      const isUnlocked = isSandbox || (unlockedPowers && unlockedPowers.includes(pId)) || gamesPlayed >= reqGames;

      // Sincronizar dinámicamente chips de costo y enfriamiento desde POWERS_DATA
      if (conf) {
        const chips = card.querySelectorAll(".god-stat-chip");
        if (chips.length >= 2) {
          chips[0].textContent = `🪙 ${conf.goldCost}`;
          chips[1].textContent = `⏱️ ${conf.cooldown}s CD`;
        }
      }

      // Elemento indicador de candado
      let lockBanner = card.querySelector(".god-card-lock-banner");
      if (!lockBanner) {
        lockBanner = document.createElement("div");
        lockBanner.className = "god-card-lock-banner";
        card.insertBefore(lockBanner, card.firstChild);
      }

      if (!isUnlocked) {
        card.classList.add("power-card-locked");
        card.classList.remove("equipped");
        lockBanner.classList.remove("hidden");
        const remaining = Math.max(1, reqGames - gamesPlayed);
        lockBanner.innerHTML = `🔒 <span>Requiere ${reqGames} partidas</span> <small>(${gamesPlayed}/${reqGames})</small>`;

        if (btn) {
          btn.disabled = true;
          btn.textContent = `🔒 BLOQUEADO`;
          btn.classList.add("btn-locked");
          btn.classList.remove("is-equipped");
        }
      } else {
        card.classList.remove("power-card-locked");
        lockBanner.classList.add("hidden");

        if (btn) {
          btn.disabled = false;
          btn.classList.remove("btn-locked");
          if (pId === equippedPowerId) {
            card.classList.add("equipped");
            btn.textContent = "✓ EQUIPADO";
            btn.classList.add("is-equipped");
          } else {
            card.classList.remove("equipped");
            btn.textContent = "EQUIPAR";
            btn.classList.remove("is-equipped");
          }
        }
      }
    });

    if (this.powersEquippedStatusText) {
      const names = {
        HERA: "🦚 Hera (Cólera Celestial)",
        ARTEMISA: "🦁 Hércules (Fuerza & Vulnerabilidad)",
        DEMETER: "🌿 Deméter (Zarzas)",
        HERMES: "🪽 Hermes (Oro Global +50%)",
        CRONOS: "⏳ Cronos (Cadencia Global +50%)"
      };
      if (!equippedPowerId) {
        this.powersEquippedStatusText.textContent = isSandbox ? "Ninguna (Selecciona una bendición)" : "Ninguna (Desbloquea a Hera a las 5 partidas)";
      } else {
        this.powersEquippedStatusText.textContent = names[equippedPowerId] || `✨ ${equippedPowerId}`;
      }
    }
  }

  updateAltarPowers(equippedPowerId, unlockedPowers = [], gamesPlayed = 0, isSandbox = false) {
    this.updatePowersScreenCards(equippedPowerId, unlockedPowers, gamesPlayed, isSandbox);
  }

  updateMenuEquippedPower(powerConfig, isSandbox = false) {
    const iconEl = document.getElementById("menu-skill-icon");
    const descEl = document.getElementById("menu-skill-desc");
    if (!powerConfig) {
      if (iconEl) iconEl.textContent = isSandbox ? "⚡" : "🔒";
      if (descEl) descEl.textContent = isSandbox ? "Sin bendición (Elige una)" : "Sin bendición (5 partidas)";
      return;
    }
    if (iconEl) iconEl.textContent = powerConfig.icon;
    if (descEl) descEl.textContent = `${powerConfig.god} (Equipado)`;
  }

  updatePowerHud(powerConfig, cooldownRemaining, currentGold, isTargeting, isWaitingWave, activeEffectRemaining = 0) {
    if (!this.btnCastPower) return;
    if (!powerConfig) {
      if (this.hudPowerIcon) this.hudPowerIcon.textContent = "🔒";
      if (this.hudPowerName) this.hudPowerName.textContent = "Bloqueado";
      if (this.hudPowerCost) this.hudPowerCost.textContent = "-";
      if (this.hudPowerCooldown) this.hudPowerCooldown.classList.add("hidden");
      this.btnCastPower.classList.remove("ready-to-cast", "power-currently-active", "targeting-active");
      this.btnCastPower.classList.add("cannot-afford");
      return;
    }
    if (this.hudPowerIcon) this.hudPowerIcon.textContent = powerConfig.icon;
    if (this.hudPowerName) this.hudPowerName.textContent = powerConfig.god;
    if (this.hudPowerCost) this.hudPowerCost.textContent = `🪙 ${powerConfig.goldCost}`;

    if (activeEffectRemaining > 0) {
      // 1. Efecto divino activo (el cooldown no ha empezado todavía)
      if (this.hudPowerCooldown) {
        this.hudPowerCooldown.classList.remove("hidden");
        this.hudPowerCooldown.classList.add("is-active-effect");
      }
      if (this.hudCooldownText) {
        this.hudCooldownText.textContent = `⚡ ${Math.ceil(activeEffectRemaining)}s`;
      }
      this.btnCastPower.classList.remove("ready-to-cast");
      this.btnCastPower.classList.add("power-currently-active");
    } else if (cooldownRemaining > 0) {
      // 2. Efecto terminado: el contador de cooldown está corriendo
      if (this.hudPowerCooldown) {
        this.hudPowerCooldown.classList.remove("hidden");
        this.hudPowerCooldown.classList.remove("is-active-effect");
      }
      if (this.hudCooldownText) {
        this.hudCooldownText.textContent = `${Math.ceil(cooldownRemaining)}s${isWaitingWave ? ' ⏸️' : ''}`;
      }
      this.btnCastPower.classList.remove("ready-to-cast");
      this.btnCastPower.classList.remove("power-currently-active");
    } else {
      // 3. Listo para invocar
      if (this.hudPowerCooldown) {
        this.hudPowerCooldown.classList.add("hidden");
        this.hudPowerCooldown.classList.remove("is-active-effect");
      }
      this.btnCastPower.classList.remove("power-currently-active");
      if (currentGold >= powerConfig.goldCost) {
        this.btnCastPower.classList.add("ready-to-cast");
      } else {
        this.btnCastPower.classList.remove("ready-to-cast");
      }
    }

    if (currentGold < powerConfig.goldCost) {
      this.btnCastPower.classList.add("cannot-afford");
    } else {
      this.btnCastPower.classList.remove("cannot-afford");
    }

    if (isTargeting) {
      this.btnCastPower.classList.add("targeting-active");
    } else {
      this.btnCastPower.classList.remove("targeting-active");
    }
  }

  openStats(progressData) {
    if (progressData) {
      this.updateStatsModal(progressData);
    }
    if (this.mainMenuModal) {
      this.mainMenuModal.classList.add("hidden");
    }
    this.statsModal.classList.remove("hidden");
  }

  closeStats(returnToMenu = true) {
    this.statsModal.classList.add("hidden");
    if (returnToMenu && this.mainMenuModal) {
      this.mainMenuModal.classList.remove("hidden");
    }
  }

  updateStatsModal(progressData) {
    if (!progressData) return;
    this.stGamesCount.textContent = progressData.gamesPlayed || 0;
    this.stHighestWave.textContent = progressData.highestWave || 0;
    this.stEnemiesKilled.textContent = progressData.totalEnemiesKilled || 0;
    
    if (progressData.tutorialCompleted) {
      this.stTutorialStatus.textContent = "Completado ✓";
      this.stTutorialStatus.style.color = "#86efac";
    } else {
      this.stTutorialStatus.textContent = "Pendiente";
      this.stTutorialStatus.style.color = "#38bdf8";
    }

    const unlocked = progressData.unlockedPowers || [];
    const games = progressData.gamesPlayed || 0;
    if (unlocked.length >= 5) {
      this.stPowersDesc.innerHTML = `<span style="color:#86efac;font-weight:700;">¡TODOS LOS PODERES DESBLOQUEADOS!</span> Has obtenido el favor de los 5 dioses del Olimpo.`;
    } else {
      let nextReq = 5;
      let nextGod = "Hera";
      if (!unlocked.includes("HERA")) { nextReq = 5; nextGod = "Hera"; }
      else if (!unlocked.includes("ARTEMISA")) { nextReq = 15; nextGod = "Artemisa"; }
      else if (!unlocked.includes("DEMETER")) { nextReq = 25; nextGod = "Deméter"; }
      else if (!unlocked.includes("HERMES")) { nextReq = 35; nextGod = "Hermes"; }
      else if (!unlocked.includes("CRONOS")) { nextReq = 45; nextGod = "Cronos"; }
      const remaining = Math.max(1, nextReq - games);
      this.stPowersDesc.innerHTML = `Siguiente bendición divina: <span style="color:#fde047;font-weight:700;">${nextGod}</span>. Faltan <span style="color:#38bdf8;font-weight:700;">${remaining} partida(s)</span> (${games}/${nextReq}).`;
    }
  }

  showAthenaTutorialStep(stepBadge, text, btnText, onNext, onSkip) {
    if (this.athenaTimer) clearTimeout(this.athenaTimer);
    
    this.athenaBadge.textContent = stepBadge;
    this.athenaBadge.classList.remove("hidden");
    
    this.athenaText.textContent = text;
    this.athenaNextBtn.textContent = btnText;
    this.athenaActions.classList.remove("hidden");
    
    this.athenaNextHandler = onNext;
    this.athenaSkipHandler = onSkip;
    
    this.athenaBanner.classList.remove("hidden");
  }

  hideAthenaBanner() {
    if (this.athenaTimer) clearTimeout(this.athenaTimer);
    this.athenaBanner.classList.add("hidden");
    this.athenaBadge.classList.add("hidden");
    this.athenaActions.classList.add("hidden");
    this.athenaNextHandler = null;
    this.athenaSkipHandler = null;
  }

  showAthenaMessage(message, duration = 4000) {
    if (this.athenaTimer) clearTimeout(this.athenaTimer);
    this.athenaBadge.classList.add("hidden");
    this.athenaActions.classList.add("hidden");
    this.athenaText.textContent = message;
    this.athenaBanner.classList.remove("hidden");
    
    this.athenaTimer = setTimeout(() => {
      this.athenaBanner.classList.add("hidden");
    }, duration);
  }
}

