import { printNumber, Colors, charSprites } from '@/graphics';
import { store, Difficulty } from '@/store';

export class Clock {

    minutes: number;
    seconds: number;
    frames: number;
    timeUp: boolean;

    constructor(clock: {
        minutes: number;
        seconds: number;
        frames: number;
        timeUp: boolean;
    } = {
        minutes: (store.difficulty === Difficulty.EASY) ? 22 : (store.difficulty === Difficulty.NORMAL) ? 21 : 20,
        seconds: 0,
        frames: 59,
        timeUp: false,
    }) {                
        this.minutes = clock.minutes;
        this.seconds = clock.seconds;
        this.frames = clock.frames;
        this.timeUp = clock.timeUp;
    }
   
    update() {
        if (this.minutes === 0 && this.seconds === 0 && this.frames === 0) {
            this.timeUp = true;
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