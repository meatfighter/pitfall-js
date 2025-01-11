import { store, saveStore, Difficulty } from '@/store';
import { Harry } from './harry';
import { Scorpion } from './scorpion';
import { Vine } from './vine';
import { Pit } from './pit';
import { RollingLog } from './rolling-log';
import { StationaryLog } from './stationary-log';
import { Rattle } from './rattle';
import { CobraAndFire } from './cobra-and-fire';
import { Treasure } from './treasure';
import { Clock } from './clock';
import { map, TreasureType } from './map';

export class SceneState {

    enteredLeft = true;

    constructor(public treasure: TreasureType) {
    }
}

export class GameState {

    sceneStates: SceneState[] = new Array<SceneState>(map.length);
    harry = new Harry();
    scorpion = new Scorpion();
    vine = new Vine();
    pit = new Pit();
    rollingLog = new RollingLog();
    stationaryLog = new StationaryLog();
    rattle = new Rattle();
    cobraAndFire = new CobraAndFire();
    treasure = new Treasure();
    clock = new Clock();
    scrollX = Math.floor(this.harry.absoluteX);
    lastScrollX = this.scrollX;
    ox = 0;
    lastOx = 0;
    nextOx = 0;
    nextScene = 0;
    lastNextScene = 0;
    lastHarryUnderground = false;
    sceneAlpha = 1;
    score = 2000;
    extraLives: number;
    gameOver = false;
    gameOverDelay = 180;
    treasureCount = 0;
    treasureMapIndex = 0;

    constructor() {
        switch (store.difficulty) {
            case Difficulty.EASY:
                this.extraLives = 4;
                break;
            case Difficulty.NORMAL:
                this.extraLives = 3;
                break;
            default:
                this.extraLives = 2;
                break;        
        }

        for (let i = map.length - 1; i >= 0; --i) {
            const scene = map[i];
            this.sceneStates[i] = new SceneState(scene.treasure);
        }
    }

    save() {
        saveStore();
    }
}