import { logSprites, logMasks, Resolution } from '@/graphics';
import { GameState } from './game-state';
import { map, ObsticleType } from './map';

export class StationaryLog {

    checkSkid(gs: GameState, x: number, y: number) {
        const { harry } = gs;
        if (harry.x >= x + 1 && harry.x <= x + 6 && harry.intersects(logMasks[1], x, y)) {
            harry.skidded();
            if (gs.score > 0) {
                --gs.score;
            }
        }
    }    

    update(gs: GameState) {
        switch (map[gs.harry.scene].obsticles) {
            case ObsticleType.THREE_STATIONARY_LOGS:
                this.checkSkid(gs, 20, 111);
                this.checkSkid(gs, 148, 111);
                // fall through to test to the final log
            case ObsticleType.ONE_STATIONARY_LOG:
                this.checkSkid(gs, 116, 111);
                break;
        }        
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, scene: number, ox: number) {
        switch (map[scene].obsticles) {
            case ObsticleType.THREE_STATIONARY_LOGS:
                ctx.drawImage(logSprites[1], 20 - ox, 111);
                ctx.drawImage(logSprites[1], 148 - ox, 111);
                // fall through to render to the final log
            case ObsticleType.ONE_STATIONARY_LOG:
                ctx.drawImage(logSprites[1], 116 - ox, 111);
                break;
        }
    }
}