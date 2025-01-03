export const map = new Array<Scene>(255);

export enum PitType {    
    TAR,
    QUICKSAND,
    CROCS,
    SHIFTING_TAR,
    SHIFTING_QUICKSAND,
    NONE,
}

export enum TreasureType {
    MONEY_BAG = 0,
    SILVER_BRICK = 1,
    GOLD_BRICK = 2,
    DIAMOND_RING = 3,
    NONE = 4,
}

export enum ObsticleType {
    ONE_ROLLING_LOG = 0,
    TWO_ROLLING_LOGS_NEAR = 1,
    TWO_ROLLING_LOGS_FAR = 2,
    THREE_ROLLING_LOGS = 3,
    ONE_STATIONARY_LOG = 4,
    THREE_STATIONARY_LOGS = 5,
    FIRE = 6,
    COBRA = 7,
    NONE = 8,
}

export enum WallType {
    LEFT = 0,
    RIGHT = 1,
    NONE = 2,
}

export class Scene {
    constructor(public trees: number,
                public ladder: boolean,
                public holes: boolean,
                public vine: boolean,
                public pit: PitType,
                public treasure: TreasureType,
                public obsticles: ObsticleType,
                public wall: WallType,
                public scorpion: boolean) {
    }
}

let seed = 0xC4;
for (let i = 0; i < map.length; ++i) {  
    const trees = seed >> 6;
    let ladder = false;
    let holes = false;
    let vine = false;
    let pit = PitType.NONE;
    let treasure = TreasureType.NONE;
    let obsticles = ObsticleType.NONE;
    let wall = WallType.NONE;
    switch ((seed >> 3) & 7) {
        case 0:
            ladder = true;
            break;
        case 1:
            ladder = true;
            holes = true;
            break;
        case 2:
            vine = true;
            pit = PitType.TAR;            
            break;
        case 3:
            vine = true;
            pit = PitType.QUICKSAND;
            break;
        case 4:
            vine = ((seed >> 1) & 1) === 1;
            pit = PitType.CROCS;
            break;
        case 5:
            pit = PitType.SHIFTING_TAR;
            treasure = seed & 3;
            break;
        case 6:
            pit = PitType.SHIFTING_TAR;
            vine = true;
            break;
        case 7:
            pit = PitType.SHIFTING_QUICKSAND;
            break;                            
    }
    if (treasure === TreasureType.NONE && pit !== PitType.CROCS) {
        obsticles = seed & 7;
    }
    if (ladder) {
        wall = (seed >> 7) & 1;
    }
    map[i] = new Scene(trees, ladder, holes, vine, pit, treasure, obsticles, wall, !ladder);

    seed = 0xFF & ((seed << 1) | (((seed >> 7) & 1) ^ ((seed >> 5) & 1) ^ ((seed >> 4) & 1) ^ ((seed >> 3) & 1)));
}