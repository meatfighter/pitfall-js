import { logSprites, logMasks, Resolution } from '@/graphics';
import { GameState } from './game-state';
import { map, ObsticleType } from './map';

const X_MAX = 144;

export class RollingLog {

    xCounter = 0;
    spriteCounter = 0;

    update(gs: GameState) {
        this.xCounter += .5;
        if (this.xCounter > X_MAX) {
            this.xCounter = 0;
        }

        this.spriteCounter = (this.spriteCounter + 1) & 0xF;
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, scene: number, ox: number) {
        //const { obsticles } = map[scene];
        let x = gs.round(gs.sceneStates[scene].enteredLeft ? this.xCounter : X_MAX - this.xCounter);
        const s = this.spriteCounter >> 2;
        ctx.drawImage(logSprites[s & 1], x - ox, 111 + ((s === 0) ? 1 : 0));
    }
}