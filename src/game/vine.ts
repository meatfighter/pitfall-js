import { vinePoints, vineSprites, vineMasks } from '@/graphics';
import { GameState } from './game-state';
import { map } from './map';

export class Vine {
    
    sprite: number;

    constructor(vine: {
        sprite: number;
    } = {
        sprite: 0,
    }) {
        this.sprite = vine.sprite;
    }

    update(gs: GameState) {
        if (++this.sprite === vinePoints.length) {
            this.sprite = 0;
        }

        const { harry } = gs;
        if (map[harry.scene].vine && !harry.releasedVine && harry.isFalling() 
                && harry.intersects(vineMasks[this.sprite], 39, 28)) {
            harry.swing();
        }
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, ox: number) {
        ctx.drawImage(vineSprites[this.sprite], 39 - ox, 28);
    }
}