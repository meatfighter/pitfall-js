import { store, saveStore } from '@/store';
import { Harry } from './harry';
import { Scorpion } from './scorpion';
import { Vine } from './vine';
import { Pit } from './pit';
import { RollingLog } from './rolling-log';
import { map, TreasureType } from './map';

export class SceneState {

    enteredLeft = false;

    constructor(public readonly scorpion: Scorpion | null,
                public treasure: TreasureType
    ) {
    }
}

export class GameState {

    sceneStates: SceneState[] = new Array<SceneState>(map.length);
    harry = new Harry();
    vine = new Vine();
    pit = new Pit();
    rollingLog = new RollingLog();
    scrollX = Math.floor(this.harry.absoluteX);
    lastScrollX = this.scrollX;
    ox = 0;
    nextOx = 0;
    nextScene = 0;
    lastNextScene = 0;
    lastHarryUnderground = false;
    sceneAlpha = 1;

    constructor() {
        for (let i = map.length - 1; i >= 0; --i) {
            const scene = map[i];
            this.sceneStates[i] = new SceneState(scene.scorpion ? new Scorpion(i) : null, scene.treasure);
        }
    }

    save() {
        saveStore();
    }
}