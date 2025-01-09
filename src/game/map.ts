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
                public scorpion: boolean,
                public difficulty: number) {
    }
}

let seed = 0xC4;
for (let i = 0; i < map.length; ++i) {
    let difficulty = 304;
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
            difficulty += 5;
            break;
        case 1:
            ladder = true;
            holes = true;
            difficulty += 10;
            break;
        case 2:
            vine = true;
            pit = PitType.TAR;
            difficulty += 143;
            break;
        case 3:
            vine = true;
            pit = PitType.QUICKSAND;
            difficulty += 143;
            break;
        case 4:
            vine = ((seed >> 1) & 1) === 1;
            pit = PitType.CROCS;
            difficulty += vine ? 143 : 240;
            break;
        case 5:
            pit = PitType.SHIFTING_TAR;
            treasure = seed & 3;
            difficulty += 111;
            break;
        case 6:
            pit = PitType.SHIFTING_TAR;
            vine = true;
            difficulty += 111;
            break;
        case 7:
            pit = PitType.SHIFTING_QUICKSAND;
            difficulty += 111;
            break;                            
    }
    if (treasure === TreasureType.NONE && pit !== PitType.CROCS) {
        obsticles = seed & 7;
        switch (obsticles) {
            case ObsticleType.ONE_STATIONARY_LOG:
            case ObsticleType.THREE_STATIONARY_LOGS:
            case ObsticleType.ONE_ROLLING_LOG:
                difficulty += 5;
                break;
            case ObsticleType.TWO_ROLLING_LOGS_FAR:
                difficulty += 10;
                break;
            case ObsticleType.TWO_ROLLING_LOGS_NEAR:
                difficulty += 15;
                break;
            case ObsticleType.THREE_ROLLING_LOGS:
                difficulty += 20;
                break;                                        
            case ObsticleType.FIRE:
            case ObsticleType.COBRA:
                difficulty += 30;
                break;
        }
    }
    if (ladder) {
        wall = (seed >> 7) & 1;
    }
    map[i] = new Scene(trees, ladder, holes, vine, pit, treasure, obsticles, wall, !ladder, difficulty);

    seed = 0xFF & ((seed << 1) | (((seed >> 7) & 1) ^ ((seed >> 5) & 1) ^ ((seed >> 4) & 1) ^ ((seed >> 3) & 1)));
}