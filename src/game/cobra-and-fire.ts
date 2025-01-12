import { GameState } from './game-state';
import { cobraSprites, cobraMasks, fireSprites, fireMasks, Mask, Sprite } from '@/graphics';
import { map, ObsticleType } from './map';

export class CobraAndFire {

    constructor(_: { } = { }) {
    }

    update(gs: GameState) {
        let mask: Mask;
        switch (map[gs.harry.scene].obsticles) {
            case ObsticleType.COBRA:
                mask = cobraMasks[gs.sceneStates[gs.harry.scene].enteredLeft ? 0 : 1][gs.rattle.getValue()];
                break;
            case ObsticleType.FIRE:
                mask = fireMasks[gs.rattle.getValue()];
                break;
            default:
                return;    
        }

        if (gs.harry.intersects(mask, 108, 111)) {
            gs.harry.injure();
        }
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, scene: number, ox: number) {
        let sprite: Sprite;
        switch (map[scene].obsticles) {
            case ObsticleType.COBRA:
                sprite = cobraSprites[gs.sceneStates[scene].enteredLeft ? 0 : 1][gs.rattle.getValue()];
                break;
            case ObsticleType.FIRE:
                sprite = fireSprites[gs.rattle.getValue()];
                break;
            default:
                return;    
        }

        ctx.drawImage(sprite, 108 - ox, 111);
    }
}