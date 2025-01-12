import { map, TreasureType, WallType } from './map';
import { GameState } from './game-state';
import { dijkstra, Edge } from './dijkstra';

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

class Node {
    constructor(public readonly scene: number, public readonly tier: Tier) {        
    }
}

function createNodes(): Node[][] {
    const nodes = new Array<Node[]>(map.length);
    for (let scene = map.length - 1; scene >= 0; --scene) {
        nodes[scene] = [ new Node(scene, Tier.UPPER), new Node(scene, Tier.LOWER) ];
    }
    return nodes;
}

function createGraph(nodes: Node[][]): Map<Node, Edge<Node>[]> {

    const graph = new Map<Node, Edge<Node>[]>();
    for (let scene = map.length - 1; scene >= 0; --scene) {
        {
            const edges: Edge<Node>[] = [];
            if (map[scene].ladder) {
                edges.push({ 
                    node: nodes[scene][Tier.LOWER], 
                    weight: 165 + map[scene].difficulty, 
                });
            }
            let leftScene = scene - 1;
            if (leftScene < 0) {
                leftScene += map.length;
            }
            let rightScene = scene + 1;
            if (rightScene >= map.length) {
                rightScene -= map.length;
            }
            edges.push({ 
                node: nodes[leftScene][Tier.UPPER], 
                weight: map[scene].difficulty + map[leftScene].difficulty, 
            });
            edges.push({ 
                node: nodes[rightScene][Tier.UPPER], 
                weight: map[scene].difficulty + map[rightScene].difficulty,
            });            
            graph.set(nodes[scene][Tier.UPPER], edges);
        }

        {
            const edges: Edge<Node>[] = [];
            if (map[scene].ladder) {
                edges.push({ 
                    node: nodes[scene][Tier.UPPER], 
                    weight: 165 + map[scene].difficulty,
                });
            }
            let leftScene = scene - 3;
            if (leftScene < 0) {
                leftScene += map.length;
            }
            let rightScene = scene + 3;
            if (rightScene >= map.length) {
                rightScene -= map.length;
            }
            if (map[scene].wall !== WallType.LEFT && map[leftScene].wall !== WallType.RIGHT) {
                edges.push({ 
                    node: nodes[leftScene][Tier.LOWER], 
                    weight: 10, 
                });
            }
            if (map[scene].wall !== WallType.RIGHT && map[rightScene].wall !== WallType.LEFT) {
                edges.push({ 
                    node: nodes[rightScene][Tier.LOWER], 
                    weight: 10, 
                });
            }
            graph.set(nodes[scene][Tier.LOWER], edges);
        }
    }    
    return graph;
}

export class TreasureCell {
    constructor(public readonly direction: Direction) {
    }
}

export function updateTreasureMapIndex(gs: GameState) { 
    // for (let i = 0; i < treasureIndices.length; ++i) {
    //     if (gs.sceneStates[treasureIndices[i]].treasure !== TreasureType.NONE) {
    //         gs.treasureMapIndex = i;
    //         break;
    //     }        
    // }

    // TODO optimal reverse route
    for (let i = 0, j = 0; i < treasureIndices.length; ++i, --j) {
        if (gs.sceneStates[treasureIndices[j]].treasure !== TreasureType.NONE) {
            gs.treasureMapIndex = j;
            break;
        }        
    }
}

export const treasureIndices = new Array<number>(32);
export const treasureCells = new Array<TreasureCell[][]>(32);

function initTreasureCells() {
    const nodes = createNodes();
    const graph = createGraph(nodes);
    
    let treasureIndex = 0;
    for (let scene = 0; scene < map.length; ++scene) {
        if (map[scene].treasure === TreasureType.NONE) {
            continue;
        }
        treasureIndices[treasureIndex] = scene;
        const distLinks = dijkstra(graph, nodes[scene][Tier.UPPER]);        
        const cells = treasureCells[treasureIndex++] = new Array<TreasureCell[]>(map.length);
        for (let i = 0; i < map.length; ++i) {
            cells[i] = new Array<TreasureCell>(2);
            {                             
                const distLink = distLinks.get(nodes[i][Tier.UPPER]);
                if (!distLink) {
                    throw new Error('Missing upper distLink');
                }
                const { link } = distLink;
                let direction = Direction.RIGHT;
                if (link) {
                    if (link.tier === Tier.LOWER) {
                        direction = Direction.DOWN;
                    } else {
                        let leftScene = i - 1;
                        if (leftScene < 0) {
                            leftScene += map.length;
                        }
                        direction = (link.scene === leftScene) ? Direction.LEFT : Direction.RIGHT;
                    }
                }
                cells[i][Tier.UPPER] = new TreasureCell(direction);
            }
            {                             
                const distLink = distLinks.get(nodes[i][Tier.LOWER]);
                if (!distLink) {
                    throw new Error('Missing lower distLink');
                }
                const { link } = distLink;
                let direction = Direction.RIGHT;
                if (link) {
                    if (link.tier === Tier.UPPER) {
                        direction = Direction.UP;
                    } else {
                        let leftScene = i - 3;
                        if (leftScene < 0) {
                            leftScene += map.length;
                        }
                        direction = (link.scene === leftScene) ? Direction.LEFT : Direction.RIGHT;
                    }
                }
                cells[i][Tier.LOWER] = new TreasureCell(direction);
            }
        }
    }
}

initTreasureCells();