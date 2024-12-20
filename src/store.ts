import { isTouchOnlyDevice } from './input';

export const LOCAL_STORAGE_KEY = 'pitfall-store';

export class Store {
    highScore = 0;
    
    volume = 10;

    autofire = isTouchOnlyDevice();
    tracer = false;
    fast = false;
   

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