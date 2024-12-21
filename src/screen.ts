import { startAnimation, stopAnimation } from './animate';
import { acquireWakeLock, releaseWakeLock } from './wake-lock';
import { NoParamVoidFunc } from './no-param-void-func';
import { enter as enterStart } from './start';
import { PhysicalDimensions, Resolution } from './graphics';
import { startInput, stopInput } from './input';
import { renderScreen, resetGame, saveGame } from './game/game';

export let dpr: number;

let mainCanvas: HTMLCanvasElement;
let mainCtx: CanvasRenderingContext2D | null;
let mainCanvasWidth: number;
let mainCanvasHeight: number;

let screenCanvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D | null;

let removeMediaEventListener: NoParamVoidFunc | null = null;
let exiting = false;

let screenWidth: number;
let screenHeight: number;
let screenX: number;
let screenY: number;

function updatePixelRatio() {
    if (removeMediaEventListener !== null) {
        removeMediaEventListener();
        removeMediaEventListener = null;
    }

    if (exiting) {
        return;
    }

    const media = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    media.addEventListener("change", updatePixelRatio);
    removeMediaEventListener = () => media.removeEventListener("change", updatePixelRatio);

    onWindowResized();
};

export function enter() {
    exiting = false;

    resetGame();

    document.body.style.backgroundColor = '#C2BCB1';

    screenCanvas = new OffscreenCanvas(Resolution.WIDTH, Resolution.HEIGHT);
    ctx = screenCanvas.getContext('2d');

    const mainElement = document.getElementById("main-content") as HTMLElement;
    mainElement.innerHTML = `<canvas id="main-canvas" class="canvas" width="1" height="1"></canvas>`;
    mainCanvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    mainCanvas.style.touchAction = 'none';

    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('resize', onWindowResized);    
    window.addEventListener('focus', onVisibilityChanged);
    window.addEventListener('blur', onVisibilityChanged);
    document.addEventListener('visibilitychange', onVisibilityChanged);
    
    acquireWakeLock();
    updatePixelRatio();
    startInput();
    startAnimation();
}

function cleanUp() {
    if (exiting) {
        return;
    }

    exiting = true;
    stopAnimation();
    stopInput();
    releaseWakeLock();
    
    window.removeEventListener('beforeunload', onBeforeUnload);
    window.removeEventListener('resize', onWindowResized);    
    window.removeEventListener('focus', onVisibilityChanged);
    window.removeEventListener('blur', onVisibilityChanged);
    document.removeEventListener('visibilitychange', onVisibilityChanged);

    if (removeMediaEventListener !== null) {
        removeMediaEventListener();
        removeMediaEventListener = null;
    }

    saveGame();
}

export function exit() {
    cleanUp();
    enterStart();
}

export function render() {
    if (!mainCtx) {
        onWindowResized();
        return;
    }
    if (!ctx) {
        return;
    }
    
    mainCtx.imageSmoothingEnabled = false;
    mainCtx.fillStyle = '#0F0F0F';    
    mainCtx.fillRect(0, 0, mainCanvasWidth, mainCanvasHeight);

    ctx.imageSmoothingEnabled = false;
    renderScreen(ctx);

    mainCtx.drawImage(screenCanvas, screenX, screenY, screenWidth, screenHeight);

    // hamburger icon
    mainCtx.imageSmoothingEnabled = true;
    mainCtx.fillStyle = '#FFFFFF';    
    mainCtx.fillRect(27, 21, 18, 1);
    mainCtx.fillRect(27, 27, 18, 1);
    mainCtx.fillRect(27, 33, 18, 1);
}

function onWindowResized() {

    if (exiting) {
        return;
    }

    mainCtx = null;
    mainCanvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    mainCanvas.style.display = 'none';

    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;

    mainCanvas.style.display = 'block';
    mainCanvas.style.width = `${innerWidth}px`;
    mainCanvas.style.height = `${innerHeight}px`;    
    mainCanvas.style.position = 'absolute';
    mainCanvas.style.left = '0px';
    mainCanvas.style.top = '0px';

    dpr = window.devicePixelRatio || 1;
    mainCanvas.width = Math.floor(dpr * innerWidth);
    mainCanvas.height = Math.floor(dpr * innerHeight);

    const transform = new DOMMatrix();
    if (innerWidth >= innerHeight) {
        // Landscape mode
        mainCanvasWidth = innerWidth;
        mainCanvasHeight = innerHeight;
        transform.a = transform.d = dpr;
        transform.b = transform.c = transform.e = transform.f = 0;
    } else {
        // Portrait mode
        mainCanvasWidth = innerHeight;
        mainCanvasHeight = innerWidth;
        transform.a = transform.d = transform.e = 0;
        transform.c = dpr;
        transform.b = -transform.c;        
        transform.f = dpr * innerHeight;
    }

    mainCtx = mainCanvas.getContext('2d');
    if (!mainCtx) {
        return;
    }
    mainCtx.setTransform(transform);

    screenHeight = mainCanvasHeight;
    screenWidth = screenHeight * PhysicalDimensions.WIDTH / PhysicalDimensions.HEIGHT;
    if (screenWidth > mainCanvasWidth) {
        screenWidth = mainCanvasWidth;
        screenHeight = screenWidth * PhysicalDimensions.HEIGHT / PhysicalDimensions.WIDTH;
        screenX = 0;
        screenY = Math.round((mainCanvasHeight - screenHeight) / 2);
    } else {
        screenX = Math.round((mainCanvasWidth - screenWidth) / 2);
        screenY = 0;
    }

    render();
}

function onVisibilityChanged() {
    if (!exiting && document.visibilityState === 'visible' && document.hasFocus()) {
        acquireWakeLock();
        startAnimation();
    } else {
        stopAnimation();
    }
}

function onBeforeUnload() {
    cleanUp();    
}