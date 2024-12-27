import { store, saveStore } from '@/store';
import { Harry } from './harry';

export class GameState {

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

    save() {
        saveStore();
    }
}