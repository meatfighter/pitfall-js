import { harryMasks, harrySprites, Resolution, Mask, vinePoints, crocSprites } from '@/graphics';
import { GameState } from './game-state';
import { 
    leftPressed, leftJustPressed, leftJustReleased,
    rightPressed, rightJustPressed, rightJustReleased,
    upPressed, upJustPressed, upJustReleased,
    downPressed, downJustPressed, downJustReleased,
    jumpPressed, jumpJustPressed, jumpJustReleased,
 } from '@/input';
import { map, WallType } from './map';
import { spritesIntersect } from '@/math';

const Y_UPPER_LEVEL = 119;
const Y_LOWER_LEVEL = 174;
const Y_HOLE_BOTTOM = 157;

const JUMP_ARC_BASE = 17;
const JUMP_ARC_HEIGHT = 11;

const T = JUMP_ARC_BASE;
const G = 2 * JUMP_ARC_HEIGHT / (T * T);
const VY0 = -G * T;

const INJURED_DELAY = 20//134;

const X_SPAWN_MARGIN = Resolution.WIDTH / 4;

enum MainState {
    STANDING,
    FALLING,
    CLIMBING,
    INJURED,
    SWINGING,
    SINKING,
    KNEELING,
    SKIDDING,   
}

export class Harry {   
    mainState = MainState.STANDING;
    lastMainState = MainState.STANDING;
    scene = 6; // TODO 0;
    absoluteX = 12;
    x = this.absoluteX;
    y = Y_UPPER_LEVEL;
    vy = 0;
    dir = 0;
    sprite = 0;
    runCounter = 0;
    climbCounter = 0;
    teleported = false;
    injuredCounter = 0;
    tunnelSpawning = false;
    releasedVine = false;
    swallow = false;
    kneeling = false;
    kneelingDelay = false;

    intersects(mask: Mask, x: number, y: number): boolean {
        return spritesIntersect(mask, x, y, harryMasks[this.dir][this.sprite], Math.floor(this.x) - 4, 
                Math.floor(this.y) - 22);
    }

    canBeHitByRollingLog() {
        return this.mainState === MainState.STANDING || this.mainState === MainState.KNEELING 
                || this.mainState === MainState.CLIMBING;
    }

    isFalling() {
        return this.mainState === MainState.FALLING;
    }

    isUnderground() {
        switch (this.mainState) {
            case MainState.SINKING:
            case MainState.SWINGING:
            case MainState.SKIDDING:
            case MainState.KNEELING:
                return false;            
        }
        return this.y > 146;
    }

    private teleport(x: number) {
        this.teleported = true;
        this.setX(x);
    }

    private setX(x: number) {
        this.incrementX(x - this.x);
    }    

    private incrementX(deltaX: number) {
        this.absoluteX += deltaX;
        this.x += deltaX;        

        if (this.x < 0) {
            this.x += Resolution.WIDTH;
            if (this.y > Y_UPPER_LEVEL) {
                this.scene -= 3;
            } else {
                --this.scene;
            }
            if (this.scene < 0) {
                this.scene += map.length;
            }
        } else if (this.x >= Resolution.WIDTH) {
            this.x -= Resolution.WIDTH;
            if (this.y > Y_UPPER_LEVEL) {
                this.scene += 3;
            } else {
                ++this.scene;
            }
            if (this.scene >= map.length) {
                this.scene -= map.length;
            }
        }
    }

    private startFalling(gs: GameState, v0: number) {
        this.mainState = MainState.FALLING;
        this.y += v0;
        this.vy = G + v0;
        this.sprite = 2;
        this.kneeling = false;
        this.updateShift(gs)
    }

    private endFalling(gs: GameState, y: number) {
        this.mainState = MainState.STANDING;
        this.y = y;
        this.vy = 0;
        this.sprite = 2;
        this.runCounter = 0;
        this.tunnelSpawning = false;
        this.releasedVine = false;
        this.updateShift(gs);
    }

    private startClimbing(y: number) {
        this.mainState = MainState.CLIMBING;
        this.teleport(72);
        this.y = y;
        this.sprite = 7;
        this.kneeling = false;
        this.climbCounter = 0;        
    }

    private endClimbing(x: number, y: number, dir: number) {
        this.mainState = MainState.STANDING;
        this.teleport(x);
        this.y = y;
        this.runCounter = 0;
        this.sprite = 0;
        this.dir = dir;
    }

    private updateShift(gs: GameState): boolean {
        const { wall } = map[this.scene];

        let shifting = false;
        if (rightPressed) {
            let moveRight = true;
            if (this.y >= 120 && ((wall === WallType.RIGHT && this.x === 127) 
                    || (wall === WallType.LEFT && this.x === 9))) {
                moveRight = false;
            } else if (this.y > Y_UPPER_LEVEL && this.y <= Y_HOLE_BOTTOM) {
                if (this.x >= 40 && this.x <= 52) {
                    if (this.x > 51.5) {
                        moveRight = false;
                    }
                } else if (this.x >= 92 && this.x <= 104) {
                    if (this.x > 103.5) {
                        moveRight = false;
                    }
                }                
            } 
            if (moveRight) {
                this.incrementX(.5);
                this.dir = 0;
                shifting = true;
            }
        } else if (leftPressed) {
            let moveLeft = true;
            if (this.y >= 120 && ((wall === WallType.LEFT && this.x === 18) 
                    || (wall === WallType.RIGHT && this.x === 136))) {
                moveLeft = false;
            } else if (this.y > Y_UPPER_LEVEL && this.y <= Y_HOLE_BOTTOM) {
                if (this.x >= 40 && this.x <= 51) {
                    if (this.x < 40.5) {
                        moveLeft = false;
                    }
                } else if (this.x >= 92 && this.x <= 103) {
                    if (this.x < 92.5) {
                        moveLeft = false;
                    }
                }                
            }
            if (moveLeft) {
                this.incrementX(-.5);
                this.dir = 1;
                shifting = true;
            }
        }
        return shifting;
    }

    private updateStanding(gs: GameState) {
        const { ladder, holes } = map[this.scene];

        if (holes && this.y === Y_UPPER_LEVEL && ((this.x >= 40 && this.x <= 52) || (this.x >= 92 && this.x <= 104))) {
            this.startFalling(gs, G);
            gs.score = Math.max(0, gs.score - 100);
            return;
        }

        if (jumpPressed) {
            this.startFalling(gs, VY0);
            return;
        }

        if (ladder) {
            if (this.y === Y_UPPER_LEVEL && ((this.x >= 68 && this.x <= 75) 
                    || (downPressed && this.x >= 64 && this.x <= 80))) {
                this.startClimbing(134);
                return;
            } 
            if (this.y === Y_LOWER_LEVEL && upPressed && !(leftPressed || rightPressed) && this.x >= 64 
                    && this.x <= 80) {
                this.startClimbing(this.y);
                return;
            }
        }

        if (this.updateShift(gs)) {
            if (this.runCounter === 0 && ++this.sprite === 6) {
                this.sprite = 1;
            }
            this.runCounter = (this.runCounter + 1) & 3;
        } else {
            this.runCounter = 0;
            this.sprite = (this.lastMainState === MainState.FALLING) ? 2 : 0;
        }        
    }

    private updateFalling(gs: GameState) {
        const { ladder, holes, wall } = map[this.scene];

        if (ladder && this.y >= 134 && this.y < Y_LOWER_LEVEL && this.x >= 68 && this.x <= 75) {
            const stepsToTop = Math.floor((this.y - 134) / 4);
            this.startClimbing(134 + 4 * stepsToTop);
            this.dir ^= stepsToTop & 1;
            return;           
        } 

        const nextY = this.y + this.vy;

        if (this.y <= Y_UPPER_LEVEL && nextY >= Y_UPPER_LEVEL) {
            if (ladder && this.x >= 68 && this.x <= 75) {
                this.startClimbing(134);
                return;
            }
            if (!holes || this.x < 40 || this.x > 103 || (this.x > 51 && this.x < 92)) {
                this.endFalling(gs, Y_UPPER_LEVEL);
                return;        
            }
        } 
            
        if (this.y <= Y_LOWER_LEVEL && nextY >= Y_LOWER_LEVEL) {
            this.endFalling(gs, Y_LOWER_LEVEL);
            return;
        }

        this.y += this.vy;
        this.vy += G;
        this.sprite = 5;
        
        this.updateShift(gs);
    }

    private climbUpward() {
        if (this.y === 134) {
            this.climbCounter = 0;                    
        } else if (++this.climbCounter >= 8) {
            this.climbCounter = 0;
            this.y -= 4;
            this.dir ^= 1;
        }
    }

    private climbDownward(): boolean {
        if (this.y === Y_LOWER_LEVEL) {
            this.endClimbing(this.x, Y_LOWER_LEVEL, this.dir);
            return true;
        } 
        if (++this.climbCounter >= 8) {
            this.climbCounter = 0;
            this.y += 4;
            this.dir ^= 1;
        }
        return false;
    }

    private updateClimbing(gs: GameState) {
        if (this.y <= 142) {
            if (rightJustPressed
                    || (jumpJustPressed && this.dir === 0)
                    || (this.y === 134 && upPressed && (rightPressed || (!leftPressed && this.dir === 0)))) {
                this.endClimbing(77, Y_UPPER_LEVEL, 0);
                return;
            } 
            if (leftJustPressed 
                    || (jumpJustPressed && this.dir === 1)
                    || (this.y === 134 && upPressed && (leftPressed || (!rightPressed && this.dir === 1)))) {
                this.endClimbing(67, Y_UPPER_LEVEL, 1);
                return;
            }
        }

        if (this.y >= 170 && (leftPressed || rightPressed)) {
            this.endClimbing(this.x, Y_LOWER_LEVEL, this.dir);
            return;
        }

        if (upPressed) {
            this.climbUpward();
        } else if (downPressed && this.climbDownward()) {
            return;
        } 
    }

    isInjured() {
        return this.mainState === MainState.INJURED || this.mainState === MainState.SINKING;
    }
    
    injure() {
        this.mainState = MainState.INJURED;
        this.injuredCounter = INJURED_DELAY;
    }

    private startTunnelSpawn(gs: GameState) {
        if (gs.extraLives === 0) {
            gs.gameOver = true;
            return;
        }
        --gs.extraLives;

        this.mainState = MainState.FALLING;
        this.tunnelSpawning = true;
        let spawnX: number;
        if (this.dir === 0) {
            spawnX = this.x - X_SPAWN_MARGIN;
            if (spawnX < 4) {
                spawnX = this.x + X_SPAWN_MARGIN;
            }    
        } else {
            spawnX = this.x + X_SPAWN_MARGIN;
            if (spawnX >= 148) {
                spawnX = this.x - X_SPAWN_MARGIN;
            }
        }
        this.teleport(spawnX);
        this.y = 149;
        this.vy = 0;
        this.sprite = 2;
    }

    private startTreeSpawn(gs: GameState) {
        if (gs.extraLives === 0) {
            gs.gameOver = true;
            return;
        }
        --gs.extraLives;

        this.mainState = MainState.FALLING;
        this.teleport((this.dir === 0) ? 16 : 135);
        this.y = 51;
        this.vy = 0;
        this.sprite = 2;
        this.swallow = false;
    }    
    
    private updateInjured(gs: GameState) {
        if (--this.injuredCounter === 0) {
            if (this.isUnderground()) {
                this.startTunnelSpawn(gs);
            } else {
                this.startTreeSpawn(gs);
            }
            return;
        }
    }

    swing() {
        this.mainState = MainState.SWINGING;
        this.sprite = 6;
        this.teleported = true;
    }

    private updateSwinging(gs: GameState) {
        const p = vinePoints[gs.vine.sprite];
        this.setX(this.dir === 0 ? p.x + 1 : p.x);
        this.y = p.y + 17;

        if ((this.dir === 0 && rightJustPressed) || (this.dir === 1 && leftJustPressed)) {
            this.startFalling(gs, VY0);
            this.releasedVine = true;
            return;
        }
    }

    checkSink(xMin: number, xMax: number): boolean {
        const X = Math.floor(this.x);
        if (this.mainState !== MainState.STANDING || this.y !== Y_UPPER_LEVEL || X < xMin || X > xMax) {
            return false;
        }
        this.mainState = MainState.SINKING;
        this.sprite = 0;
        return true;
    }

    checkSwallow(xMin: number, xMax: number) {
        const X = Math.floor(this.x);
        if (X < xMin || X > xMax) {
            return;
        }
        this.swallow = true;
    }

    private updateSinking(gs: GameState) {
        if (++this.y > 143 + INJURED_DELAY) {
            this.startTreeSpawn(gs);
            return;
        }
    }

    private startKnelling() {
        this.mainState = MainState.KNEELING;
        this.sprite = 5;
        this.kneeling = true;
        this.kneelingDelay = true;
    }

    rolled() {
        switch (this.mainState) {
            case MainState.STANDING:
            case MainState.KNEELING:    
                this.startKnelling();
                break;
            case MainState.CLIMBING:
                this.climbDownward();
                break;    
        }
    }

    skidded() {
        switch (this.mainState) {
            case MainState.STANDING:
            case MainState.SKIDDING:    
                this.mainState = MainState.SKIDDING;
                this.sprite = 5;
                this.kneeling = true;
                this.kneelingDelay = true;
                break;
        }        
    }

    private updateKneeling(gs: GameState) {
        if (this.kneelingDelay) {
            this.kneelingDelay = false;
        } else {
            this.mainState = MainState.STANDING;
            this.sprite = 0;
            this.kneeling = false;
        }
    }

    private updateSkidding(gs: GameState) {
        this.updateKneeling(gs);
        this.updateStanding(gs);
    }    

    update(gs: GameState) {
        const state = this.mainState;
        switch (this.mainState) {
            case MainState.STANDING:
                this.updateStanding(gs);
                break;
            case MainState.FALLING:
                this.updateFalling(gs);
                break; 
            case MainState.CLIMBING:
                this.updateClimbing(gs);
                break;
            case MainState.INJURED:
                this.updateInjured(gs);
                break;
            case MainState.SWINGING:
                this.updateSwinging(gs);
                break;
            case MainState.SINKING:
                this.updateSinking(gs);
                break;
            case MainState.KNEELING:
                this.updateKneeling(gs);
                break;
            case MainState.SKIDDING:
                this.updateSkidding(gs);
                break;        
        }
        this.lastMainState = state;
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, ox: number) {
        const sprite = harrySprites[this.dir][this.kneeling ? 5 : this.sprite];
        const X = Math.floor(this.x) - 4 - ox;
        const Y = this.kneeling ? Y_UPPER_LEVEL - 17 : Math.floor(this.y) - 22;
        if (this.mainState === MainState.SINKING) {
            if (this.swallow) {
                if (Y < 121) {
                    ctx.drawImage(sprite, 0, 0, 8, 121 - Y, X, Y, 8, 121 - Y);
                    const crocImages = crocSprites[gs.sceneStates[this.scene].enteredLeft ? 0 : 1];                  
                    ctx.drawImage(crocImages[0], 0, 9, 8, 2, 52 - ox, 120, 8, 2);
                    ctx.drawImage(crocImages[0], 0, 9, 8, 2, 68 - ox, 120, 8, 2);
                    ctx.drawImage(crocImages[0], 0, 9, 8, 2, 84 - ox, 120, 8, 2);
                }
            } else if (Y < 119) {
                ctx.drawImage(sprite, 0, 0, 8, 119 - Y, X, Y, 8, 119 - Y);
            }
        } else if (this.tunnelSpawning && Y >= 127 && Y < 142) {
            ctx.drawImage(sprite, 0, 142 - Y, 8, Y - 100, X, 142, 8, Y - 100);
        } else if (Y < 101 || Y >= 127) {
            ctx.drawImage(sprite, X, Y);
        } else {            
            if (Y < 122) {
                ctx.drawImage(sprite, 0, 0, 8, 122 - Y, X, Y, 8, 122 - Y);
            }
            if (Y > 106) {
                ctx.drawImage(sprite, 0, 127 - Y, 8, Y - 105, X, 127, 8, Y - 105);
            }
        }
    }
}