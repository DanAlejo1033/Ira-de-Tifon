/**
 * EconomyManager.js - Gestión de dracmas (oro) y vidas sagradas del Monte Olimpo.
 */

import { BALANCE } from '../config/balance.js';

export class EconomyManager {
  constructor() {
    this.gold = BALANCE.STARTING_GOLD;
    this.lives = BALANCE.STARTING_LIVES;
    this.totalGoldEarned = BALANCE.STARTING_GOLD;
  }

  reset(initialGold = BALANCE.STARTING_GOLD, initialLives = BALANCE.STARTING_LIVES) {
    this.gold = initialGold;
    this.lives = initialLives;
    this.totalGoldEarned = initialGold;
  }

  canAfford(amount) {
    return this.gold >= amount;
  }

  hasEnoughGold(amount) {
    return this.canAfford(amount);
  }

  spendGold(amount) {
    if (this.canAfford(amount)) {
      this.gold -= amount;
      return true;
    }
    return false;
  }

  addGold(amount) {
    this.gold += amount;
    this.totalGoldEarned += amount;
  }

  loseLife(amount = 1) {
    this.lives = Math.max(0, this.lives - amount);
    return this.lives <= 0;
  }

  isGameOver() {
    return this.lives <= 0;
  }

  serialize() {
    return {
      gold: this.gold,
      lives: this.lives,
      totalGoldEarned: this.totalGoldEarned
    };
  }

  restore(data) {
    if (!data) return;
    if (typeof data.gold === 'number') this.gold = data.gold;
    if (typeof data.lives === 'number') this.lives = data.lives;
    if (typeof data.totalGoldEarned === 'number') this.totalGoldEarned = data.totalGoldEarned;
  }
}
