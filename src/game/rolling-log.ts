import { logSprites, logMasks, Resolution } from '@/graphics';
import { GameState } from './game-state';
import { map, ObsticleType } from './map';

export class RollingLog {

    xCounter = 0;
    spriteCounter = 0;

    update(gs: GameState) {
        this.xCounter += .5;
        if (this.xCounter === Resolution.WIDTH) {
            this.xCounter = 0;
        }

        this.spriteCounter = (this.spriteCounter + 1) & 0xF;

        // const { harry } = gs;
        // if (harry.i)

        // const rollingRight = gs.sceneStates[scene].enteredLeft;

        // let x = gs.round(rollingRight ? this.xCounter : Resolution.WIDTH - .5 - this.xCounter);
        // const s = this.spriteCounter >> 2;
        // const sprite = s & 1;
        // const y = 111 + ((s === 0) ? 1 : 0);

        // this.renderLog(gs, ctx, sprite, x, y, 0, scene, rollingRight, ox);
        // switch (map[scene].obsticles) {
        //     case ObsticleType.TWO_ROLLING_LOGS_NEAR:
        //         this.renderLog(gs, ctx, sprite, x, y, 16, scene, rollingRight, ox);
        //         break;
        //     case ObsticleType.THREE_ROLLING_LOGS:
        //         this.renderLog(gs, ctx, sprite, x, y, 64, scene, rollingRight, ox);
        //         // fall through to next case to draw the third log
        //     case ObsticleType.TWO_ROLLING_LOGS_FAR:
        //         this.renderLog(gs, ctx, sprite, x, y, 32, scene, rollingRight, ox);
        //         break;                    
        // }
    }

    fadeLog(gs: GameState, scene: number, rollingRight: boolean, offset: number): boolean {
        if (gs.sceneStates[scene].enteredLeft !== rollingRight) {
            return true;
        } 
        const { obsticles } = map[scene];
        switch (offset) {
            case 0:
                if (obsticles > ObsticleType.THREE_ROLLING_LOGS) {
                    return true;
                }
                break;
            case 16:
                if (obsticles !== ObsticleType.TWO_ROLLING_LOGS_NEAR) {
                    return true;
                }
                break;
            case 32:
                if (obsticles !== ObsticleType.TWO_ROLLING_LOGS_FAR && obsticles !== ObsticleType.THREE_ROLLING_LOGS) {
                    return true;
                }
                break;
            case 64:
                if (obsticles !== ObsticleType.THREE_ROLLING_LOGS) {
                    return true;
                }
                break;
        }
        return false;
    }

    renderLog(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, sprite: number, x: number, y: number, 
            offset: number, scene: number, rollingRight: boolean, ox: number) {

        const X = (x + offset) % Resolution.WIDTH;
        if (X <= 15) {
            let leftScene = scene - (gs.harry.isUnderground() ? 3 : 1);
            if (leftScene < 0) {
                leftScene += gs.sceneStates.length;
            }
            if (this.fadeLog(gs, leftScene, rollingRight, offset)) {
                ctx.globalAlpha = (X + 1) / 17;
            }            
        } else if (X >= Resolution.WIDTH - 15) {
            let rightScene = scene + (gs.harry.isUnderground() ? 3 : 1);
            if (rightScene >= gs.sceneStates.length) {
                rightScene -= gs.sceneStates.length;
            }
            if (this.fadeLog(gs, rightScene, rollingRight, offset)) {
                ctx.globalAlpha = (Resolution.WIDTH - X + 1) / 17;
            }
        }
        ctx.drawImage(logSprites[sprite], X - 4 - ox, y);
        ctx.globalAlpha = 1;
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, scene: number, ox: number) {
        const rollingRight = gs.sceneStates[scene].enteredLeft;

        let x = gs.round(rollingRight ? this.xCounter : Resolution.WIDTH - .5 - this.xCounter);
        const s = this.spriteCounter >> 2;
        const sprite = s & 1;
        const y = 111 + ((s === 0) ? 1 : 0);

        this.renderLog(gs, ctx, sprite, x, y, 0, scene, rollingRight, ox);
        switch (map[scene].obsticles) {
            case ObsticleType.TWO_ROLLING_LOGS_NEAR:
                this.renderLog(gs, ctx, sprite, x, y, 16, scene, rollingRight, ox);
                break;
            case ObsticleType.THREE_ROLLING_LOGS:
                this.renderLog(gs, ctx, sprite, x, y, 64, scene, rollingRight, ox);
                // fall through to next case to draw the third log
            case ObsticleType.TWO_ROLLING_LOGS_FAR:
                this.renderLog(gs, ctx, sprite, x, y, 32, scene, rollingRight, ox);
                break;                    
        }
    }
}