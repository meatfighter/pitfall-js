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

    x = 12 + Resolution.WIDTH + 20; // TODO
    y = Y_UPPER_LEVEL;
    vy = 0;

    dir = 0;
    sprite = 0;
    runCounter = 0;
    lastJump = false;
    freeFallState = FreeFallState.GROUNDED;

    update(gs: GameState) {
        const sceneInd = Math.floor(this.x / Resolution.WIDTH);
        const sceneIndex = mod(sceneInd, 255);
        const sceneX = this.x - Resolution.WIDTH * sceneInd;
        const { holes, wall } = map[sceneIndex];

        if (this.freeFallState === FreeFallState.GROUNDED && this.y === Y_UPPER_LEVEL && holes
                && ((sceneX >= 40 && sceneX <= 51) || (sceneX >= 92 && sceneX <= 103))) {
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
                    && (!holes || sceneX < 40 || sceneX > 103 || (sceneX > 51 && sceneX < 92))) {
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
            if (this.y >= 120 && ((wall === Wall.RIGHT && sceneX === 127) || (wall === Wall.LEFT && sceneX === 9))) {
                moveRight = false;
            } else if (this.y > Y_UPPER_LEVEL && this.y <= Y_HOLE_BOTTOM) {
                if (sceneX >= 40 && sceneX <= 51) {
                    if (sceneX > 50.5) {
                        moveRight = false;
                    }
                } else if (sceneX >= 92 && sceneX <= 103) {
                    if (sceneX > 102.5) {
                        moveRight = false;
                    }
                }                
            } 
            if (moveRight) {
                this.x += .5;
                this.dir = 0;
                shifting = true;
            }
        } else if (isLeftPressed()) {
            let moveLeft = true;
            if (this.y >= 120 && ((wall === Wall.LEFT && sceneX === 18) || (wall === Wall.RIGHT && sceneX === 136))) {
                moveLeft = false;
            } else if (this.y > Y_UPPER_LEVEL && this.y <= Y_HOLE_BOTTOM) {
                if (sceneX >= 40 && sceneX <= 51) {
                    if (sceneX < 40.5) {
                        moveLeft = false;
                    }
                } else if (sceneX >= 92 && sceneX <= 103) {
                    if (sceneX < 92.5) {
                        moveLeft = false;
                    }
                }                
            }
            if (moveLeft) {
                this.x -= .5;
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

        const X = Math.floor(this.x);
        const camDelta = X - gs.camX;
        if (camDelta < 72) {
            gs.camX = X - 72;
        } else if (camDelta > 80) {
            gs.camX = X - 80;
        }
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D) {
        const sprite = harrySprites[this.dir][this.sprite];
        const X = Math.floor(this.x - 4 - gs.camX);
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