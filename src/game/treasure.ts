import { GameState } from './game-state';
import { moneySprite, moneyMask, ringSprite, ringMask, goldSprites, goldMasks, silverSprites, silverMasks, Mask, 
    Sprite } from '@/graphics';
import { TreasureType } from './map';
import { updateTreasureMapIndex } from './treasure-map';
import { play } from '@/audio';

export class Treasure {

    constructor(_: { } = { }) {
    }

    update(gs: GameState) {
        let mask: Mask;
        let points = 0;
        switch (gs.sceneStates[gs.harry.scene].treasure) {
            case TreasureType.DIAMOND_RING:
                mask = ringMask;
                points = 5000;
                break;
            case TreasureType.GOLD_BRICK:
                mask = goldMasks[gs.rattle.getValue()];
                points = 4000;
                break;
            case TreasureType.SILVER_BRICK:
                mask = silverMasks[gs.rattle.getValue()];
                points = 3000;
                break;
            case TreasureType.MONEY_BAG:
                mask = moneyMask;
                points = 2000;
                break;
            default:
                return;    
        }

        if (gs.harry.intersects(mask, 108, 111)) {
            gs.sceneStates[gs.harry.scene].treasure = TreasureType.NONE;            
            gs.score += points;
            if (++gs.treasureCount === 32) {
                gs.endGame();
            } else {
                updateTreasureMapIndex(gs);
            }
            play('sfx/treasure.mp3');
        }
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, scene: number, ox: number) {
        let sprite: Sprite;
        switch (gs.sceneStates[scene].treasure) {
            case TreasureType.DIAMOND_RING:
                sprite = ringSprite;
                break;
            case TreasureType.GOLD_BRICK:
                sprite = goldSprites[gs.rattle.getValue()];
                break;
            case TreasureType.SILVER_BRICK:
                sprite = silverSprites[gs.rattle.getValue()];
                break;
            case TreasureType.MONEY_BAG:
                sprite = moneySprite;
                break;
            default:
                return;    
        }

        ctx.drawImage(sprite, 108 - ox, 111);
    }
}