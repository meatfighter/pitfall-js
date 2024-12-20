import { store, saveStore } from '@/store';

export class GameState {

    save() {
        saveStore();
    }    
}