import { store, saveStore } from '@/store';
import { Harry } from './harry';
import { Scorpion } from './scorpion';
import { map } from './map';

export class SceneState {
    scorpion: Scorpion | null = null;
}

export class GameState {

    sceneStates: SceneState[] = new Array<SceneState>(map.length);
    harry = new Harry();
    scrollX = Math.floor(this.harry.absoluteX);
    lastScrollX = this.scrollX;
    ox = 0;
    nextOx = 0;
    nextScene = 0;
    lastNextScene = 0;
    lastHarryUnderground = false;
    sceneAlpha = 1;

    lastMinOx = 0;

    constructor() {
        for (let i = map.length - 1; i >= 0; --i) {
            this.sceneStates[i] = new SceneState();
            if (map[i].scorpion) {
                this.sceneStates[i].scorpion = new Scorpion(i);
            }
        }
    }

    save() {
        saveStore();
    }
}