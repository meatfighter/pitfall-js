import { scorpionMasks, sorpionSprites, Resolution } from '@/graphics';
import { GameState } from './game-state';
import { map } from './map';

const X_START = Resolution.WIDTH / 2;
const X_MIN = 4;
const X_MAX = Resolution.WIDTH - 4;
const X_MARGIN = Resolution.WIDTH / 8;
const FRAMES_PER_UPDATE = 8;

export class Scorpion {
    x = X_START;
    X = this.x;
    dir = 0;
    sprite = 0;
    updateCounter = FRAMES_PER_UPDATE;

    update(gs: GameState) {
        const harryNearby = map[gs.harry.scene].scorpion && gs.harry.isUnderground();
        if (harryNearby && gs.harry.intersects(scorpionMasks[this.dir][this.sprite], gs.round(this.x) - 4, 158)) {
            gs.harry.injure();
            return;
        }        
        
        if (--this.updateCounter > 0) {
            return;
        }
        this.updateCounter = FRAMES_PER_UPDATE;

        this.sprite ^= 1;

        if (harryNearby && Math.abs(gs.harry.x - this.x) >= X_MARGIN) {
            const lastDir = this.dir;
            this.dir = (this.x > gs.harry.x) ? 1 : 0;
            if (lastDir !== this.dir) {
                return;
            }
        }

        if (this.dir === 0) {
            if (this.x >= X_MAX) {
                this.dir = 1;
            } else {
                ++this.x;
            }
        } else {
            if (this.x <= X_MIN) {
                this.dir = 0;
            } else {
                --this.x;
            }
        }
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, ox: number) {
        ctx.drawImage(sorpionSprites[this.dir][this.sprite], gs.round(this.x) - 4 - ox, 158);
    }
}