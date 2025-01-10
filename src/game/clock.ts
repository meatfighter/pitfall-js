import { printNumber, Colors, charSprites } from '@/graphics';

export class Clock {

    minutes = 40; // TODO 20;
    seconds = 0;
    frames = 0;
    timeUp = false;
   
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