import { vineStates, vineSprites, vineMasks } from '@/graphics';
import { GameState } from './game-state';
import { map } from './map';

export class Vine {
    
    sprite: number;

    constructor(vine: {
        sprite: number;
    } = {
        sprite: Math.floor(vineStates.length / 2),
    }) {
        this.sprite = vine.sprite;
    }

    update(gs: GameState) {
        if (++this.sprite === vineStates.length) {
            this.sprite = 0;
        }

        const { harry } = gs;
        if (map[harry.scene].vine && !harry.releasedVine && harry.isFalling() 
                && harry.intersects(vineMasks[this.sprite], 31, 28)) {
            harry.swing();
        }
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, ox: number) {
        ctx.drawImage(vineSprites[this.sprite], 31 - ox, 28);
    }
}