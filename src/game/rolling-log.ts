import { logSprites, logMasks, Resolution } from '@/graphics';
import { GameState } from './game-state';
import { map, ObsticleType } from './map';

export class RollingLog {

    xCounter = 0;
    spriteCounter = 0;

    // When the scroll position changes, floor the rolling logs counter to prevent jittering. Jittering occurs when the 
    // scroll position and the rolling logs change on alternate frames.
    sync() {
        this.xCounter = Math.floor(this.xCounter);
    }

    checkRolled(gs: GameState, x: number, y: number, sprite: number, offset: number, rollingRight: boolean) {
        const X = (x + offset) % Resolution.WIDTH;
        if (this.computeFade(gs, X, offset, gs.harry.scene, rollingRight) === 1 
                && gs.harry.intersects(logMasks[sprite], X, y)) {
            gs.harry.rolled();
            if (gs.score > 0) {
                --gs.score;
            }
        }
    }

    update(gs: GameState) {
        this.xCounter += .5;
        if (this.xCounter === Resolution.WIDTH) {
            this.xCounter = 0;
        }

        this.spriteCounter = (this.spriteCounter + 1) & 0xF;

        const { harry } = gs;
        const { obsticles } = map[harry.scene];
        if (!harry.canBeHitByRollingLog() || obsticles > ObsticleType.THREE_ROLLING_LOGS) {
            return;
        }

        const rollingRight = gs.sceneStates[harry.scene].enteredLeft;
        const x = Math.floor(rollingRight ? this.xCounter : Resolution.WIDTH - .5 - this.xCounter);
        const s = this.spriteCounter >> 2;
        const sprite = s & 1;
        const y = 111 + ((s === 0) ? 1 : 0);

        this.checkRolled(gs, x, y, sprite, 0, rollingRight);
        switch (obsticles) {
            case ObsticleType.TWO_ROLLING_LOGS_NEAR:
                this.checkRolled(gs, x, y, sprite, 16, rollingRight);
                break;
            case ObsticleType.THREE_ROLLING_LOGS:
                this.checkRolled(gs, x, y, sprite, 64, rollingRight);
                // fall through to next case to check the third log
            case ObsticleType.TWO_ROLLING_LOGS_FAR:
                this.checkRolled(gs, x, y, sprite, 32, rollingRight);
                break;                    
        }
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

    computeFade(gs: GameState, X: number, offset: number, scene: number, rollingRight: boolean): number {        
        if (X <= 15) {
            let leftScene = scene - (gs.harry.isUnderground() ? 3 : 1);
            if (leftScene < 0) {
                leftScene += gs.sceneStates.length;
            }
            if (this.fadeLog(gs, leftScene, rollingRight, offset)) {
                return (X + 1) / 17;
            }            
        } else if (X >= Resolution.WIDTH - 15) {
            let rightScene = scene + (gs.harry.isUnderground() ? 3 : 1);
            if (rightScene >= gs.sceneStates.length) {
                rightScene -= gs.sceneStates.length;
            }
            if (this.fadeLog(gs, rightScene, rollingRight, offset)) {
                return (Resolution.WIDTH - X + 1) / 17;
            }
        }
        return 1;        
    }

    renderLog(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, sprite: number, x: number, y: number, 
            offset: number, scene: number, rollingRight: boolean, ox: number) {
        const X = (x + offset) % Resolution.WIDTH;
        ctx.globalAlpha = this.computeFade(gs, X, offset, scene, rollingRight);
        ctx.drawImage(logSprites[sprite], X - 4 - ox, y);
        ctx.globalAlpha = 1;
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, scene: number, ox: number) {
        const rollingRight = gs.sceneStates[scene].enteredLeft;
        const x = Math.floor(rollingRight ? this.xCounter : Resolution.WIDTH - .5 - this.xCounter);
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