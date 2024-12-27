import { sorpionSprites, Resolution } from '@/graphics';
import { GameState } from './game-state';

const X_START = Resolution.WIDTH / 2;
const X_MAX = Resolution.WIDTH - 8;
const ADVANCE_DIST = Resolution.WIDTH / 8;
const FRAMES_PER_UPDATE = 8;

// TODO MAKE IT WALK PAST HARRY A SPECIFIED DISTANCE BEFORE TURING AROUND
// TODO IT STOPS AT THE RIGHT SIDE!

export class Scorpion {
    x = X_START;
    dir = 0;
    sprite = 0;
    updateCounter = FRAMES_PER_UPDATE;
    advanceCounter = ADVANCE_DIST;

    constructor(public scene: number) {        
    }

    update(gs: GameState) {
        if (--this.updateCounter > 0) {
            return;
        }
        this.updateCounter = FRAMES_PER_UPDATE;

        this.sprite ^= 1;

        if (--this.advanceCounter === 0) {
            this.advanceCounter = ADVANCE_DIST;
            if (gs.harry.scene === this.scene) {
                if (gs.harry.x > this.x) {
                    this.dir = 0;
                } else {
                    this.dir = 1;
                }
            }
        }

        if (this.dir === 0) {
            if (this.x === X_MAX) {
                this.dir = 0;
            } else {
                ++this.x;
            }
        } else {
            if (this.x === 0) {
                this.dir = 1;
            } else {
                --this.x;
            }
        }
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, ox: number) {
        ctx.drawImage(sorpionSprites[this.dir][this.sprite], Math.floor(this.x) - 4 - ox, 158);
    }
}