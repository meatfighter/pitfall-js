import { GameState } from './game-state';
import { PitType, map } from './map';
import { pitSprites, crocSprites } from '@/graphics';

const PIT_OPEN_FRAMES = 71;
const PIT_CLOSED_FRAMES = 143;
const PIT_SHIFT_FRAMES = 4;

const CROC_CLOSED_FRAMES = 192; // 128
const CROC_OPENED_FRAMES = 128; // 128

const X_SHIFTS = [
    [ 41, 103 ],
    [ 45, 99 ],
    [ 49, 95 ],
    [ 57, 87 ],
    [ 69, 75 ],
];

const X_CLOSED_CROCS = [
    [ 41, 51 ],
    [ 61, 67 ],
    [ 77, 83 ],
    [ 93, 103 ],
];

const X_OPENED_CROCS_LEFT = [
    [ 41, 56 ],
    [ 61, 72 ],
    [ 77, 88 ],
    [ 93, 103 ],
];

const X_OPENED_CROCS_RIGHT = [
    [ 41, 51 ],
    [ 56, 67 ],
    [ 72, 83 ],
    [ 88, 103 ],
];

const X_CROCS = [
    [ 53, 59 ],
    [ 69, 75 ],
    [ 85, 91 ],
]

enum PitState {
    OPENED,
    CLOSING,
    CLOSED,
    OPENING,
}

enum CrocState {
    OPENED,
    CLOSED,
}

export class Pit {

    pitState = PitState.OPENED;
    pitOffset = 0;
    pitCounter = PIT_OPEN_FRAMES;

    crocState = CrocState.CLOSED;
    crocCounter = CROC_CLOSED_FRAMES;

    private updatePitOpened(gs: GameState) {
        if (--this.pitCounter >= 0) {
            return;
        }
        this.pitState = PitState.CLOSING;
        this.pitCounter = PIT_SHIFT_FRAMES;
        ++this.pitOffset;
    }

    private updatePitClosing(gs: GameState) {
        if (--this.pitCounter >= 0) {
            return;
        }
        if (++this.pitOffset === 5) {
            this.pitState = PitState.CLOSED;
            this.pitCounter = PIT_CLOSED_FRAMES;
            return;
        } 
        this.pitCounter = PIT_SHIFT_FRAMES;
    }
    
    private updatePitClosed(gs: GameState) {
        if (--this.pitCounter >= 0) {
            return;
        }
        this.pitState = PitState.OPENING;
        this.pitCounter = PIT_SHIFT_FRAMES;
        --this.pitOffset;
    }
    
    private updatePitOpening(gs: GameState) {
        if (--this.pitCounter >= 0) {
            return;
        }
        if (--this.pitOffset === 0) {
            this.pitState = PitState.OPENED;
            this.pitCounter = PIT_OPEN_FRAMES;
            return;
        } 
        this.pitCounter = PIT_SHIFT_FRAMES;
    }

    private updateCrocOpened(gs: GameState) {
        if (--this.crocCounter === 0) {
            this.crocState = CrocState.CLOSED;
            this.crocCounter = CROC_CLOSED_FRAMES + 1;
            this.updateCrocClosed(gs);
            return;
        }

        const { harry, sceneStates } = gs;
        if (map[harry.scene].pit !== PitType.CROCS) {
            return;
        }

        const xOpenedCrocs = (sceneStates[harry.scene].enteredLeft) ? X_OPENED_CROCS_LEFT : X_OPENED_CROCS_RIGHT;
        for (let i = xOpenedCrocs.length - 1; i >= 0; --i) {
            const xCrocs = xOpenedCrocs[i];
            if (harry.checkSink(xCrocs[0], xCrocs[1])) {
                for (let j = X_CROCS.length - 1; j >= 0; --j) {
                    const xs = X_CROCS[j];
                    harry.checkSwallow(xs[0], xs[1]);
                }
                break;
            }
        }
    }

    private updateCrocClosed(gs: GameState) {
        if (--this.crocCounter === 0) {
            this.crocState = CrocState.OPENED;
            this.crocCounter = CROC_OPENED_FRAMES + 1;
            this.updateCrocOpened(gs);
            return;
        }

        const { harry } = gs;
        if (map[harry.scene].pit !== PitType.CROCS) {
            return;
        }

        for (let i = X_CLOSED_CROCS.length - 1; i >= 0; --i) {
            const xCrocs = X_CLOSED_CROCS[i];
            if (harry.checkSink(xCrocs[0], xCrocs[1])) {
                break;
            }
        }
    }    

    update(gs: GameState) {
        switch (this.pitState) {
            case PitState.OPENED:
                this.updatePitOpened(gs);
                break;
            case PitState.CLOSING:
                this.updatePitClosing(gs);
                break;  
            case PitState.CLOSED:
                this.updatePitClosed(gs);
                break;
            case PitState.OPENING:
                this.updatePitOpening(gs);
                break;                              
        }

        switch (this.crocState) {
            case CrocState.OPENED:
                this.updateCrocOpened(gs);
                break;
            case CrocState.CLOSED:
                this.updateCrocClosed(gs);
                break;    
        }

        const { harry } = gs;
        switch (map[harry.scene].pit) {
            case PitType.TAR:
            case PitType.QUICKSAND:               
                harry.checkSink(X_SHIFTS[0][0], X_SHIFTS[0][1]);
                break;
            case PitType.SHIFTING_TAR:
            case PitType.SHIFTING_QUICKSAND:
                if (this.pitOffset < 5) {
                    harry.checkSink(X_SHIFTS[this.pitOffset][0], X_SHIFTS[this.pitOffset][1]);
                }
                break;
        }
    }

    render(gs: GameState, ctx: OffscreenCanvasRenderingContext2D, scene: number, ox: number) {
        const { pit } = map[scene];
        const sprites = pitSprites[(pit === PitType.TAR || pit == PitType.SHIFTING_TAR) ? 0 : 1];
        if (pit === PitType.SHIFTING_TAR || pit === PitType.SHIFTING_QUICKSAND) {
            if (this.pitState !== PitState.OPENED) {
                ctx.drawImage(pitSprites[2][0], 40 - ox, 114);
                ctx.drawImage(pitSprites[2][1], 40 - ox, 119);
            }
            if (this.pitState !== PitState.CLOSED) {
                ctx.drawImage(sprites[0], 0, 0, 64, 5 - this.pitOffset, 40 - ox, 114 + this.pitOffset, 64, 
                        5 - this.pitOffset);
                ctx.drawImage(sprites[1], 0, this.pitOffset, 64, 5 - this.pitOffset, 40 - ox, 119, 64, 
                        5 - this.pitOffset);
            }
        } else {
            ctx.drawImage(sprites[0], 40 - ox, 114);
            ctx.drawImage(sprites[1], 40 - ox, 119);
            if (pit === PitType.CROCS) {
                const crocImages = crocSprites[gs.sceneStates[scene].enteredLeft ? 0 : 1];
                const sprite = this.crocState === CrocState.OPENED ? 1 : 0;
                ctx.drawImage(crocImages[sprite], 52 - ox, 111);
                ctx.drawImage(crocImages[sprite], 68 - ox, 111);
                ctx.drawImage(crocImages[sprite], 84 - ox, 111);
            }
        }
    }
}