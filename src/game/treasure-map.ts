import { map, TreasureType, WallType } from './map';
import { GameState } from './game-state';

export enum Direction {
    RIGHT = 0,
    LEFT = 1,
    UP = 2,
    DOWN = 3,
}

export enum Tier {
    UPPER = 0,
    LOWER = 1,
}

export class TreasureCell {
    direction = Direction.RIGHT;
    distance = -1;

    constructor(public readonly scene: number, public readonly tier: Tier) {        
    }
}

export function updateTreasureMapIndex(gs: GameState) {
    const { sceneStates } = gs;
    const scene = gs.harry.scene;
    const tier = gs.harry.isUnderground() ? Tier.LOWER : Tier.UPPER;
    
    let minDistance = Number.MAX_VALUE;
    for (let i = treasureIndices.length - 1; i >= 0; --i) {
        if (sceneStates[treasureIndices[i]].treasure !== TreasureType.NONE) {
            continue;
        }
        const distance = treasureCells[i][scene][tier].distance;
        if (distance < minDistance) {
            minDistance = distance;
            gs.treasureMapIndex = i;
        }
    }
}

export const treasureIndices = new Array<number>(32);
export const treasureCells = new Array<TreasureCell[][]>(32);

function createTreasureMap(cells: TreasureCell[][], origin: number) {
    const originCell = cells[origin][Tier.UPPER];
    originCell.distance = 0;
    originCell.direction = Direction.RIGHT;
    
    const queue = [ originCell ];
    while (true) {
        const cell = queue.shift();
        if (!cell) {
            break;
        }

        if (cell.tier === Tier.UPPER) {
            if (map[cell.scene].ladder) {
                const lowerCell = cells[cell.scene][Tier.LOWER];
                if (lowerCell.direction < 0) {
                    lowerCell.distance = cell.distance + 1;
                    lowerCell.direction = Direction.UP;
                    queue.push(lowerCell);
                }
            }

            let leftScene = cell.scene - 1;
            if (leftScene < 0) {
                leftScene += cells.length;
            }
            const leftCell = cells[leftScene][Tier.UPPER];
            if (leftCell.distance < 0) {
                leftCell.distance = cell.distance + 2;
                leftCell.direction = Direction.RIGHT;
                queue.push(leftCell);
            }

            let rightScene = cell.scene + 1;
            if (rightScene >= cells.length) {
                rightScene -= cells.length;
            }
            const rightCell = cells[rightScene][Tier.UPPER];
            if (rightCell.distance < 0) {
                rightCell.distance = cell.distance + 2;
                rightCell.direction = Direction.LEFT;
                queue.push(rightCell);
            }            
        } else {
            if (map[cell.scene].ladder) {
                const upperCell = cells[cell.scene][Tier.UPPER];
                if (upperCell.direction < 0) {
                    upperCell.distance = cell.distance + 1;
                    upperCell.direction = Direction.DOWN;
                    queue.push(upperCell);
                }
            }

            if (map[cell.scene].wall !== WallType.LEFT) {
                let leftScene = cell.scene - 3;
                if (leftScene < 0) {
                    leftScene += cells.length;
                }
                if (map[leftScene].wall !== WallType.RIGHT) {
                    const leftCell = cells[leftScene][Tier.LOWER];
                    if (leftCell.distance < 0) {
                        leftCell.distance = cell.distance + 2;
                        leftCell.direction = Direction.RIGHT;
                        queue.push(leftCell);
                    }
                }
            }

            if (map[cell.scene].wall !== WallType.RIGHT) {
                let rightScene = cell.scene + 3;
                if (rightScene >= cells.length) {
                    rightScene -= cells.length;
                }
                if (map[rightScene].wall !== WallType.LEFT) {
                    const rightCell = cells[rightScene][Tier.LOWER];
                    if (rightCell.distance < 0) {
                        rightCell.distance = cell.distance + 2;
                        rightCell.direction = Direction.LEFT;
                        queue.push(rightCell);
                    }
                }
            }
        }
    }
}

function initTreasureCells() {    
    let treasureIndex = 0;
    for (let scene = 0; scene < map.length; ++scene) {
        if (map[scene].treasure !== TreasureType.NONE) {
            treasureIndices[treasureIndex] = scene;
            const cells = treasureCells[treasureIndex++] = new Array<TreasureCell[]>(map.length);
            for (let i = 0; i < map.length; ++i) {
                cells[i] = [ new TreasureCell(scene, Tier.UPPER), new TreasureCell(scene, Tier.LOWER) ];
            }
            createTreasureMap(cells, scene);
        }
    }
}

initTreasureCells();