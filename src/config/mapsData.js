/**
 * mapsData.js - Definición matricial de los mapas.
 * Códigos de celda:
 *  0 = Terreno Construible
 *  1 = Camino
 *  2 = Obstáculo (Rocas, Ruinas, Columnas)
 *  3 = Entrada (Fisura de Tifón / Invocador de oleadas)
 *  4 = Salida (Monte Olimpo / Templo Sagrado)
 */

export const MAPS = {
  TEST_MAP: {
    id: "test_map",
    name: "Llanuras de Flegra (Pruebas)",
    cols: 16,
    rows: 10,
    grid: [
      [2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2],
      [2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [3, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 2, 0, 1, 0, 0, 1, 0, 2, 0],
      [0, 2, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 2, 0, 0, 1, 0, 0, 1, 0, 0, 0],
      [0, 0, 2, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 4],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [2, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 2]
    ]
  }
};
