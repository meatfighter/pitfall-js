import { printNumber, Colors, charSprites } from '@/graphics';
import { store, Difficulty } from '@/store';
import { GameState } from './game-state';

export class Clock {

    minutes: number;
    seconds: number;
    frames: number;

    constructor(clock: {
        minutes: number;
        seconds: number;
        frames: number;
    } = {
        minutes: (store.difficulty === Difficulty.EASY) ? 22 : (store.difficulty === Difficulty.NORMAL) ? 21 : 20,
        seconds: 0,
        frames: 59,
    }) {                
        this.minutes = clock.minutes;
        this.seconds = clock.seconds;
        this.frames = clock.frames;
    }
   
    update(gs: GameState) {
        if (this.minutes === 0 && this.seconds === 0 && this.frames === 0) {
            gs.endGame();
            return;
        }

        if (--this.frames >= 0) {
            return;
        }

        this.frames = 59;

        if (--this.seconds >= 0) {
            return;
        }

        this.seconds = 59;

        --this.minutes;
    }

    render(ctx: OffscreenCanvasRenderingContext2D) {
        printNumber(ctx, this.minutes, 29, 16, Colors.OFF_WHITE);
        ctx.drawImage(charSprites[Colors.OFF_WHITE][10], 37, 16);
        printNumber(ctx, this.seconds, 53, 16, Colors.OFF_WHITE, 2);
    }
}