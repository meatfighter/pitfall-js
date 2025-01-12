import { GameState } from './game/game-state';

export const LOCAL_STORAGE_KEY = 'pitfall-store';

export enum Difficulty {
    EASY = 0,
    NORMAL = 1,
    HARD = 2,
}

export class Store {
    highScores = [ 0, 0, 0];  
    volume = 10;
    difficulty = 0;
    gameState: GameState | undefined = undefined;
}

export let store: Store;

export function saveStore() {
    if (store.gameState?.gameOver) {
        store.gameState = undefined;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
}

export function loadStore() {
    if (store) {
        return;
    }

    const str = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (str) {
        try {
            store = JSON.parse(str) as Store;
            store.gameState = (store.gameState && !store.gameState.gameOver) 
                    ? new GameState(store.gameState) : undefined;
        } catch {
            store = new Store();
        }
    } else {
        store = new Store();
    }
}