import { store, saveStore } from '@/store';
import { Harry } from './harry';

export class GameState {

    harry = new Harry();

    save() {
        saveStore();
    }
}