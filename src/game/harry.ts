import { harryMasks, harrySprites, Resolution, Mask } from '@/graphics';
import { GameState } from './game-state';
import { 
    leftPressed, leftJustPressed, leftJustReleased,
    rightPressed, rightJustPressed, rightJustReleased,
    upPressed, upJustPressed, upJustReleased,
    downPressed, downJustPressed, downJustReleased,
    jumpPressed, jumpJustPressed, jumpJustReleased,
 } from '@/input';
import { map, Wall } from './map';
import { spritesIntersect } from '@/math';

const Y_UPPER_LEVEL = 119;
const Y_LOWER_LEVEL = 174;
const Y_HOLE_BOTTOM = 157;

const JUMP_ARC_BASE = 17;
const JUMP_ARC_HEIGHT = 11;

const T = JUMP_ARC_BASE;
const G = 2 * JUMP_ARC_HEIGHT / (T * T);
const VY0 = -G * T;

const INJURED_DELAY = 140;

const X_SPAWN_MARGIN = Resolution.WIDTH / 4;

enum MainState {
    STANDING,
    FALLING,
    CLIMBING,
    INJURED,
}

export class Harry {   
    mainState = MainState.STANDING;
    lastMainState = MainState.STANDING;
    scene = 0;
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

    intersects(mask: Mask, x: number, y: number): boolean {
        return spritesIntersect(mask, x, y, harryMasks[this.dir][this.sprite], Math.floor(this.x) - 4, 
                Math.floor(this.y) - 22);
    }

    isUnderground() {
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

    private startFalling(v0: number) {
        this.mainState = MainState.FALLING;
        this.y += v0;
        this.vy = G + v0;
        this.sprite = 2;
    }

    private endFalling(y: number) {
        this.mainState = MainState.STANDING;
        this.y = y;
        this.vy = 0;
        this.sprite = 2;
        this.runCounter = 0;
        this.tunnelSpawning = false;
    }

    private startClimbing(y: number) {
        this.mainState = MainState.CLIMBING;
        this.teleport(72);
        this.y = y;
        this.sprite = 7;
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
            if (this.y >= 120 && ((wall === Wall.RIGHT && this.x === 127) || (wall === Wall.LEFT && this.x === 9))) {
                moveRight = false;
            } else if (this.y > Y_UPPER_LEVEL && this.y <= Y_HOLE_BOTTOM) {
                if (this.x >= 40 && this.x <= 51) {
                    if (this.x > 50.5) {
                        moveRight = false;
                    }
                } else if (this.x >= 92 && this.x <= 103) {
                    if (this.x > 102.5) {
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
            if (this.y >= 120 && ((wall === Wall.LEFT && this.x === 18) || (wall === Wall.RIGHT && this.x === 136))) {
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

        if (holes && this.y === Y_UPPER_LEVEL && ((this.x >= 40 && this.x <= 51) || (this.x >= 92 && this.x <= 103))) {
            this.startFalling(G);
            return;
        }

        if (jumpJustPressed) {
            this.startFalling(VY0);
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
                this.endFalling(Y_UPPER_LEVEL);
                return;        
            }
        } 
            
        if (this.y <= Y_LOWER_LEVEL && nextY >= Y_LOWER_LEVEL) {
            this.endFalling(Y_LOWER_LEVEL);
            return;
        }

        this.y += this.vy;
        this.vy += G;
        this.sprite = 5;
        
        this.updateShift(gs);
    }

    private updateClimbing(gs: GameState) {
        if (this.y <= 142) {
            if (rightJustPressed 
                    || (this.y === 134 && upPressed && (rightPressed || (!leftPressed && this.dir === 0)))) {
                this.endClimbing(77, Y_UPPER_LEVEL, 0);
                return;
            } 
            if (leftJustPressed 
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
            if (this.y === 134) {
                this.climbCounter = 0;                    
            } else if (++this.climbCounter >= 8) {
                this.climbCounter = 0;
                this.y -= 4;
                this.dir ^= 1;
            }
        } else if (downPressed) {
            if (this.y === Y_LOWER_LEVEL) {
                this.endClimbing(this.x, Y_LOWER_LEVEL, this.dir);
                return;
            } 
            if (++this.climbCounter >= 8) {
                this.climbCounter = 0;
                this.y += 4;
                this.dir ^= 1;
            }
        } 
    }

    isInjured() {
        return this.mainState === MainState.INJURED;
    }
    
    injure() {
        this.mainState = MainState.INJURED;
        this.injuredCounter = INJURED_DELAY;
    }

    private startTunnelSpawn() {
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
    
    private updateInjured(gs: GameState) {
        if (--this.injuredCounter === 0) {
            if (this.isUnderground()) {
                this.startTunnelSpawn();
            }
            return;
        }
    }

    update(gs: GameState) {
        this.teleported = false;
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
        }
        this.lastMainState = state;
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, ox: number) {
        const sprite = harrySprites[this.dir][this.sprite];
        const X = Math.floor(this.x) - 4 - ox;
        const Y = Math.floor(this.y) - 22;
        if (this.tunnelSpawning && Y >= 127 && Y < 142) {
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