import { GameState } from './game-state';
import { charSprites, harrySprites, goldSprites } from '@/graphics';

let gs: GameState;

export function resetGame() {
    gs = new GameState();
}

export function saveGame() {
    gs.save();    
}

export function update() {
}

export function renderScreen(ctx: OffscreenCanvasRenderingContext2D) {

    // ctx.drawImage(goldSprites[0], 8, 8);
    // ctx.drawImage(goldSprites[1], 24, 8);

    for (let dir = 0; dir < 2; ++dir) {
        for (let i = 0; i < 8; ++i) {
            ctx.drawImage(harrySprites[dir][i], 8 * i, 8 + 22 * dir);
        }
    }

    for (let i = 0; i < 11; ++i) {
        ctx.drawImage(charSprites[0x0C][i], 8 * i, 0);
    }
}