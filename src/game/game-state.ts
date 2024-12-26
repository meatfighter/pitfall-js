import { store, saveStore } from '@/store';
import { Harry } from './harry';

export class GameState {

    harry = new Harry();
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