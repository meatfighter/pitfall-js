import { GameState } from './game-state';
import { Pit as PitType } from './map';
import { pitSprites } from '@/graphics';

const OPEN_FRAMES = 71;
const CLOSED_FRAMES = 143;
const SHIFT_FRAMES = 4;

enum State {
    OPENED,
    CLOSING,
    CLOSED,
    OPENING,
}

export class Pit {

    state = State.OPENED;
    offset = 0;
    counter = OPEN_FRAMES;

    private updateOpened(gs: GameState) {
        if (--this.counter >= 0) {
            return;
        }
        this.state = State.CLOSING;
        this.counter = SHIFT_FRAMES;
        ++this.offset;
    }

    private updateClosing(gs: GameState) {
        if (--this.counter >= 0) {
            return;
        }
        if (++this.offset === 5) {
            this.state = State.CLOSED;
            this.counter = CLOSED_FRAMES;
            return;
        } 
        this.counter = SHIFT_FRAMES;
    }
    
    private updateClosed(gs: GameState) {
        if (--this.counter >= 0) {
            return;
        }
        this.state = State.OPENING;
        this.counter = SHIFT_FRAMES;
        --this.offset;
    }
    
    private updateOpening(gs: GameState) {
        if (--this.counter >= 0) {
            return;
        }
        if (--this.offset === 0) {
            this.state = State.OPENED;
            this.counter = OPEN_FRAMES;
            return;
        } 
        this.counter = SHIFT_FRAMES;
    }    

    update(gs: GameState) {
        switch (this.state) {
            case State.OPENED:
                this.updateOpened(gs);
                break;
            case State.CLOSING:
                this.updateClosing(gs);
                break;  
            case State.CLOSED:
                this.updateClosed(gs);
                break;
            case State.OPENING:
                this.updateOpening(gs);
                break;                              
        }
    }

    render(gs: GameState, pit: PitType, ctx: OffscreenCanvasRenderingContext2D, ox: number) {
        const sprites = pitSprites[(pit === PitType.TAR || pit == PitType.SHIFTING_TAR) ? 0 : 1];
        if (pit === PitType.SHIFTING_TAR || pit === PitType.SHIFTING_QUICKSAND) {
            if (this.state !== State.CLOSED) {
                ctx.drawImage(sprites[0], 0, 0, 64, 5 - this.offset, 40 - ox, 114 + this.offset, 64, 5 - this.offset);
                ctx.drawImage(sprites[1], 0, this.offset, 64, 5 - this.offset, 40 - ox, 119, 64, 5 - this.offset);
            }
        } else {
            ctx.drawImage(sprites[0], 40 - ox, 114);
            ctx.drawImage(sprites[1], 40 - ox, 119);
        }
    }
}