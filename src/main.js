/**
 * main.js - Orquestador y loop principal de Gigantomaquia: Tower Defense Mitológico.
 * Coordina Grid, Renderer, WaveManager, EconomyManager, Tower, Enemy, UI y Persistencia.
 */

import { BALANCE } from './config/balance.js';
import { MAPS } from './config/mapsData.js';
import { TOWERS } from './config/towersData.js';
import { Grid } from './core/Grid.js';
import { Renderer } from './render/Renderer.js';
import { ParticleSystem } from './render/ParticleSystem.js';
import { EconomyManager } from './systems/EconomyManager.js';
import { WaveManager } from './systems/WaveManager.js';
import { ProgressManager } from './systems/ProgressManager.js';
import { Vector2 } from './core/Vector2.js';
import { Tower } from './entities/Tower.js';
import { UIManager } from './ui/UIManager.js?v=1.1.0';
import { TutorialManager } from './systems/TutorialManager.js';
import { PowerManager } from './systems/PowerManager.js';
import { POWERS_DATA } from './config/powersData.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.grid = new Grid(MAPS.TEST_MAP);
    this.renderer = new Renderer(this.canvas);
    this.particles = new ParticleSystem();
    this.economy = new EconomyManager();
    this.progress = new ProgressManager();
    this.powerManager = new PowerManager(this.economy, this.progress, this.particles);

    const savedMode = localStorage.getItem("gigantomaquia_game_mode") || "NORMAL";
    this.gameMode = savedMode === "SANDBOX" ? "SANDBOX" : "NORMAL";

    this.gameState = "MENU"; // "MENU" | "PLAYING"
    this.towersList = [];
    this.projectilesList = [];
    this.roadBombsList = []; // Minas terrestres sembradas en el camino por Ares
    
    this.selectedTowerType = null;
    this.inspectedTower = null;
    this.mouseGridPos = { col: -1, row: -1 };
    this.isMouseOnCanvas = false;

    // Estado para soportar tanto clic simple como arrastrar y soltar (Drag & Drop)
    this.dragState = {
      isPointerDown: false,
      isDragging: false,
      wasDragging: false,
      towerType: null,
      startX: 0,
      startY: 0
    };

    // Seguimiento unificado para toques en pantallas táctiles (iOS/Android) y clics
    this.canvasPointerDownInfo = null;
    this.lastCanvasTapTime = 0;

    this.gameSpeed = 1;
    this.isPaused = false;
    this.isGameOver = false;

    this.lastTime = performance.now();

    // Gestor de Oleadas
    this.waveManager = new WaveManager(
      this.grid,
      (wave, reward, leakedCount) => this.onWaveCompleted(wave, reward, leakedCount),
      (earlyBonus) => this.onEarlyCallBonus(earlyBonus)
    );

    // Gestor de Interfaz de Usuario
    this.ui = new UIManager({
      onSelectGameMode: (mode) => {
        this.setGameMode(mode);
      },
      onStartGame: () => {
        this.ui.setMenuGuidedPlay(false);
        // Si es la primera vez que juega en modo historia y no ha completado el tutorial, Atenea lo guía
        if (this.gameMode === "NORMAL" && this.progress.getGamesPlayed() === 0 && !this.progress.isTutorialCompleted()) {
          this.startBattle(true);
        } else {
          this.startBattle(false);
        }
      },
      onStartTutorial: () => {
        this.ui.setMenuGuidedPlay(false);
        this.startBattle(true);
      },
      onOpenLore: () => {
        this.ui.openLore();
      },
      onCloseLore: () => {
        this.handleLoreClosed();
      },
      onOpenStats: () => {
        this.ui.openStats(this.progress.data);
      },
      onResetProgress: () => {
        this.progress.resetProgress();
        this.powerManager.reset();
        const isSandbox = this.gameMode === "SANDBOX";
        if (isSandbox && !this.powerManager.equippedPowerId) {
          this.powerManager.setEquippedPower("DEMETER", true);
        }
        this.ui.updateStatsModal(this.progress.data);
        this.ui.updateMenuStats(this.progress.data);
        this.ui.updateMenuEquippedPower(this.powerManager.getEquippedPowerConfig(), isSandbox);
        this.ui.updateAltarPowers(
          this.powerManager.equippedPowerId,
          isSandbox ? ["HERA", "ARTEMISA", "DEMETER", "HERMES", "CRONOS"] : this.progress.getUnlockedPowers(),
          isSandbox ? 999 : this.progress.getGamesPlayed(),
          isSandbox
        );
        this.ui.updatePowerHud(
          this.powerManager.getEquippedPowerConfig(),
          this.powerManager.cooldownRemaining,
          this.economy.gold,
          this.powerManager.isTargeting,
          this.waveManager.isWaitingNextWave,
          this.powerManager.activeEffectRemaining
        );
        this.ui.setMenuGuidedPlay(false);
        this.ui.showAthenaMessage("Progreso reiniciado. ¡Un nuevo comienzo para el Olimpo!");
      },
      onExitMenu: () => {
        this.exitToMenu();
      },
      onOpenCodex: () => {
        const isSandbox = this.gameMode === "SANDBOX";
        this.ui.openPowersScreen(
          this.powerManager.equippedPowerId,
          isSandbox ? ["HERA", "ARTEMISA", "DEMETER", "HERMES", "CRONOS"] : this.progress.getUnlockedPowers(),
          isSandbox ? 999 : this.progress.getGamesPlayed(),
          isSandbox
        );
      },
      onEquipPower: (powerId) => {
        const isSandbox = this.gameMode === "SANDBOX";
        if (!isSandbox && !this.progress.isPowerUnlocked(powerId)) {
          const conf = POWERS_DATA[powerId];
          const remaining = Math.max(1, (conf ? conf.unlockGames : 0) - this.progress.getGamesPlayed());
          this.ui.showAthenaMessage(`🔒 ${conf ? conf.god : powerId} está bloqueado. Requiere ${conf ? conf.unlockGames : 0} partidas jugadas (faltan ${remaining}).`, 3500);
          return;
        }
        this.powerManager.setEquippedPower(powerId, isSandbox);
        this.ui.updatePowersScreenCards(
          powerId,
          isSandbox ? ["HERA", "ARTEMISA", "DEMETER", "HERMES", "CRONOS"] : this.progress.getUnlockedPowers(),
          isSandbox ? 999 : this.progress.getGamesPlayed(),
          isSandbox
        );
        const conf = this.powerManager.getEquippedPowerConfig();
        this.ui.updateMenuEquippedPower(conf, isSandbox);
        this.ui.updatePowerHud(
          conf,
          this.powerManager.cooldownRemaining,
          this.economy.gold,
          this.powerManager.isTargeting,
          this.waveManager.isWaitingNextWave,
          this.powerManager.activeEffectRemaining
        );
        this.ui.showAthenaMessage(`¡Has bendecido tus defensas con ${conf.god}! "${conf.quote}"`, 3500);
      },
      onCastPower: () => {
        if (this.gameState !== "PLAYING" || this.isPaused || this.isGameOver) return;
        if (this.powerManager && this.powerManager.isTargeting) {
          this.powerManager.cancelCast();
          return;
        }
        const res = this.powerManager.startCast();
        if (!res.success) {
          this.ui.showAthenaMessage(res.reason, 2500);
        } else if (res.mode === "GLOBAL") {
          const conf = this.powerManager.getEquippedPowerConfig();
          this.ui.showAthenaMessage(`¡Invocaste ${conf.name}! "${conf.quote}"`, 3500);
        } else {
          const conf = this.powerManager.getEquippedPowerConfig();
          this.ui.showAthenaMessage(`Apunta y haz clic en el mapa para invocar ${conf.name}. [ESC para cancelar]`, 3000);
        }
      },
      onRenderMenuMap: () => {
        const previewCanvas = document.getElementById("menu-map-preview");
        if (previewCanvas && this.renderer) {
          this.renderer.renderMapPreview(previewCanvas, this.grid);
        }
      },
      onTowerCardPointerDown: (type, e) => this.handleCardPointerDown(type, e),
      onTowerCardClick: (type, e) => this.handleCardClick(type, e),
      onSelectTowerType: (type) => {
        this.selectedTowerType = type;
        if (type) {
          this.inspectedTower = null;
        }
      },
      onTriggerWave: () => {
        if (this.gameState === "MENU" || this.isPaused || this.isGameOver) return;
        if (!this.waveManager.canTriggerNextWave()) return;
        const wasActive = this.waveManager.isWaveActive;
        const triggered = this.waveManager.triggerNextWave();
        if (triggered) {
          const msg = wasActive
            ? `⚔️ ¡Oleada ${this.waveManager.currentWave} adelantada!`
            : `🛡️ ¡Oleada ${this.waveManager.currentWave} en camino!`;
          this.ui.showAthenaMessage(msg, 2000);

          if (this.tutorial && this.tutorial.isActive) {
            this.tutorial.onWaveStarted(this.waveManager.currentWave);
          }
        }
      },
      onUpgradeTower: (tower) => {
        if (this.gameState === "MENU" || this.isPaused || this.isGameOver) return;
        this.upgradeTower(tower);
      },
      onEvolveTower: (tower, branchChoice) => {
        if (this.gameState === "MENU" || this.isPaused || this.isGameOver) return;
        this.evolveTower(tower, branchChoice);
      },
      onSellTower: (tower) => {
        if (this.gameState === "MENU" || this.isPaused || this.isGameOver) return;
        this.sellTower(tower);
      },
      onDeselectTower: () => {
        this.inspectedTower = null;
      },
      onInspectorClosed: () => {
        if (this.tutorial && this.tutorial.isActive) {
          this.tutorial.onInspectorClosed();
        }
      },
      onToggleSpeed: () => {
        if (this.gameSpeed === 1) {
          this.gameSpeed = 2;
        } else if (this.gameSpeed === 2) {
          this.gameSpeed = 3;
        } else if (this.gameSpeed === 3) {
          this.gameSpeed = 5;
        } else {
          this.gameSpeed = 1;
        }
        return this.gameSpeed;
      },
      onOpenPause: () => {
        if (this.gameState === "MENU") return;
        this.isPaused = true;
        this.ui.openPauseModal();
      },
      onResumeGame: () => {
        this.isPaused = false;
        this.ui.closePauseModal();
      },
      onAddTestGold: (amount) => {
        if (this.gameMode !== "SANDBOX") return;
        this.economy.addGold(amount);
        this.ui.updateHUD(this.economy, this.waveManager);
        this.ui.showAthenaMessage(`¡Tesoro de prueba! +${amount.toLocaleString()} 🪙 concedidos.`, 2500);
      },
      onRestartGame: () => {
        if (this.tutorial && this.tutorial.isActive) {
          this.startBattle(true);
        } else {
          this.startBattle(false);
        }
      }
    });

    // Gestor del Tutorial guiado de Atenea (Etapa 6)
    this.tutorial = new TutorialManager(this.ui, this.progress);

    this.initCanvasInput();

    // Sincronizar estado inicial del modo de juego
    this.ui.setGameMode(this.gameMode);
    const isSandboxInit = this.gameMode === "SANDBOX";
    if (isSandboxInit) {
      if (!this.powerManager.equippedPowerId) {
        this.powerManager.setEquippedPower("DEMETER", true);
      }
    } else {
      if (!this.progress.isPowerUnlocked(this.powerManager.equippedPowerId)) {
        this.powerManager.setEquippedPower(null, false);
      }
    }

    // Mostrar Pantalla de Inicio / Menú Principal en el arranque
    this.ui.openMainMenu(this.progress.data);
    this.ui.updateMenuEquippedPower(this.powerManager.getEquippedPowerConfig(), isSandboxInit);
    this.ui.updateAltarPowers(
      this.powerManager.equippedPowerId,
      isSandboxInit ? ["HERA", "ARTEMISA", "DEMETER", "HERMES", "CRONOS"] : this.progress.getUnlockedPowers(),
      isSandboxInit ? 999 : this.progress.getGamesPlayed(),
      isSandboxInit
    );
    this.ui.updatePowerHud(
      this.powerManager.getEquippedPowerConfig(),
      this.powerManager.cooldownRemaining,
      this.economy.gold,
      this.powerManager.isTargeting,
      this.waveManager.isWaitingNextWave,
      this.powerManager.activeEffectRemaining
    );

    // Mostrar Lore en la pantalla inicial solo una vez
    if (!this.progress.isLoreSeen()) {
      this.ui.openLore();
    }

    // Iniciar bucle de juego
    requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * Se ejecuta cuando el jugador cierra el modal del Lore.
   * Opaca el menú y señala el botón de jugar para iniciar el tutorial.
   */
  handleLoreClosed() {
    this.progress.setLoreSeen(true);
    this.ui.closeLore();
    this.ui.setMenuGuidedPlay(true);
  }

  /**
   * Alterna entre Modo Historia y Modo Pruebas (Sandbox).
   */
  setGameMode(mode) {
    this.gameMode = mode === "SANDBOX" ? "SANDBOX" : "NORMAL";
    try {
      localStorage.setItem("gigantomaquia_game_mode", this.gameMode);
    } catch (e) {
      console.warn("No se pudo guardar modo en localStorage:", e);
    }

    const isSandbox = this.gameMode === "SANDBOX";

    if (isSandbox) {
      // En modo Sandbox, si no hay poder equipado, equipar Deméter
      if (!this.powerManager.equippedPowerId) {
        this.powerManager.setEquippedPower("DEMETER", true);
      }
    } else {
      // En modo Historia, si el poder equipado no está desbloqueado legítimamente, desequiparlo
      if (!this.progress.isPowerUnlocked(this.powerManager.equippedPowerId)) {
        this.powerManager.setEquippedPower(null, false);
      }
    }

    this.ui.setGameMode(this.gameMode);
    const conf = this.powerManager.getEquippedPowerConfig();
    this.ui.updateMenuEquippedPower(conf, isSandbox);
    this.ui.updateAltarPowers(
      this.powerManager.equippedPowerId,
      isSandbox ? ["HERA", "ARTEMISA", "DEMETER", "HERMES", "CRONOS"] : this.progress.getUnlockedPowers(),
      isSandbox ? 999 : this.progress.getGamesPlayed(),
      isSandbox
    );
    this.ui.updatePowerHud(
      conf,
      this.powerManager.cooldownRemaining,
      this.economy.gold,
      this.powerManager.isTargeting,
      this.waveManager.isWaitingNextWave,
      this.powerManager.activeEffectRemaining
    );

    if (isSandbox) {
      this.ui.showAthenaMessage("🧪 Modo Pruebas activado: todas las bendiciones y +10,000 🪙 disponibles.", 3000);
    } else {
      this.ui.showAthenaMessage("🛡️ Modo Historia activado: progresión por mérito y batallas legítimas.", 3000);
    }
  }

  /**
   * Inicia la batalla en el Monte Olimpo (en modo normal o tutorial interactivo).
   */
  startBattle(isTutorial = false) {
    this.gameState = "PLAYING";
    this.ui.closeMainMenu();
    this.ui.closeLore();
    this.ui.closePowersScreen(false);
    this.ui.setMenuGuidedPlay(false);
    this.restartGame();

    // Asegurar visibilidad correcta del botón de oro según el modo de juego
    this.ui.showTestGoldButton(this.gameMode === "SANDBOX");

    if (isTutorial) {
      this.tutorial.start(this);
    } else {
      this.tutorial.isActive = false;
      this.ui.clearTutorialLocks();
      this.ui.clearSpotlight();
      this.ui.hideAthenaBanner();
      const modeText = this.gameMode === "SANDBOX" ? " (Modo Pruebas)" : "";
      this.ui.showAthenaMessage(`¡A la batalla${modeText}! Coloca tus torres olímpicas y llama la primera oleada.`);
    }
  }

  /**
   * Sale limpiamente al Menú Principal.
   */
  exitToMenu() {
    this.gameState = "MENU";
    this.isPaused = false;
    this.isGameOver = false;
    if (this.tutorial) {
      this.tutorial.isActive = false;
    }
    this.ui.clearTutorialLocks();
    this.ui.clearSpotlight();
    this.ui.setMenuGuidedPlay(false);
    this.ui.hideAthenaBanner();
    this.ui.closePauseModal();
    this.restartGame();
    this.ui.setGameMode(this.gameMode);
    const isSandbox = this.gameMode === "SANDBOX";
    this.ui.openMainMenu(this.progress.data);
    this.ui.updateMenuEquippedPower(this.powerManager.getEquippedPowerConfig(), isSandbox);
    this.ui.updateAltarPowers(
      this.powerManager.equippedPowerId,
      isSandbox ? ["HERA", "ARTEMISA", "DEMETER", "HERMES", "CRONOS"] : this.progress.getUnlockedPowers(),
      isSandbox ? 999 : this.progress.getGamesPlayed(),
      isSandbox
    );
  }

  handleCardPointerDown(type, e) {
    if (this.gameState === "MENU" || this.isPaused || this.isGameOver) return;
    if (this.tutorial && this.tutorial.isActive) {
      if (!this.tutorial.isTowerTypeAllowed(type)) {
        return;
      }
    }

    const config = TOWERS[type];
    if (!config) return;

    // Solo preparamos el dragState para detectar si el usuario arrastra
    this.dragState = {
      isPointerDown: true,
      isDragging: false,
      wasDragging: false,
      towerType: type,
      startX: e.clientX,
      startY: e.clientY
    };
  }

  handleCardClick(type, e) {
    if (this.gameState === "MENU" || this.isPaused || this.isGameOver) return;
    if (this.tutorial && this.tutorial.isActive) {
      if (!this.tutorial.isTowerTypeAllowed(type)) {
        return;
      }
    }

    // Si fue producto de un arrastre terminado, ignorar el evento click subsiguiente
    if (this.dragState.wasDragging) {
      this.dragState.wasDragging = false;
      return;
    }

    // Si ya estaba seleccionada esa torre con clic simple, deseleccionar (toggle)
    if (this.selectedTowerType === type) {
      this.ui.clearTowerSelection();
      this.selectedTowerType = null;
      return;
    }

    // Clic simple para seleccionar y colocar en el canvas
    const config = TOWERS[type];
    if (config) {
      if (!this.economy.canAfford(config.cost)) {
        this.particles.addFloatingText(this.grid.gridToPixelCenter(0, 2), "¡Oro insuficiente!", "#ef4444");
        return;
      }
      this.selectedTowerType = type;
      this.inspectedTower = null;
      this.ui.closeInspector();
      this.ui.selectTowerType(type);
    }
  }

  getCanvasRenderBounds() {
    const rect = this.canvas.getBoundingClientRect();
    const intrinsicRatio = this.canvas.width / this.canvas.height;
    const elementRatio = rect.width / rect.height;

    let renderWidth = rect.width;
    let renderHeight = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (elementRatio > intrinsicRatio) {
      renderWidth = rect.height * intrinsicRatio;
      offsetX = (rect.width - renderWidth) / 2;
    } else if (elementRatio < intrinsicRatio) {
      renderHeight = rect.width / intrinsicRatio;
      offsetY = (rect.height - renderHeight) / 2;
    }

    return {
      left: rect.left + offsetX,
      top: rect.top + offsetY,
      width: renderWidth,
      height: renderHeight,
      offsetX,
      offsetY,
      rawRect: rect
    };
  }

  clientToCanvasCoords(clientX, clientY) {
    const bounds = this.getCanvasRenderBounds();
    const isInside = (
      clientX >= bounds.left && clientX <= bounds.left + bounds.width &&
      clientY >= bounds.top && clientY <= bounds.top + bounds.height
    );

    const scaleX = this.canvas.width / bounds.width;
    const scaleY = this.canvas.height / bounds.height;
    const x = (clientX - bounds.left) * scaleX;
    const y = (clientY - bounds.top) * scaleY;

    return { x, y, isInside, bounds };
  }

  initCanvasInput() {
    // 1. Movimiento global para soportar arrastre y vista previa
    window.addEventListener('pointermove', (e) => {
      if (this.gameState === "MENU") {
        this.isMouseOnCanvas = false;
        return;
      }

      if (this.dragState.isPointerDown) {
        const dist = Math.hypot(e.clientX - this.dragState.startX, e.clientY - this.dragState.startY);
        if (dist > 8) {
          this.dragState.isDragging = true;
          if (this.selectedTowerType !== this.dragState.towerType) {
            this.selectedTowerType = this.dragState.towerType;
            this.inspectedTower = null;
            this.ui.closeInspector();
            this.ui.selectTowerType(this.dragState.towerType);
          }
        }
      }

      const { x, y, isInside } = this.clientToCanvasCoords(e.clientX, e.clientY);
      if (isInside) {
        this.mouseGridPos = this.grid.pixelToGrid(x, y);
        this.isMouseOnCanvas = true;

        if (this.powerManager && this.powerManager.isTargeting) {
          const clampedX = Math.max(20, Math.min(this.canvas.width - 20, x));
          const clampedY = Math.max(20, Math.min(this.canvas.height - 20, y));
          this.powerManager.updateMousePos(clampedX, clampedY);
          this.canvas.style.cursor = "crosshair";
        } else if (this.selectedTowerType) {
          this.canvas.style.cursor = "crosshair";
        } else {
          const hoveredTower = this.grid.getTowerAt(this.mouseGridPos.col, this.mouseGridPos.row);
          this.canvas.style.cursor = hoveredTower ? "pointer" : "default";
        }
      } else {
        this.isMouseOnCanvas = false;
        // Si estamos apuntando y el puntero se mueve ligeramente afuera, mantener actualizado en los bordes
        if (this.powerManager && this.powerManager.isTargeting) {
          const clampedX = Math.max(20, Math.min(this.canvas.width - 20, x));
          const clampedY = Math.max(20, Math.min(this.canvas.height - 20, y));
          this.powerManager.updateMousePos(clampedX, clampedY);
        }
      }
    });

    // 2. Soltar puntero global (colocar si venía de arrastre)
    window.addEventListener('pointerup', (e) => {
      if (this.gameState === "MENU") {
        this.dragState.isPointerDown = false;
        this.dragState.isDragging = false;
        return;
      }

      if (this.dragState.isPointerDown) {
        const wasDragging = this.dragState.isDragging;
        this.dragState.wasDragging = wasDragging;
        this.dragState.isPointerDown = false;
        this.dragState.isDragging = false;

        if (wasDragging) {
          const { x, y, isInside } = this.clientToCanvasCoords(e.clientX, e.clientY);
          if (isInside) {
            const gridPos = this.grid.pixelToGrid(x, y);
            this.mouseGridPos = gridPos;
            this.tryBuildTower(this.dragState.towerType, gridPos.col, gridPos.row);
          }
          // Siempre deseleccionar tras un arrastre
          this.ui.clearTowerSelection();
          this.selectedTowerType = null;
        }
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isMouseOnCanvas = false;
    });

    // Notificación pasiva para iOS WebKit para activar interactividad táctil
    this.canvas.addEventListener('touchstart', () => {}, { passive: true });

    // 2.5. Pulsación directa en canvas para registrar coordenadas y lanzamiento de habilidad
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.gameState === "MENU" || this.isPaused || this.isGameOver) return;

      this.canvasPointerDownInfo = {
        clientX: e.clientX,
        clientY: e.clientY,
        time: performance.now(),
        button: e.button
      };

      const { x, y, isInside } = this.clientToCanvasCoords(e.clientX, e.clientY);
      if (isInside) {
        this.mouseGridPos = this.grid.pixelToGrid(x, y);
        this.isMouseOnCanvas = true;
      }

      if (this.powerManager && this.powerManager.isTargeting) {
        if (e.button === 0) { // Clic izquierdo: desatar habilidad
          if (isInside) {
            const executed = this.powerManager.executeZoneCast(x, y, this.waveManager.activeEnemies, this.towersList);
            if (executed) {
              const conf = this.powerManager.getEquippedPowerConfig();
              this.ui.showAthenaMessage(`¡Invocaste ${conf.name}! "${conf.quote}"`, 3000);
            }
          }
          e.preventDefault();
          e.stopPropagation();
          return;
        } else if (e.button === 2) { // Clic derecho: cancelar
          this.powerManager.cancelCast();
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
    });

    // 2.7. Soltar pulsación en canvas (pointerup): Crucial para iOS y dispositivos táctiles
    // En iOS Safari, los canvas con touch-action: none suprimen el evento 'click'.
    // Usar pointerup garantiza respuesta inmediata al toque sin depender del click sintético de WebKit.
    this.canvas.addEventListener('pointerup', (e) => {
      if (this.gameState === "MENU" || this.isPaused || this.isGameOver) return;
      if (!this.canvasPointerDownInfo) return;

      const dx = e.clientX - this.canvasPointerDownInfo.clientX;
      const dy = e.clientY - this.canvasPointerDownInfo.clientY;
      const dist = Math.hypot(dx, dy);
      const elapsed = performance.now() - this.canvasPointerDownInfo.time;
      const isPrimary = this.canvasPointerDownInfo.button === 0;
      this.canvasPointerDownInfo = null;

      // Si fue un toque o clic (< 14px de movimiento y < 600ms) sin arrastre de tarjeta
      if (dist < 14 && elapsed < 600 && isPrimary && !this.dragState.isDragging && !this.dragState.wasDragging) {
        this.lastCanvasTapTime = performance.now();
        this.handleCanvasTap(e.clientX, e.clientY);
      }
    });

    // 3. Clic directo en el canvas (respaldo para desktop)
    this.canvas.addEventListener('click', (e) => {
      if (this.gameState === "MENU" || this.isPaused || this.isGameOver) return;
      // Prevenir doble ejecución si ya se procesó de inmediato por pointerup
      if (performance.now() - this.lastCanvasTapTime < 400) {
        return;
      }
      this.lastCanvasTapTime = performance.now();
      this.handleCanvasTap(e.clientX, e.clientY);
    });

    // 4. Cancelar selección o apuntado con clic derecho o tecla Escape
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.gameState === "MENU") return;
      if (this.powerManager && this.powerManager.isTargeting) {
        this.powerManager.cancelCast();
        return;
      }
      this.ui.clearTowerSelection();
      this.selectedTowerType = null;
      this.ui.closeInspector();
    });

    window.addEventListener('keydown', (e) => {
      if (this.gameState === "MENU") return;

      // Tecla [Q] para invocar habilidad divina equipada
      if (e.code === "KeyQ") {
        if (!this.isPaused && !this.isGameOver) {
          if (this.powerManager && this.powerManager.isTargeting) {
            this.powerManager.cancelCast();
            return;
          }
          const res = this.powerManager.startCast();
          if (!res.success) {
            this.ui.showAthenaMessage(res.reason, 2500);
          } else if (res.mode === "GLOBAL") {
            const conf = this.powerManager.getEquippedPowerConfig();
            this.ui.showAthenaMessage(`¡Invocaste ${conf.name}! "${conf.quote}"`, 3500);
          } else {
            const conf = this.powerManager.getEquippedPowerConfig();
            this.ui.showAthenaMessage(`Apunta y haz clic en el mapa para invocar ${conf.name}. [ESC para cancelar]`, 3000);
          }
        }
        return;
      }

      if (e.key === "Escape") {
        if (this.powerManager && this.powerManager.isTargeting) {
          this.powerManager.cancelCast();
          return;
        }
        if (this.tutorial && this.tutorial.isActive) {
          // Durante el tutorial bloquear la pausa por Escape para no saltar el flujo guiado
          if (this.selectedTowerType) {
            this.ui.clearTowerSelection();
            this.selectedTowerType = null;
          } else if (this.inspectedTower) {
            this.ui.closeInspector();
            this.inspectedTower = null;
          }
          return;
        }

        if (this.isPaused) {
          this.isPaused = false;
          this.ui.closePauseModal();
        } else if (this.selectedTowerType) {
          this.ui.clearTowerSelection();
          this.selectedTowerType = null;
        } else if (this.inspectedTower) {
          this.ui.closeInspector();
          this.inspectedTower = null;
        } else if (!this.isGameOver) {
          this.isPaused = true;
          this.ui.openPauseModal();
        }
      }
    });
  }

  handleCanvasTap(clientX, clientY) {
    if (this.gameState === "MENU" || this.isPaused || this.isGameOver) return;

    const { x, y, isInside } = this.clientToCanvasCoords(clientX, clientY);
    if (!isInside) return;

    // Actualizar SIEMPRE mouseGridPos con las coordenadas exactas de este toque/clic
    this.mouseGridPos = this.grid.pixelToGrid(x, y);
    this.isMouseOnCanvas = true;

    // 1. Lanzamiento de habilidad de zona si todavía estamos en modo apuntado
    if (this.powerManager && this.powerManager.isTargeting) {
      const executed = this.powerManager.executeZoneCast(x, y, this.waveManager.activeEnemies, this.towersList);
      if (executed) {
        const conf = this.powerManager.getEquippedPowerConfig();
        this.ui.showAthenaMessage(`¡Invocaste ${conf.name}! "${conf.quote}"`, 3000);
      }
      return;
    }

    if (this.dragState.wasDragging) {
      this.dragState.wasDragging = false;
      return;
    }

    const { col, row } = this.mouseGridPos;
    if (col < 0 || col >= this.grid.cols || row < 0 || row >= this.grid.rows) return;

    // A) Colocar torre si hay un tipo seleccionado
    if (this.selectedTowerType) {
      const built = this.tryBuildTower(this.selectedTowerType, col, row);
      if (built) {
        // Deseleccionar SIEMPRE inmediatamente tras colocar una torre
        this.ui.clearTowerSelection();
        this.selectedTowerType = null;
      }
      return;
    }

    // B) Seleccionar torre existente para inspeccionar
    // Prioridad 1: Torre ubicada en la celda matricial exacta pulsada
    let existingTower = this.grid.getTowerAt(col, row);

    // Prioridad 2: Búsqueda de la torre más cercana dentro de un radio de tolerancia táctil (44px)
    if (!existingTower) {
      const touchTolerance = 44;
      let closestDist = Infinity;
      for (const t of this.towersList) {
        const d = Math.hypot(x - t.pos.x, y - t.pos.y);
        if (d <= touchTolerance && d < closestDist) {
          closestDist = d;
          existingTower = t;
        }
      }
    }

    if (existingTower) {
      if (this.tutorial && this.tutorial.isActive) {
        if (!this.tutorial.isTowerInspectionAllowed(existingTower)) {
          const hint = this.tutorial.getInspectionHint();
          this.particles.addFloatingText(existingTower.pos, hint, "#f59e0b");
          return;
        }
      }
      this.inspectedTower = existingTower;
      this.ui.openInspector(existingTower, this.economy);
      if (this.tutorial && this.tutorial.isActive) {
        this.tutorial.onTowerInspected(existingTower);
      }
    } else {
      this.inspectedTower = null;
      this.ui.closeInspector();
    }
  }

  tryBuildTower(type, col, row) {
    if (this.gameState === "MENU" || this.isPaused || this.isGameOver) return false;

    // Validación estricta durante el tutorial (solo la torre indicada en la posición indicada)
    if (this.tutorial && this.tutorial.isActive) {
      if (!this.tutorial.isPlacementAllowed(type, col, row)) {
        const hint = this.tutorial.getPlacementHint();
        this.particles.addFloatingText(this.grid.gridToPixelCenter(col, row), hint, "#f59e0b");
        return false;
      }
    }

    const config = TOWERS[type];
    if (!config) return false;

    // Verificar si es construible
    if (!this.grid.isBuildable(col, row)) {
      this.particles.addFloatingText(this.grid.gridToPixelCenter(col, row), "¡Terreno no construible!", "#ef4444");
      return false;
    }

    // Verificar si hay oro suficiente
    if (!this.economy.canAfford(config.cost)) {
      this.particles.addFloatingText(this.grid.gridToPixelCenter(col, row), "¡Oro insuficiente!", "#ef4444");
      return false;
    }

    // Construir la torre
    this.economy.spendGold(config.cost);
    const pixelCenter = this.grid.gridToPixelCenter(col, row);
    const tower = new Tower(config, col, row, pixelCenter);
    
    this.grid.setTowerAt(col, row, tower);
    this.towersList.push(tower);

    // Efecto visual
    this.particles.addHitSparks(pixelCenter, "#f59e0b", 12);
    this.particles.addFloatingText(pixelCenter, `-${config.cost} 🪙`, "#ffd166", true);

    // Deseleccionar SIEMPRE inmediatamente tras colocar la torre
    this.ui.clearTowerSelection();
    this.selectedTowerType = null;

    if (this.tutorial && this.tutorial.isActive) {
      this.tutorial.onTowerBuilt(tower);
    }
    return true;
  }

  upgradeTower(tower) {
    const cost = tower.getUpgradeCost();
    if (this.economy.spendGold(cost)) {
      tower.upgrade();
      this.particles.addHitSparks(tower.pos, "#22c55e", 15);
      this.particles.addFloatingText(tower.pos, `¡Nivel ${tower.level}!`, "#22c55e");
      this.ui.updateInspector(tower, this.economy);
      if (this.tutorial && this.tutorial.isActive) {
        this.tutorial.onTowerUpgraded(tower);
      }
    }
  }

  evolveTower(tower, branchChoice = null) {
    if (tower.form >= 3) return;
    const cost = tower.getEvolveCost();
    if (this.economy.spendGold(cost)) {
      tower.evolveForm(branchChoice);
      this.particles.addHitSparks(tower.pos, "#c084fc", 25);
      this.particles.addFloatingText(tower.pos, `¡${tower.getFormName()}!`, "#c084fc", true);
      this.ui.updateInspector(tower, this.economy);
      if (this.tutorial && this.tutorial.isActive) {
        this.tutorial.onTowerEvolved(tower);
      }
    }
  }

  sellTower(tower) {
    const refund = tower.getSellRefund();
    this.economy.addGold(refund);
    this.grid.removeTowerAt(tower.col, tower.row);

    const index = this.towersList.indexOf(tower);
    if (index !== -1) {
      this.towersList.splice(index, 1);
    }

    // Limpiar bombas en el camino pertenecientes a esta torre de Ares
    this.roadBombsList = this.roadBombsList.filter(b => b.ownerTower !== tower);

    this.particles.addHitSparks(tower.pos, "#ffd166", 10);
    this.particles.addFloatingText(tower.pos, `+${refund} 🪙`, "#ffd166", true);

    this.inspectedTower = null;
    this.ui.closeInspector();
  }

  onEarlyCallBonus(bonus) {
    if (bonus > 0) {
      this.economy.addGold(bonus);
      const entrancePixel = this.grid.gridToPixelCenter(this.grid.entranceCell.col, this.grid.entranceCell.row);
      this.particles.addFloatingText(entrancePixel, `+${bonus} Dracmas (¡Adelanto!)`, "#ffd166", true);
    }
  }

  onWaveCompleted(wave, reward, leakedCount) {
    if (this.tutorial && this.tutorial.isActive) {
      this.tutorial.onWaveCompleted(wave);
    }
    if (leakedCount === 0) {
      this.economy.addGold(reward);
      const centerPos = new Vector2(this.canvas.width / 2, 80);
      this.particles.addFloatingText(centerPos, `¡Defensa Perfecta! +${reward} 🪙`, "#ffd166", true);
    } else {
      const centerPos = new Vector2(this.canvas.width / 2, 80);
      this.particles.addFloatingText(centerPos, `¡Oleada ${wave} terminada! (${leakedCount} se filtraron)`, "#94a3b8");
    }
  }

  onEnemyReachesExit(enemy) {
    const isDefeated = this.economy.loseLife(1);
    this.particles.addFloatingText(enemy.pos, "-1 Vida 🏛️", "#ef4444");

    if (this.tutorial && this.tutorial.isActive) {
      this.tutorial.onLifeLost(this.economy.lives);
    }

    if (isDefeated && !this.isGameOver) {
      this.handleGameOver();
    }
  }

  onEnemyKilled(enemy) {
    let reward = enemy.goldReward;
    const isHermes = this.powerManager && this.powerManager.isHermesActive();
    if (isHermes) {
      reward = Math.round(reward * 1.5);
    }
    this.economy.addGold(reward);
    this.particles.addHitSparks(enemy.pos, enemy.color, 8);
    const tag = isHermes ? " 🪽" : "";
    this.particles.addFloatingText(enemy.pos, `+${reward} 🪙${tag}`, isHermes ? "#facc15" : "#ffd166", true);

    if (this.tutorial && this.tutorial.isActive) {
      this.tutorial.onEnemyKilled(enemy);
    }
  }

  handleGameOver() {
    this.isGameOver = true;
    const isSandbox = this.gameMode === "SANDBOX";

    if (!isSandbox) {
      // Modo Historia: registrar progresión legítima y desbloquear poderes
      const recordResult = this.progress.recordGameFinished(
        this.waveManager.currentWave,
        this.waveManager.totalEnemiesKilled
      );
      const totalGames = (typeof recordResult === "object" && recordResult.gamesPlayed !== undefined)
        ? recordResult.gamesPlayed
        : recordResult;

      if (this.tutorial && this.tutorial.isActive) {
        this.tutorial.onGameOver();
      }

      this.ui.showGameOver(
        this.waveManager.currentWave,
        this.economy.totalGoldEarned,
        this.waveManager.totalEnemiesKilled,
        totalGames,
        false
      );

      if (recordResult && recordResult.newlyUnlocked && recordResult.newlyUnlocked.length > 0) {
        const names = recordResult.newlyUnlocked.map(id => POWERS_DATA[id]?.god || id).join(", ");
        setTimeout(() => {
          this.ui.showAthenaMessage(`⚡ ¡HAS DESBLOQUEADO NUEVA(S) BENDICIÓN(ES): ${names}! Ya puedes equiparlas en el Menú Principal.`, 6000);
        }, 600);
      }
    } else {
      // Modo Sandbox: mostrar resultados sin alterar las estadísticas de historia
      if (this.tutorial && this.tutorial.isActive) {
        this.tutorial.onGameOver();
      }

      this.ui.showGameOver(
        this.waveManager.currentWave,
        this.economy.totalGoldEarned,
        this.waveManager.totalEnemiesKilled,
        this.progress.getGamesPlayed(),
        true
      );
      this.ui.showAthenaMessage("🧪 Batalla de pruebas terminada. Tus récords de historia se mantienen intactos.", 4500);
    }
  }

  restartGame() {
    this.isPaused = false;
    this.ui.closePauseModal();
    this.economy.reset();
    this.waveManager.reset();
    this.powerManager.reset();
    
    // Limpiar torres
    for (const t of this.towersList) {
      this.grid.removeTowerAt(t.col, t.row);
    }
    this.towersList = [];
    this.projectilesList = [];
    this.roadBombsList = [];
    this.selectedTowerType = null;
    this.inspectedTower = null;
    this.isGameOver = false;

    this.ui.clearTowerSelection();
    this.ui.closeInspector();
  }

  loop(currentTime) {
    const rawDelta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    const dt = Math.min(rawDelta, 0.1) * (this.isPaused || this.isGameOver ? 0 : this.gameSpeed);

    try {
      this.update(dt);
      this.render();
    } catch (err) {
      console.error("Game loop error:", err);
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.renderer.updateTime(dt);

    if (this.gameState === "PLAYING" && dt > 0) {
      // 1. Actualizar oleadas y enemigos
      this.waveManager.update(
        dt,
        (enemy) => this.onEnemyReachesExit(enemy),
        (enemy) => this.onEnemyKilled(enemy)
      );

      // 2. Actualizar torres (apuntado, disparo, rayos de Hades y siembra de minas de Ares)
      for (const tower of this.towersList) {
        tower.update(dt, this.waveManager.activeEnemies, this.projectilesList, this.particles, this.grid, this.roadBombsList);
      }

      // 3. Actualizar bombas/minas en el camino sembradas por Ares
      for (let i = this.roadBombsList.length - 1; i >= 0; i--) {
        const bomb = this.roadBombsList[i];
        bomb.update(dt, this.waveManager.activeEnemies, this.particles);
        if (bomb.isDetonated) {
          this.roadBombsList.splice(i, 1);
        }
      }

      // 4. Actualizar habilidades divinas
      this.powerManager.update(dt, this.waveManager.isWaitingNextWave, this.waveManager.activeEnemies, this.towersList);

      // 5. Actualizar proyectiles (virotes, morteros de Ares, esquirlas, orbes de Poseidón)
      for (let i = this.projectilesList.length - 1; i >= 0; i--) {
        const proj = this.projectilesList[i];
        proj.update(dt, this.waveManager.activeEnemies, this.particles, this.projectilesList);
        if (proj.hasHit) {
          this.projectilesList.splice(i, 1);
        }
      }

      // 6. Actualizar partículas y textos flotantes
      this.particles.update(dt);
    } else {
      this.particles.update(dt);
    }

    // 7. Actualizar interfaz y HUD de habilidades
    this.ui.updateHUD(this.economy, this.waveManager);
    this.ui.updatePowerHud(
      this.powerManager.getEquippedPowerConfig(),
      this.powerManager.cooldownRemaining,
      this.economy.gold,
      this.powerManager.isTargeting,
      this.waveManager.isWaitingNextWave,
      this.powerManager.activeEffectRemaining
    );
  }

  render() {
    this.renderer.clear();

    // 1. Mapa matricial
    this.renderer.renderMap(this.grid);

    // 1.5. Minas y bombas terrestres en el camino
    this.renderer.renderRoadBombs(this.roadBombsList);

    // 1.6. Zonas de Habilidades Divinas activas (Deméter, Artemisa)
    this.renderer.renderActivePowerZones(this.powerManager.activeZones);

    // 2. Rango de la torre inspeccionada (visible mientras la ventana de mejora/información esté abierta)
    if (this.inspectedTower) {
      this.renderer.renderSelectedTowerRange(this.inspectedTower);
    }

    // Si cualquier otra torre tuvo mejora de rango reciente, mostrar su pulso de 0.5s
    for (const tower of this.towersList) {
      if (tower.rangeGrowthTimer > 0 && tower !== this.inspectedTower) {
        this.renderer.renderSelectedTowerRange(tower);
      }
    }

    // 3. Previsualización de colocación de torre
    if (this.gameState === "PLAYING" && this.selectedTowerType && this.isMouseOnCanvas) {
      const { col, row } = this.mouseGridPos;
      const isValid = this.grid.isBuildable(col, row) && this.economy.canAfford(TOWERS[this.selectedTowerType].cost);
      this.renderer.renderPlacementPreview(col, row, TOWERS[this.selectedTowerType], isValid, this.grid);
    }

    // 3.5. Marcador divino del Tutorial de Atenea
    if (this.tutorial && this.tutorial.isActive) {
      this.tutorial.render(this.renderer);
    }

    // 4. Torres construidas
    this.renderer.renderTowers(this.towersList);

    // 5. Proyectiles
    this.renderer.renderProjectiles(this.projectilesList);

    // 6. Enemigos
    this.renderer.renderEnemies(this.waveManager.activeEnemies);

    // 7. Partículas y textos de daño
    this.particles.render(this.renderer.ctx);

    // 7.5. Auras y efectos visuales de Poderes Globales (Cronos y Hermes)
    this.renderer.renderGlobalPowerAuras(this.powerManager, this.towersList);

    // 8. Retícula de apuntado de Habilidad Divina (para poderes de zona)
    if (this.powerManager && this.powerManager.isTargeting) {
      this.renderer.renderPowerTargeting(this.powerManager.mouseWorldPos, this.powerManager.getEquippedPowerConfig());
    }
  }
}

// Inicializar cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
