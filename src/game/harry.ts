import { harrySprites, Resolution } from '@/graphics';
import { GameState } from './game-state';
import { isDownPressed, isJumpPressed, isLeftPressed, isRightPressed, isUpPressed } from '@/input';
import { map, Wall } from './map';

const Y_UPPER_LEVEL = 119;
const Y_LOWER_LEVEL = 174;
const Y_HOLE_BOTTOM = 157;

const JUMP_ARC_BASE = 17;
const JUMP_ARC_HEIGHT = 11;

const T = JUMP_ARC_BASE;
const G = 2 * JUMP_ARC_HEIGHT / (T * T);
const VY0 = -G * T;

enum State {    
    GROUNDED,
    STARTING_FALL,
    FALLING,
    ENDING_FALL,
    CLIMBING,
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
    state = State.GROUNDED;
    climbCounter = 0;
    lastLeftPressed = false;
    lastRightPressed = false;
    lastJumpPressed = false;

    incrementAbsoluteX(delta: number) {
        this.absoluteX += delta;
        // if (Math.floor(this.absoluteX - this.laggyX) === this.absoluteX - this.laggyX) {
        //     if (this.absoluteX > this.laggyX) {
        //         this.laggyX += .5;
        //     } else if (this.absoluteX < this.laggyX) {
        //         this.laggyX -= .5;
        //     }
        // }
    }

    isUnderground() {
        return this.y > 146;
    }

    update(gs: GameState) {  
        const upPressed = isUpPressed();
        const downPressed = isDownPressed();
        const rightPressed = isRightPressed();
        const leftPressed = isLeftPressed(); 
        const jumpPressed = isJumpPressed();       

        const { ladder, holes, wall } = map[this.scene];

        if (this.state === State.GROUNDED && this.y === Y_UPPER_LEVEL && holes
                && ((this.x >= 40 && this.x <= 51) || (this.x >= 92 && this.x <= 103))) {
            this.vy = G;
            this.state = State.STARTING_FALL;
        }

        if (this.state === State.GROUNDED) {
            if (!this.lastJumpPressed && jumpPressed) {
                this.vy = VY0;                
                this.state = State.STARTING_FALL;
            } 
        } 
       
        if (this.state === State.STARTING_FALL) {
            this.y += this.vy;
            this.vy += G;
            this.sprite = 2;
            this.state = State.FALLING;
        } else if (this.state === State.FALLING) {
            const nextY = this.y + this.vy;
            if (this.y <= Y_UPPER_LEVEL && nextY >= Y_UPPER_LEVEL 
                    && (!holes || this.x < 40 || this.x > 103 || (this.x > 51 && this.x < 92))) {
                this.y = Y_UPPER_LEVEL;
                this.vy = 0;
                this.sprite = 2;
                this.state = State.ENDING_FALL;
            } else if (this.y <= Y_LOWER_LEVEL && nextY >= Y_LOWER_LEVEL) {
                this.y = Y_LOWER_LEVEL;
                this.vy = 0;
                this.sprite = 2;
                this.state = State.ENDING_FALL;
            } else {
                this.y += this.vy;
                this.vy += G;
                this.sprite = 5;
            }
        }

        let shifting = false;
        if (this.state === State.CLIMBING) {
            if (this.y <= 142) {
                if ((!this.lastRightPressed && rightPressed) 
                        || (this.y === 134 && upPressed && (rightPressed || (!leftPressed && this.dir === 0)))) {
                    this.state = State.GROUNDED;
                    const deltaX = 77 - this.x;                    
                    this.incrementAbsoluteX(deltaX);
                    this.x += deltaX;
                    this.y = Y_UPPER_LEVEL;
                    shifting = true;
                    this.runCounter = 0;
                    this.sprite = 0;
                    this.dir = 0;
                } else if ((!this.lastLeftPressed && leftPressed) 
                        || (this.y === 134 && upPressed && (leftPressed || (!rightPressed && this.dir === 1)))) {
                    this.state = State.GROUNDED;
                    const deltaX = 67 - this.x;
                    this.incrementAbsoluteX(deltaX);
                    this.x += deltaX;
                    this.y = Y_UPPER_LEVEL;
                    shifting = true;
                    this.runCounter = 0;
                    this.sprite = 0;
                    this.dir = 1;
                }
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
                    this.state = State.GROUNDED;
                } else if (++this.climbCounter >= 8) {
                    this.climbCounter = 0;
                    this.y += 4;
                    this.dir ^= 1;
                }
            }            
        } else if (rightPressed) {
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
        
        if (ladder) {
            if ((this.y <= Y_UPPER_LEVEL && this.y + G >= Y_UPPER_LEVEL && this.x >= 68 && this.x <= 75)
                    || (this.state === State.GROUNDED && this.y === Y_UPPER_LEVEL && downPressed && this.x >= 64 
                            && this.x <= 80)) {
                this.state = State.CLIMBING;
                const deltaX = 72 - this.x;
                this.incrementAbsoluteX(deltaX);
                this.x += deltaX;
                this.y = 134;
                this.sprite = 7
                this.climbCounter = 0;
            } else if ((this.state === State.GROUNDED && this.y === Y_LOWER_LEVEL && upPressed && this.x >= 64 
                    && this.x <= 80)) {
                this.state = State.CLIMBING;
                const deltaX = 72 - this.x;
                this.incrementAbsoluteX(deltaX);
                this.x += deltaX;
                this.sprite = 7
                this.climbCounter = 0;
            }
        }

        if (this.state === State.GROUNDED) {
            if (shifting) {
                if (this.runCounter === 0 && ++this.sprite === 6) {
                    this.sprite = 1;
                }
                this.runCounter = (this.runCounter + 1) & 3;
            } else {
                this.runCounter = 0;
                this.sprite = 0;
            }
        } else if (this.state === State.ENDING_FALL) {
            this.runCounter = 0;
            this.state = State.GROUNDED;
        }

        if (this.laggyX < this.absoluteX - 4) {
            this.laggyX += .5;
        } else if (this.laggyX > this.absoluteX + 4) {
            this.laggyX -= .5;
        }       

        this.lastLeftPressed = leftPressed;
        this.lastRightPressed = rightPressed;
        this.lastJumpPressed = jumpPressed;
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, ox: number) {
        const sprite = harrySprites[this.dir][this.sprite];
        const X = Math.floor(gs.harry.absoluteX - gs.harry.laggyX) + 72;
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