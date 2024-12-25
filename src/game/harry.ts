import { harrySprites, Resolution } from '@/graphics';
import { GameState } from './game-state';
import { isJumpPressed, isLeftPressed, isRightPressed } from '@/input';
import { mod } from '@/math';
import { map, Wall } from './map';

const Y_UPPER_LEVEL = 119;
const Y_LOWER_LEVEL = 174;
const Y_HOLE_BOTTOM = 157;

const JUMP_ARC_BASE = 17;
const JUMP_ARC_HEIGHT = 11;

const T = JUMP_ARC_BASE;
const G = 2 * JUMP_ARC_HEIGHT / (T * T);
const VY0 = -G * T;

enum FreeFallState {
    GROUNDED,
    STARTING,
    FALLING,
    ENDING,
}

export class Harry {   
    scene = 0;
    absoluteX = 12;
    laggyX = this.absoluteX;
    x = this.absoluteX;
    y = Y_UPPER_LEVEL;
    vy = 0;
    dir = 0;
    sprite = 0;
    runCounter = 0;
    lastJump = false;
    freeFallState = FreeFallState.GROUNDED;

    isUnderground() {
        return this.y > Y_UPPER_LEVEL;
    }

    update(gs: GameState) {        
        const { holes, wall } = map[this.scene];

        if (this.freeFallState === FreeFallState.GROUNDED && this.y === Y_UPPER_LEVEL && holes
                && ((this.x >= 40 && this.x <= 51) || (this.x >= 92 && this.x <= 103))) {
            this.vy = G;
            this.freeFallState = FreeFallState.STARTING;
        }

        const jump = isJumpPressed();
        if (this.freeFallState === FreeFallState.GROUNDED) {
            if (!this.lastJump && jump) {
                this.vy = VY0;                
                this.freeFallState = FreeFallState.STARTING;
            } 
        } 
        this.lastJump = jump;
       
        if (this.freeFallState === FreeFallState.STARTING) {
            this.y += this.vy;
            this.vy += G;
            this.sprite = 2;
            this.freeFallState = FreeFallState.FALLING;
        } else if (this.freeFallState === FreeFallState.FALLING) {
            const nextY = this.y + this.vy;
            if (this.y <= Y_UPPER_LEVEL && nextY >= Y_UPPER_LEVEL 
                    && (!holes || this.x < 40 || this.x > 103 || (this.x > 51 && this.x < 92))) {
                this.y = Y_UPPER_LEVEL;
                this.vy = 0;
                this.sprite = 2;
                this.freeFallState = FreeFallState.ENDING;
            } else if (this.y <= Y_LOWER_LEVEL && nextY >= Y_LOWER_LEVEL) {
                this.y = Y_LOWER_LEVEL;
                this.vy = 0;
                this.sprite = 2;
                this.freeFallState = FreeFallState.ENDING;
            } else {
                this.y += this.vy;
                this.vy += G;
                this.sprite = 5;
            }
        }

        let shifting = false;
        if (isRightPressed()) {
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
                this.absoluteX += .5;
                this.x += .5;
                if (this.x >= Resolution.WIDTH) {
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
                this.dir = 0;
                shifting = true;
            }
        } else if (isLeftPressed()) {
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
                this.absoluteX -= .5;
                this.x -= .5;
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
                }
                this.dir = 1;
                shifting = true;
            }
        }   

        if (this.freeFallState === FreeFallState.GROUNDED) {
            if (shifting) {
                if (this.runCounter === 0 && ++this.sprite === 6) {
                    this.sprite = 1;
                }
                this.runCounter = (this.runCounter + 1) & 3;
            } else {
                this.runCounter = 0;
                this.sprite = 0;
            }
        } else if (this.freeFallState === FreeFallState.ENDING) {
            this.runCounter = 0;
            this.freeFallState = FreeFallState.GROUNDED;
        }

        if (this.laggyX < this.absoluteX - 4) {
            this.laggyX = this.absoluteX - 4;
        } else if (this.laggyX > this.absoluteX + 4) {
            this.laggyX = this.absoluteX + 4;
        }
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, ox: number) {
        const sprite = harrySprites[this.dir][this.sprite];
        const X = Math.floor(this.x - 4 - ox);
        const Y = Math.floor(this.y - 22);
        if (Y < 101 || Y >= 127) {
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