import { isTouchOnlyDevice } from './input';

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
}

export let store: Store;

export function saveStore() {
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
        } catch {
            store = new Store();            
        }
    } else {
        store = new Store();
    }
}