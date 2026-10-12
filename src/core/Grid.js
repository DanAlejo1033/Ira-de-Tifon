/**
 * Grid.js - Gestión de la matriz del mapa y extracción automática del camino (Waypoints).
 */

import { Vector2 } from './Vector2.js';
import { BALANCE } from '../config/balance.js';

export class Grid {
  constructor(mapData) {
    this.cols = mapData.cols;
    this.rows = mapData.rows;
    this.tileSize = BALANCE.TILE_SIZE;
    
    // Matriz de tipos (0: Construible, 1: Camino, 2: Obstáculo, 3: Entrada Tifón, 4: Olimpo)
    this.matrix = mapData.grid.map(row => [...row]);
    
    // Matriz para guardar referencias a torres construidas
    this.towers = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    
    this.entranceCell = null;
    this.exitCell = null;
    this.waypoints = [];

    this.findSpecialCells();
    this.buildWaypoints();
  }

  findSpecialCells() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.matrix[r][c] === 3) {
          this.entranceCell = { col: c, row: r };
        } else if (this.matrix[r][c] === 4) {
          this.exitCell = { col: c, row: r };
        }
      }
    }
  }

  /**
   * Extrae la secuencia ordenada de waypoints (puntos centrales en píxeles) desde la entrada hasta la salida.
   */
  buildWaypoints() {
    if (!this.entranceCell || !this.exitCell) {
      console.error("No se encontró entrada (3) o salida (4) en el mapa.");
      return;
    }

    const path = [];
    const visited = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));
    
    let current = { ...this.entranceCell };
    path.push(current);
    visited[current.row][current.col] = true;

    const directions = [
      { dc: 1, dr: 0 },  // Derecha
      { dc: 0, dr: 1 },  // Abajo
      { dc: -1, dr: 0 }, // Izquierda
      { dc: 0, dr: -1 }  // Arriba
    ];

    while (current.col !== this.exitCell.col || current.row !== this.exitCell.row) {
      let foundNext = false;

      for (const dir of directions) {
        const nextC = current.col + dir.dc;
        const nextR = current.row + dir.dr;

        if (
          nextC >= 0 && nextC < this.cols &&
          nextR >= 0 && nextR < this.rows &&
          !visited[nextR][nextC]
        ) {
          const tile = this.matrix[nextR][nextC];
          if (tile === 1 || tile === 4) {
            current = { col: nextC, row: nextR };
            path.push(current);
            visited[nextR][nextC] = true;
            foundNext = true;
            break;
          }
        }
      }

      if (!foundNext) {
        console.warn("El camino matricial se interrumpió antes de llegar al Olimpo:", current);
        break;
      }
    }

    // Convertir coordenadas de celdas a píxeles centrados
    this.waypoints = path.map(cell => {
      return new Vector2(
        cell.col * this.tileSize + this.tileSize / 2,
        cell.row * this.tileSize + this.tileSize / 2
      );
    });
  }

  getWaypoints() {
    return this.waypoints;
  }

  isBuildable(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;
    return this.matrix[row][col] === 0 && this.towers[row][col] === null;
  }

  getTowerAt(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return null;
    return this.towers[row][col];
  }

  setTowerAt(col, row, tower) {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.towers[row][col] = tower;
    }
  }

  removeTowerAt(col, row) {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.towers[row][col] = null;
    }
  }

  pixelToGrid(x, y) {
    return {
      col: Math.floor(x / this.tileSize),
      row: Math.floor(y / this.tileSize)
    };
  }

  gridToPixelCenter(col, row) {
    return new Vector2(
      col * this.tileSize + this.tileSize / 2,
      row * this.tileSize + this.tileSize / 2
    );
  }
}
