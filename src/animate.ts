import { update } from './game/game';
import { render } from './screen';

const FRAMES_PER_SECOND = 60;
const MILLIS_PER_FRAME = 1000 / FRAMES_PER_SECOND;
const MAX_UPDATES_WITHOUT_RENDER = 5;

let animationRunning = false;
let frameID = 0;
let previousTime = 0;
let lagTime = 0;

export function startAnimation() {
    if (animationRunning) {
        return;
    }
    animationRunning = true;
    lagTime = 0;
    frameID = requestAnimationFrame(renderAndUpdate);
    previousTime = performance.now();
}

export function stopAnimation() {
    if (!animationRunning) {
        return;
    }
    animationRunning = false;
    cancelAnimationFrame(frameID);
}

export function renderAndUpdate() {
    if (!animationRunning) {
        return;
    }

    frameID = requestAnimationFrame(renderAndUpdate);

    render();

    const currentTime = performance.now();
    const elapsedTime = currentTime - previousTime;
    previousTime = currentTime;
    lagTime += elapsedTime;

    let count = 0;
    while ((lagTime >= MILLIS_PER_FRAME) && animationRunning) {
        update();
        lagTime -= MILLIS_PER_FRAME;
        if (++count > MAX_UPDATES_WITHOUT_RENDER) {
            lagTime = 0;
            previousTime = performance.now();
            break;
        }
    }
}