import { harrySprites } from "@/graphics";
import { GameState } from "./game-state";
import { isLeftPressed, isRightPressed } from "@/input";

export class Harry {
    x = 12;
    y = 119;
    dir = 0;
    sprite = 0;
    runCounter = 0;

    update(gs: GameState) {
        let running = false;
        if (isRightPressed()) {
            this.x += .5;
            this.dir = 0;
            running = true;
        } else if (isLeftPressed()) {
            this.x -= .5;
            this.dir = 1;
            running = true;
        }   

        if (running) {
            if (this.runCounter === 0 && ++this.sprite === 6) {
                this.sprite = 1;
            }
            this.runCounter = (this.runCounter + 1) & 3;
        } else {
            this.runCounter = 0;
            this.sprite = 0;
        }

        const X = Math.floor(this.x);
        const camDelta = X - gs.camX;
        if (camDelta < 72) {
            gs.camX = X - 72;
        } else if (camDelta > 80) {
            gs.camX = X - 80;
        }
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D) {
        ctx.drawImage(harrySprites[this.dir][this.sprite], Math.floor(this.x - 4 - gs.camX), Math.floor(this.y - 22));
    }
}