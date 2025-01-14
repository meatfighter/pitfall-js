"use strict";
(self["webpackChunkpitfall_js"] = self["webpackChunkpitfall_js"] || []).push([["app"],{

/***/ "./src/animate.ts":
/*!************************!*\
  !*** ./src/animate.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   renderAndUpdate: () => (/* binding */ renderAndUpdate),
/* harmony export */   startAnimation: () => (/* binding */ startAnimation),
/* harmony export */   stopAnimation: () => (/* binding */ stopAnimation)
/* harmony export */ });
/* harmony import */ var _game_game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game/game */ "./src/game/game.ts");
/* harmony import */ var _screen__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./screen */ "./src/screen.ts");


const FRAMES_PER_SECOND = 60;
const MILLIS_PER_FRAME = 1000 / FRAMES_PER_SECOND;
const MAX_UPDATES_WITHOUT_RENDER = 5;
let animationRunning = false;
let frameID = 0;
let previousTime = 0;
let lagTime = 0;
function startAnimation() {
    if (animationRunning) {
        return;
    }
    animationRunning = true;
    lagTime = 0;
    frameID = requestAnimationFrame(renderAndUpdate);
    previousTime = performance.now();
}
function stopAnimation() {
    if (!animationRunning) {
        return;
    }
    animationRunning = false;
    cancelAnimationFrame(frameID);
}
function renderAndUpdate() {
    if (!animationRunning) {
        return;
    }
    frameID = requestAnimationFrame(renderAndUpdate);
    (0,_screen__WEBPACK_IMPORTED_MODULE_1__.render)();
    const currentTime = performance.now();
    const elapsedTime = currentTime - previousTime;
    previousTime = currentTime;
    lagTime += elapsedTime;
    let count = 0;
    while ((lagTime >= MILLIS_PER_FRAME) && animationRunning) {
        (0,_game_game__WEBPACK_IMPORTED_MODULE_0__.update)();
        lagTime -= MILLIS_PER_FRAME;
        if (++count > MAX_UPDATES_WITHOUT_RENDER) {
            lagTime = 0;
            previousTime = performance.now();
            break;
        }
    }
}


/***/ }),

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   init: () => (/* binding */ init)
/* harmony export */ });
/* harmony import */ var _progress__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./progress */ "./src/progress.ts");
/* harmony import */ var _death__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./death */ "./src/death.ts");


function init() {
    window.addEventListener('error', e => {
        console.error(`Caught in global handler: ${e.message}`, {
            source: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            error: e.error
        });
        e.preventDefault();
        (0,_death__WEBPACK_IMPORTED_MODULE_1__.enter)();
    });
    window.addEventListener('unhandledrejection', e => e.preventDefault());
    document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
    (0,_progress__WEBPACK_IMPORTED_MODULE_0__.enter)();
}


/***/ }),

/***/ "./src/audio.ts":
/*!**********************!*\
  !*** ./src/audio.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decodeAudioData: () => (/* binding */ decodeAudioData),
/* harmony export */   getVolume: () => (/* binding */ getVolume),
/* harmony export */   play: () => (/* binding */ play),
/* harmony export */   setVolume: () => (/* binding */ setVolume),
/* harmony export */   stop: () => (/* binding */ stop),
/* harmony export */   stopAll: () => (/* binding */ stopAll),
/* harmony export */   waitForDecodes: () => (/* binding */ waitForDecodes)
/* harmony export */ });
const audioContext = new AudioContext();
audioContext.onstatechange = () => {
    if (audioContext.state === 'suspended') {
        stopAll();
    }
};
let docVisible = true;
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        docVisible = true;
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }
    else if (document.visibilityState === 'hidden') {
        docVisible = false;
        stopAll();
        if (audioContext.state === 'running') {
            audioContext.suspend();
        }
    }
});
const masterGain = audioContext.createGain();
masterGain.connect(audioContext.destination);
masterGain.gain.value = 0.1;
const promises = [];
const audioBuffers = new Map();
const activeSources = new Map();
function getVolume() {
    return 100 * masterGain.gain.value;
}
function setVolume(volume) {
    masterGain.gain.value = volume / 100;
}
function decodeAudioData(name, obj) {
    promises.push(obj.async('arraybuffer')
        .then(data => audioContext.decodeAudioData(data))
        .then(buffer => audioBuffers.set(name, buffer)));
}
async function waitForDecodes() {
    return Promise.all(promises).then(() => promises.length = 0);
}
function play(name, loop = false) {
    if (audioContext.state === 'suspended') {
        if (docVisible) {
            audioContext.resume().then(() => play(name));
        }
        return;
    }
    if (loop) {
        if (activeSources.has(name)) {
            return;
        }
    }
    else {
        stop(name);
    }
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers.get(name);
    source.connect(masterGain);
    source.loop = loop;
    activeSources.set(name, source);
    source.onended = () => activeSources.delete(name);
    source.start();
}
function stop(name) {
    const source = activeSources.get(name);
    if (source) {
        activeSources.delete(name);
        source.stop();
    }
}
function stopAll() {
    for (const source of activeSources.values()) {
        source.stop();
    }
    activeSources.clear();
}


/***/ }),

/***/ "./src/death.ts":
/*!**********************!*\
  !*** ./src/death.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   enter: () => (/* binding */ enter),
/* harmony export */   exit: () => (/* binding */ exit)
/* harmony export */ });
let landscape = false;
function enter() {
    window.addEventListener('resize', windowResized);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    const mainElement = document.getElementById('main-content');
    mainElement.innerHTML = '<div id="death-div"><span id="fatal-error">&#x1F480;</span></div>';
    windowResized();
}
function exit() {
    window.removeEventListener('resize', windowResized);
    window.removeEventListener('touchmove', onTouchMove);
}
function onTouchMove(e) {
    e.preventDefault();
}
function windowResized() {
    const deathDiv = document.getElementById('death-div');
    deathDiv.style.top = deathDiv.style.left = deathDiv.style.transform = '';
    deathDiv.style.display = 'none';
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    landscape = (innerWidth >= innerHeight);
    deathDiv.style.display = 'flex';
    if (landscape) {
        const rect = deathDiv.getBoundingClientRect();
        deathDiv.style.left = `${(innerWidth - rect.width) / 2}px`;
        deathDiv.style.top = `${(innerHeight - rect.height) / 2}px`;
    }
    else {
        deathDiv.style.transform = 'rotate(-90deg)';
        const rect = deathDiv.getBoundingClientRect();
        deathDiv.style.left = `${(innerWidth - rect.height) / 2}px`;
        deathDiv.style.top = `${(innerHeight - rect.width) / 2}px`;
    }
}


/***/ }),

/***/ "./src/download.ts":
/*!*************************!*\
  !*** ./src/download.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   download: () => (/* binding */ download)
/* harmony export */ });
const MAX_FETCH_RETRIES = 5;
async function download(url, progressListener) {
    for (let i = MAX_FETCH_RETRIES - 1; i >= 0; --i) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                continue;
            }
            const contentLengthStr = response.headers.get('Content-Length');
            if (!contentLengthStr) {
                continue;
            }
            const contentLength = parseInt(contentLengthStr);
            if (isNaN(contentLength) || contentLength <= 0) {
                continue;
            }
            const body = response.body;
            if (body === null) {
                continue;
            }
            const reader = body.getReader();
            const chunks = [];
            let bytesReceived = 0;
            while (true) {
                const { done, value: chunk } = await reader.read();
                if (done) {
                    break;
                }
                chunks.push(chunk);
                bytesReceived += chunk.length;
                progressListener(bytesReceived / contentLength);
            }
            const uint8Array = new Uint8Array(bytesReceived);
            let position = 0;
            chunks.forEach(chunk => {
                uint8Array.set(chunk, position);
                position += chunk.length;
            });
            return uint8Array;
        }
        catch (error) {
            if (i === 0) {
                throw error;
            }
        }
    }
    throw new Error("Failed to fetch.");
}


/***/ }),

/***/ "./src/game/clock.ts":
/*!***************************!*\
  !*** ./src/game/clock.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Clock: () => (/* binding */ Clock)
/* harmony export */ });
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/graphics */ "./src/graphics.ts");
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/store */ "./src/store.ts");


class Clock {
    minutes;
    seconds;
    frames;
    timeUp;
    constructor(clock = {
        minutes: (_store__WEBPACK_IMPORTED_MODULE_1__.store.difficulty === _store__WEBPACK_IMPORTED_MODULE_1__.Difficulty.EASY) ? 22 : (_store__WEBPACK_IMPORTED_MODULE_1__.store.difficulty === _store__WEBPACK_IMPORTED_MODULE_1__.Difficulty.NORMAL) ? 21 : 20,
        seconds: 0,
        frames: 59,
        timeUp: false,
    }) {
        this.minutes = clock.minutes;
        this.seconds = clock.seconds;
        this.frames = clock.frames;
        this.timeUp = clock.timeUp;
    }
    update() {
        if (this.minutes === 0 && this.seconds === 0 && this.frames === 0) {
            this.timeUp = true;
            return;
        }
        if (--this.frames >= 0) {
            return;
        }
        this.frames = 59;
        if (--this.seconds >= 0) {
            return;
        }
        this.seconds = 59;
        --this.minutes;
    }
    render(ctx) {
        (0,_graphics__WEBPACK_IMPORTED_MODULE_0__.printNumber)(ctx, this.minutes, 29, 16, _graphics__WEBPACK_IMPORTED_MODULE_0__.Colors.OFF_WHITE);
        ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_0__.charSprites[_graphics__WEBPACK_IMPORTED_MODULE_0__.Colors.OFF_WHITE][10], 37, 16);
        (0,_graphics__WEBPACK_IMPORTED_MODULE_0__.printNumber)(ctx, this.seconds, 53, 16, _graphics__WEBPACK_IMPORTED_MODULE_0__.Colors.OFF_WHITE, 2);
    }
}


/***/ }),

/***/ "./src/game/cobra-and-fire.ts":
/*!************************************!*\
  !*** ./src/game/cobra-and-fire.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CobraAndFire: () => (/* binding */ CobraAndFire)
/* harmony export */ });
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/graphics */ "./src/graphics.ts");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map */ "./src/game/map.ts");


class CobraAndFire {
    constructor(_ = {}) {
    }
    update(gs) {
        let mask;
        switch (_map__WEBPACK_IMPORTED_MODULE_1__.map[gs.harry.scene].obsticles) {
            case _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.COBRA:
                mask = _graphics__WEBPACK_IMPORTED_MODULE_0__.cobraMasks[gs.sceneStates[gs.harry.scene].enteredLeft ? 0 : 1][gs.rattle.getValue()];
                break;
            case _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.FIRE:
                mask = _graphics__WEBPACK_IMPORTED_MODULE_0__.fireMasks[gs.rattle.getValue()];
                break;
            default:
                return;
        }
        if (gs.harry.intersects(mask, 108, 111)) {
            gs.harry.injure();
        }
    }
    render(gs, ctx, scene, ox) {
        let sprite;
        switch (_map__WEBPACK_IMPORTED_MODULE_1__.map[scene].obsticles) {
            case _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.COBRA:
                sprite = _graphics__WEBPACK_IMPORTED_MODULE_0__.cobraSprites[gs.sceneStates[scene].enteredLeft ? 0 : 1][gs.rattle.getValue()];
                break;
            case _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.FIRE:
                sprite = _graphics__WEBPACK_IMPORTED_MODULE_0__.fireSprites[gs.rattle.getValue()];
                break;
            default:
                return;
        }
        ctx.drawImage(sprite, 108 - ox, 111);
    }
}


/***/ }),

/***/ "./src/game/dijkstra.ts":
/*!******************************!*\
  !*** ./src/game/dijkstra.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dijkstra: () => (/* binding */ dijkstra)
/* harmony export */ });
/* harmony import */ var _fibonacci_priority_queue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./fibonacci-priority-queue */ "./src/game/fibonacci-priority-queue.ts");

/**
 * Dijkstra's algorithm that computes:
 * 1) The distance to the seed node for every node in the graph.
 * 2) The immediate neighbor to follow to reach the seed.
 *
 * @param graph A Map whose keys are nodes and whose values are an array of edges.
 * @param seed The seed node from which all distances are calculated.
 * @returns A Map<T, { distance: number; link: T | null }> describing each node's
 *          distance and the neighbor to go to first on route to the seed.
 */
function dijkstra(graph, seed) {
    // Store the best-known distance for each node and the link to the first step back to seed
    const distances = new Map();
    const firstStepLink = new Map();
    // Priority queue to pick the node with the smallest distance
    const pq = new _fibonacci_priority_queue__WEBPACK_IMPORTED_MODULE_0__.FibonacciPriorityQueue();
    // We need to keep track of the FibNode handles to decrease their priorities later
    const nodeHandles = new Map();
    // Initialize all nodes
    for (const node of graph.keys()) {
        distances.set(node, Number.POSITIVE_INFINITY);
        firstStepLink.set(node, null);
        // Add to Fibonacci priority queue with an initially large priority
        const handle = pq.add(node, Number.POSITIVE_INFINITY);
        nodeHandles.set(node, handle);
    }
    // Set the seed node's distance to 0 and update priority
    distances.set(seed, 0);
    pq.decreasePriority(nodeHandles.get(seed), 0);
    // Dijkstra's main loop
    while (pq.size() > 0) {
        // Extract node with the smallest distance
        const fibNode = pq.extractMin();
        if (!fibNode)
            break; // No more nodes
        const currentNode = fibNode.key;
        const currentDistance = distances.get(currentNode);
        // Explore each neighbor
        const edges = graph.get(currentNode) || [];
        for (const { node: neighbor, weight } of edges) {
            const alt = currentDistance + weight;
            if (alt < distances.get(neighbor)) {
                // Found a better route to neighbor
                distances.set(neighbor, alt);
                firstStepLink.set(neighbor, currentNode);
                pq.decreasePriority(nodeHandles.get(neighbor), alt);
            }
        }
    }
    // Build the final map with distance and link
    const result = new Map();
    for (const node of graph.keys()) {
        result.set(node, {
            distance: distances.get(node),
            link: firstStepLink.get(node),
        });
    }
    return result;
}


/***/ }),

/***/ "./src/game/fibonacci-priority-queue.ts":
/*!**********************************************!*\
  !*** ./src/game/fibonacci-priority-queue.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FibNode: () => (/* binding */ FibNode),
/* harmony export */   FibonacciPriorityQueue: () => (/* binding */ FibonacciPriorityQueue)
/* harmony export */ });
class FibNode {
    key;
    priority;
    degree;
    parent;
    child;
    left;
    right;
    mark;
    constructor(key, priority) {
        this.key = key;
        this.priority = priority;
        this.degree = 0;
        this.parent = null;
        this.child = null;
        this.left = this;
        this.right = this;
        this.mark = false;
    }
}
class FibonacciPriorityQueue {
    min;
    nodeCount;
    constructor() {
        this.min = null;
        this.nodeCount = 0;
    }
    /**
     * Inserts a new node with the given key and priority.
     * Returns the newly created node.
     */
    add(key, priority) {
        const node = new FibNode(key, priority);
        // Merge this node into the root list
        if (!this.min) {
            this.min = node;
        }
        else {
            // Insert into the min's right position
            node.left = this.min;
            node.right = this.min.right;
            if (this.min.right) {
                this.min.right.left = node;
            }
            this.min.right = node;
            // Update min if necessary
            if (node.priority < this.min.priority) {
                this.min = node;
            }
        }
        this.nodeCount++;
        return node;
    }
    /**
     * Extracts the node with the smallest priority.
     * Returns the extracted node, or null if empty.
     */
    extractMin() {
        const z = this.min;
        if (!z) {
            return null;
        }
        // Move each child of z into the root list
        if (z.child) {
            let child = z.child;
            do {
                const nextChild = child.right;
                // Remove child from its sibling list
                child.left.right = child.right;
                child.right.left = child.left;
                // Add child to the root list
                child.left = this.min;
                child.right = this.min.right;
                if (this.min.right) {
                    this.min.right.left = child;
                }
                this.min.right = child;
                child.parent = null;
                child = nextChild;
            } while (child !== z.child);
        }
        // Remove z from the root list
        z.left.right = z.right;
        z.right.left = z.left;
        if (z === z.right) {
            this.min = null;
        }
        else {
            this.min = z.right;
            this.consolidate();
        }
        this.nodeCount--;
        return z;
    }
    /**
     * Decreases the priority of a given node to newPriority.
     * Assumes newPriority is strictly less than the node's current priority.
     */
    decreasePriority(node, newPriority) {
        if (newPriority > node.priority) {
            throw new Error('New priority must be lower than the current priority.');
        }
        node.priority = newPriority;
        const parent = node.parent;
        if (parent && node.priority < parent.priority) {
            this.cut(node, parent);
            this.cascadingCut(parent);
        }
        // Update min if needed
        if (this.min && node.priority < this.min.priority) {
            this.min = node;
        }
    }
    /**
     * Private method to merge the trees of the heap by degree.
     * Called after extracting the minimum.
     */
    consolidate() {
        const A = [];
        // Upper bound on degrees
        const maxDegree = Math.floor(Math.log2(this.nodeCount)) + 2;
        for (let i = 0; i < maxDegree; i++) {
            A[i] = null;
        }
        // Collect all root nodes in a list
        const roots = [];
        if (this.min) {
            let node = this.min;
            do {
                roots.push(node);
                node = node.right;
            } while (node !== this.min);
        }
        // For each root, merge with same degree
        for (const w of roots) {
            let x = w;
            let d = x.degree;
            while (A[d]) {
                let y = A[d];
                if (x.priority > y.priority) {
                    // Swap x and y
                    [x, y] = [y, x];
                }
                this.link(y, x);
                A[d] = null;
                d++;
            }
            A[d] = x;
        }
        // Rebuild the root list
        this.min = null;
        for (const node of A) {
            if (node) {
                if (!this.min) {
                    this.min = node;
                    node.left = node;
                    node.right = node;
                }
                else {
                    // Insert node into root list
                    node.left = this.min;
                    node.right = this.min.right;
                    if (this.min.right) {
                        this.min.right.left = node;
                    }
                    this.min.right = node;
                    if (node.priority < this.min.priority) {
                        this.min = node;
                    }
                }
            }
        }
    }
    /**
     * Private method to make node y a child of node x.
     */
    link(y, x) {
        // Remove y from the root list
        y.left.right = y.right;
        y.right.left = y.left;
        // Make y a child of x
        y.parent = x;
        if (!x.child) {
            x.child = y;
            y.left = y;
            y.right = y;
        }
        else {
            y.left = x.child;
            y.right = x.child.right;
            if (x.child.right) {
                x.child.right.left = y;
            }
            x.child.right = y;
        }
        x.degree++;
        y.mark = false;
    }
    /**
     * Private method to cut a node from its parent and move it to the root list.
     */
    cut(x, y) {
        // Remove x from child list of y
        if (x.right === x) {
            y.child = null;
        }
        else {
            x.left.right = x.right;
            x.right.left = x.left;
            if (y.child === x) {
                y.child = x.right;
            }
        }
        y.degree--;
        // Add x to root list
        x.left = this.min;
        x.right = this.min.right;
        if (this.min.right) {
            this.min.right.left = x;
        }
        this.min.right = x;
        x.parent = null;
        x.mark = false;
    }
    /**
     * Private method for recursively cutting marked parents.
     */
    cascadingCut(y) {
        const z = y.parent;
        if (z) {
            if (!y.mark) {
                y.mark = true;
            }
            else {
                this.cut(y, z);
                this.cascadingCut(z);
            }
        }
    }
    /**
     * Returns the number of elements in the queue.
     */
    size() {
        return this.nodeCount;
    }
    /**
     * Peeks at the minimum node without removing it.
     */
    peekMin() {
        return this.min;
    }
}


/***/ }),

/***/ "./src/game/game-state.ts":
/*!********************************!*\
  !*** ./src/game/game-state.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GameState: () => (/* binding */ GameState),
/* harmony export */   SceneState: () => (/* binding */ SceneState)
/* harmony export */ });
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/store */ "./src/store.ts");
/* harmony import */ var _harry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./harry */ "./src/game/harry.ts");
/* harmony import */ var _scorpion__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./scorpion */ "./src/game/scorpion.ts");
/* harmony import */ var _vine__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vine */ "./src/game/vine.ts");
/* harmony import */ var _pit__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pit */ "./src/game/pit.ts");
/* harmony import */ var _rolling_log__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./rolling-log */ "./src/game/rolling-log.ts");
/* harmony import */ var _stationary_log__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./stationary-log */ "./src/game/stationary-log.ts");
/* harmony import */ var _rattle__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./rattle */ "./src/game/rattle.ts");
/* harmony import */ var _cobra_and_fire__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./cobra-and-fire */ "./src/game/cobra-and-fire.ts");
/* harmony import */ var _treasure__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./treasure */ "./src/game/treasure.ts");
/* harmony import */ var _clock__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./clock */ "./src/game/clock.ts");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./map */ "./src/game/map.ts");
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @/graphics */ "./src/graphics.ts");













class SceneState {
    enteredLeft = true;
    treasure;
    constructor(sceneState = {
        enteredLeft: true,
        treasure: _map__WEBPACK_IMPORTED_MODULE_11__.TreasureType.NONE,
    }) {
        this.enteredLeft = sceneState.enteredLeft;
        this.treasure = sceneState.treasure;
    }
}
class GameState {
    sceneStates;
    harry;
    scorpion;
    vine;
    pit;
    rollingLog;
    stationaryLog;
    rattle;
    cobraAndFire;
    treasure;
    clock;
    scrollX;
    lastScrollX;
    ox;
    lastOx;
    nextOx;
    nextScene;
    lastNextScene;
    lastHarryUnderground;
    sceneAlpha;
    score;
    extraLives;
    gameOver;
    gameOverDelay;
    newHighScore;
    scoreColor;
    treasureCount;
    treasureMapIndex;
    constructor(gameState = {
        sceneStates: undefined,
        harry: undefined,
        scorpion: undefined,
        vine: undefined,
        pit: undefined,
        rollingLog: undefined,
        stationaryLog: undefined,
        rattle: undefined,
        cobraAndFire: undefined,
        treasure: undefined,
        clock: undefined,
        scrollX: 4,
        lastScrollX: 4,
        ox: 0,
        lastOx: 0,
        nextOx: 0,
        nextScene: 0,
        lastNextScene: 0,
        lastHarryUnderground: false,
        sceneAlpha: 1,
        score: 2000,
        extraLives: (_store__WEBPACK_IMPORTED_MODULE_0__.store.difficulty === _store__WEBPACK_IMPORTED_MODULE_0__.Difficulty.EASY) ? 4 : (_store__WEBPACK_IMPORTED_MODULE_0__.store.difficulty === _store__WEBPACK_IMPORTED_MODULE_0__.Difficulty.NORMAL) ? 3 : 2,
        gameOver: false,
        gameOverDelay: 180,
        newHighScore: false,
        scoreColor: _graphics__WEBPACK_IMPORTED_MODULE_12__.Colors.OFF_WHITE,
        treasureCount: 0,
        treasureMapIndex: 0,
    }) {
        this.sceneStates = new Array(_map__WEBPACK_IMPORTED_MODULE_11__.map.length);
        if (gameState.sceneStates?.length === _map__WEBPACK_IMPORTED_MODULE_11__.map.length) {
            for (let i = _map__WEBPACK_IMPORTED_MODULE_11__.map.length - 1; i >= 0; --i) {
                this.sceneStates[i] = new SceneState(gameState.sceneStates[i]);
            }
        }
        else {
            for (let i = _map__WEBPACK_IMPORTED_MODULE_11__.map.length - 1; i >= 0; --i) {
                this.sceneStates[i] = new SceneState({ enteredLeft: true, treasure: _map__WEBPACK_IMPORTED_MODULE_11__.map[i].treasure, });
            }
        }
        this.harry = new _harry__WEBPACK_IMPORTED_MODULE_1__.Harry(gameState.harry);
        this.scorpion = new _scorpion__WEBPACK_IMPORTED_MODULE_2__.Scorpion(gameState.scorpion);
        this.vine = new _vine__WEBPACK_IMPORTED_MODULE_3__.Vine(gameState.vine);
        this.pit = new _pit__WEBPACK_IMPORTED_MODULE_4__.Pit(gameState.pit);
        this.rollingLog = new _rolling_log__WEBPACK_IMPORTED_MODULE_5__.RollingLog(gameState.rollingLog);
        this.stationaryLog = new _stationary_log__WEBPACK_IMPORTED_MODULE_6__.StationaryLog(gameState.stationaryLog);
        this.rattle = new _rattle__WEBPACK_IMPORTED_MODULE_7__.Rattle(gameState.rattle);
        this.cobraAndFire = new _cobra_and_fire__WEBPACK_IMPORTED_MODULE_8__.CobraAndFire(gameState.cobraAndFire);
        this.treasure = new _treasure__WEBPACK_IMPORTED_MODULE_9__.Treasure(gameState.treasure);
        this.clock = new _clock__WEBPACK_IMPORTED_MODULE_10__.Clock(gameState.clock);
        this.scrollX = gameState.scrollX;
        this.lastScrollX = gameState.lastScrollX;
        this.ox = gameState.ox;
        this.lastOx = gameState.lastOx;
        this.nextOx = gameState.nextOx;
        this.nextScene = gameState.nextScene;
        this.lastNextScene = gameState.lastNextScene;
        this.lastHarryUnderground = gameState.lastHarryUnderground;
        this.sceneAlpha = gameState.sceneAlpha;
        this.score = gameState.score;
        this.extraLives = gameState.extraLives;
        this.gameOver = gameState.gameOver;
        this.gameOverDelay = gameState.gameOverDelay;
        this.newHighScore = gameState.newHighScore;
        this.scoreColor = gameState.scoreColor;
        this.treasureCount = gameState.treasureCount;
        ;
        this.treasureMapIndex = gameState.treasureMapIndex;
    }
    endGame() {
        this.gameOver = true;
        this.gameOverDelay = (this.treasureCount === 32) ? 600 : 180;
        _store__WEBPACK_IMPORTED_MODULE_0__.store.gameState = undefined;
        if (this.score > _store__WEBPACK_IMPORTED_MODULE_0__.store.highScores[_store__WEBPACK_IMPORTED_MODULE_0__.store.difficulty]) {
            this.newHighScore = true;
            _store__WEBPACK_IMPORTED_MODULE_0__.store.highScores[_store__WEBPACK_IMPORTED_MODULE_0__.store.difficulty] = this.score;
        }
    }
}


/***/ }),

/***/ "./src/game/game.ts":
/*!**************************!*\
  !*** ./src/game/game.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initGame: () => (/* binding */ initGame),
/* harmony export */   renderScreen: () => (/* binding */ renderScreen),
/* harmony export */   update: () => (/* binding */ update)
/* harmony export */ });
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./map */ "./src/game/map.ts");
/* harmony import */ var _game_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./game-state */ "./src/game/game-state.ts");
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/graphics */ "./src/graphics.ts");
/* harmony import */ var _math__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/math */ "./src/math.ts");
/* harmony import */ var _input__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/input */ "./src/input.ts");
/* harmony import */ var _treasure_map__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./treasure-map */ "./src/game/treasure-map.ts");
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/store */ "./src/store.ts");







const SCENE_ALPHA_DELTA = 1 / 30;
const MIN_SCROLL_DELTA = .5;
const SCROLL_MARGIN = 4;
const TRUNKS = [
    [0, 32, 92, 124],
    [8, 40, 84, 116],
    [16, 48, 76, 108],
    [20, 52, 72, 104],
];
let gs;
function initGame() {
    _store__WEBPACK_IMPORTED_MODULE_6__.store.gameState = gs = new _game_state__WEBPACK_IMPORTED_MODULE_1__.GameState(_store__WEBPACK_IMPORTED_MODULE_6__.store.gameState);
    (0,_treasure_map__WEBPACK_IMPORTED_MODULE_5__.updateTreasureMapIndex)(gs);
}
function update() {
    (0,_input__WEBPACK_IMPORTED_MODULE_4__.updateInput)(gs);
    if (gs.gameOver) {
        if (gs.newHighScore) {
            gs.scoreColor = (gs.scoreColor + 1) & 0xFF;
        }
        if (gs.gameOverDelay > 0) {
            --gs.gameOverDelay;
            return;
        }
        if (_input__WEBPACK_IMPORTED_MODULE_4__.upJustPressed || _input__WEBPACK_IMPORTED_MODULE_4__.downJustPressed || _input__WEBPACK_IMPORTED_MODULE_4__.leftJustPressed || _input__WEBPACK_IMPORTED_MODULE_4__.rightJustPressed || _input__WEBPACK_IMPORTED_MODULE_4__.jumpJustPressed) {
            initGame();
        }
        return;
    }
    gs.harry.teleported = false;
    const scene0 = gs.harry.scene;
    const scene1 = gs.nextScene;
    if (!gs.harry.isInjured()) {
        gs.clock.update();
        gs.rattle.update();
        gs.cobraAndFire.update(gs);
        gs.treasure.update(gs);
        gs.scorpion.update(gs);
        gs.vine.update(gs);
        gs.pit.update(gs);
        gs.rollingLog.update(gs);
        gs.stationaryLog.update(gs);
        if (gs.sceneAlpha < 1) {
            gs.sceneAlpha += SCENE_ALPHA_DELTA;
            if (gs.sceneAlpha > 1) {
                gs.sceneAlpha = 1;
            }
        }
    }
    gs.harry.update(gs);
    const underground = gs.harry.isUnderground();
    if (gs.lastHarryUnderground !== underground) {
        gs.lastHarryUnderground = underground;
        gs.lastNextScene = gs.nextScene;
        gs.sceneAlpha = (0,_math__WEBPACK_IMPORTED_MODULE_3__.clamp)(1 - gs.sceneAlpha, 0, 1);
    }
    const targetScrollX = Math.floor(gs.harry.absoluteX);
    if (targetScrollX < gs.scrollX - SCROLL_MARGIN) {
        if (gs.lastScrollX === targetScrollX || gs.harry.teleported) {
            gs.scrollX -= MIN_SCROLL_DELTA;
        }
        else {
            gs.scrollX -= Math.max(MIN_SCROLL_DELTA, gs.lastScrollX - targetScrollX);
        }
    }
    else if (targetScrollX > gs.scrollX + SCROLL_MARGIN) {
        if (gs.lastScrollX === targetScrollX || gs.harry.teleported) {
            gs.scrollX += MIN_SCROLL_DELTA;
        }
        else {
            gs.scrollX += Math.max(MIN_SCROLL_DELTA, targetScrollX - gs.lastScrollX);
        }
    }
    gs.lastScrollX = targetScrollX;
    gs.ox = Math.floor(gs.harry.x) - 68 + Math.floor(gs.scrollX) - targetScrollX;
    if (gs.lastOx !== gs.ox) {
        gs.rollingLog.sync();
        gs.lastOx = gs.ox;
    }
    if (gs.ox < 0) {
        gs.nextOx = gs.ox + _graphics__WEBPACK_IMPORTED_MODULE_2__.Resolution.WIDTH;
        gs.nextScene = gs.harry.scene - (underground ? 3 : 1);
        if (gs.nextScene < 0) {
            gs.nextScene += _map__WEBPACK_IMPORTED_MODULE_0__.map.length;
        }
        if (gs.nextScene !== scene0 && gs.nextScene !== scene1) {
            gs.sceneStates[gs.nextScene].enteredLeft = false;
        }
    }
    else {
        gs.nextOx = gs.ox - _graphics__WEBPACK_IMPORTED_MODULE_2__.Resolution.WIDTH;
        gs.nextScene = gs.harry.scene + (underground ? 3 : 1);
        if (gs.nextScene >= _map__WEBPACK_IMPORTED_MODULE_0__.map.length) {
            gs.nextScene -= _map__WEBPACK_IMPORTED_MODULE_0__.map.length;
        }
        if (gs.nextScene !== scene0 && gs.nextScene !== scene1) {
            gs.sceneStates[gs.nextScene].enteredLeft = true;
        }
    }
}
function renderStrips(ctx) {
    ctx.fillStyle = _graphics__WEBPACK_IMPORTED_MODULE_2__.colors[_graphics__WEBPACK_IMPORTED_MODULE_2__.Colors.GREEN];
    ctx.fillRect(0, 51, _graphics__WEBPACK_IMPORTED_MODULE_2__.Resolution.WIDTH, 60);
    ctx.fillStyle = _graphics__WEBPACK_IMPORTED_MODULE_2__.colors[_graphics__WEBPACK_IMPORTED_MODULE_2__.Colors.LIGHT_YELLOW];
    ctx.fillRect(0, 111, _graphics__WEBPACK_IMPORTED_MODULE_2__.Resolution.WIDTH, 16);
    ctx.fillStyle = _graphics__WEBPACK_IMPORTED_MODULE_2__.colors[_graphics__WEBPACK_IMPORTED_MODULE_2__.Colors.DARK_YELLOW];
    ctx.fillRect(0, 127, _graphics__WEBPACK_IMPORTED_MODULE_2__.Resolution.WIDTH, 15);
    ctx.fillRect(0, 174, _graphics__WEBPACK_IMPORTED_MODULE_2__.Resolution.WIDTH, 6);
    ctx.fillStyle = _graphics__WEBPACK_IMPORTED_MODULE_2__.colors[_graphics__WEBPACK_IMPORTED_MODULE_2__.Colors.BLACK];
    ctx.fillRect(0, 142, _graphics__WEBPACK_IMPORTED_MODULE_2__.Resolution.WIDTH, 32);
}
function renderBackground(ctx, scene, ox) {
    const { trees, ladder, holes, wall, vine, pit, obsticles, scorpion } = _map__WEBPACK_IMPORTED_MODULE_0__.map[scene];
    const trunks = TRUNKS[trees];
    if (_store__WEBPACK_IMPORTED_MODULE_6__.store.difficulty === _store__WEBPACK_IMPORTED_MODULE_6__.Difficulty.EASY) {
        const cells = _treasure_map__WEBPACK_IMPORTED_MODULE_5__.treasureCells[gs.treasureMapIndex][scene];
        ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_2__.arrowSprites[_treasure_map__WEBPACK_IMPORTED_MODULE_5__.Tier.UPPER][cells[_treasure_map__WEBPACK_IMPORTED_MODULE_5__.Tier.UPPER].direction], 60 - ox, 75);
        const lowerDirection = cells[_treasure_map__WEBPACK_IMPORTED_MODULE_5__.Tier.LOWER].direction;
        let lowerOffset;
        switch (wall) {
            case _map__WEBPACK_IMPORTED_MODULE_0__.WallType.LEFT:
                lowerOffset = (lowerDirection === _treasure_map__WEBPACK_IMPORTED_MODULE_5__.Direction.RIGHT || lowerDirection === _treasure_map__WEBPACK_IMPORTED_MODULE_5__.Direction.LEFT) ? 52 : 53;
                break;
            case _map__WEBPACK_IMPORTED_MODULE_0__.WallType.RIGHT:
                lowerOffset = 68;
                break;
            default:
                lowerOffset = 60;
                break;
        }
        ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_2__.arrowSprites[_treasure_map__WEBPACK_IMPORTED_MODULE_5__.Tier.LOWER][cells[_treasure_map__WEBPACK_IMPORTED_MODULE_5__.Tier.LOWER].direction], lowerOffset - ox, 150);
    }
    ctx.fillStyle = _graphics__WEBPACK_IMPORTED_MODULE_2__.colors[_graphics__WEBPACK_IMPORTED_MODULE_2__.Colors.DARK_BROWN];
    for (let i = 3; i >= 0; --i) {
        ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_2__.branchesSprite, trunks[i] - 2 - ox, 51);
        ctx.fillRect(trunks[i] - ox, 59, 4, 52);
    }
    if (ladder) {
        ctx.fillStyle = _graphics__WEBPACK_IMPORTED_MODULE_2__.colors[_graphics__WEBPACK_IMPORTED_MODULE_2__.Colors.BLACK];
        ctx.fillRect(60 - ox, 116, 8, 6);
        ctx.fillRect(60 - ox, 127, 8, 15);
        ctx.fillStyle = _graphics__WEBPACK_IMPORTED_MODULE_2__.colors[_graphics__WEBPACK_IMPORTED_MODULE_2__.Colors.DARK_YELLOW];
        for (let i = 10, y = 130; i >= 0; --i, y += 4) {
            ctx.fillRect(62 - ox, y, 4, 2);
        }
    }
    if (holes) {
        ctx.fillStyle = _graphics__WEBPACK_IMPORTED_MODULE_2__.colors[_graphics__WEBPACK_IMPORTED_MODULE_2__.Colors.BLACK];
        ctx.fillRect(32 - ox, 116, 12, 6);
        ctx.fillRect(32 - ox, 127, 12, 15);
        ctx.fillRect(84 - ox, 116, 12, 6);
        ctx.fillRect(84 - ox, 127, 12, 15);
    }
    switch (wall) {
        case _map__WEBPACK_IMPORTED_MODULE_0__.WallType.LEFT:
            ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_2__.wallSprite, 2 - ox, 142);
            ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_2__.wallSprite, 2 - ox, 158);
            break;
        case _map__WEBPACK_IMPORTED_MODULE_0__.WallType.RIGHT:
            ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_2__.wallSprite, 120 - ox, 142);
            ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_2__.wallSprite, 120 - ox, 158);
            break;
    }
    if (scorpion) {
        gs.scorpion.render(gs, ctx, ox);
    }
    if (vine) {
        gs.vine.render(gs, ctx, ox);
    }
    if (pit !== _map__WEBPACK_IMPORTED_MODULE_0__.PitType.NONE) {
        gs.pit.render(gs, ctx, scene, ox);
    }
    if (gs.sceneStates[scene].treasure !== _map__WEBPACK_IMPORTED_MODULE_0__.TreasureType.NONE) {
        gs.treasure.render(gs, ctx, scene, ox);
    }
    switch (obsticles) {
        case _map__WEBPACK_IMPORTED_MODULE_0__.ObsticleType.ONE_ROLLING_LOG:
        case _map__WEBPACK_IMPORTED_MODULE_0__.ObsticleType.TWO_ROLLING_LOGS_NEAR:
        case _map__WEBPACK_IMPORTED_MODULE_0__.ObsticleType.TWO_ROLLING_LOGS_FAR:
        case _map__WEBPACK_IMPORTED_MODULE_0__.ObsticleType.THREE_ROLLING_LOGS:
            gs.rollingLog.render(gs, ctx, scene, ox);
            break;
        case _map__WEBPACK_IMPORTED_MODULE_0__.ObsticleType.ONE_STATIONARY_LOG:
        case _map__WEBPACK_IMPORTED_MODULE_0__.ObsticleType.THREE_STATIONARY_LOGS:
            gs.stationaryLog.render(gs, ctx, scene, ox);
            break;
        case _map__WEBPACK_IMPORTED_MODULE_0__.ObsticleType.COBRA:
        case _map__WEBPACK_IMPORTED_MODULE_0__.ObsticleType.FIRE:
            gs.cobraAndFire.render(gs, ctx, scene, ox);
            break;
    }
}
function renderLeaves(ctx, scene, ox) {
    const { trees } = _map__WEBPACK_IMPORTED_MODULE_0__.map[scene];
    ctx.fillStyle = _graphics__WEBPACK_IMPORTED_MODULE_2__.colors[_graphics__WEBPACK_IMPORTED_MODULE_2__.Colors.DARK_GREEN];
    ctx.fillRect(0, 0, _graphics__WEBPACK_IMPORTED_MODULE_2__.Resolution.WIDTH, 51);
    for (let i = 1; i < 5; ++i) {
        ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_2__.leavesSprites[(i & 1) ^ 1][trees], ((i - 1) << 5) - ox, 51, 32, 8);
    }
    ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_2__.leavesSprites[0][trees], 0, 0, 2, 4, 128 - ox, 51, 8, 8);
}
function renderHUD(ctx) {
    (0,_graphics__WEBPACK_IMPORTED_MODULE_2__.printNumber)(ctx, gs.score, 45, 3, gs.scoreColor);
    gs.clock.render(ctx);
    ctx.fillStyle = _graphics__WEBPACK_IMPORTED_MODULE_2__.colors[_graphics__WEBPACK_IMPORTED_MODULE_2__.Colors.OFF_WHITE];
    for (let i = gs.extraLives - 1, x = 5; i >= 0; --i, x += 2) {
        ctx.fillRect(x, 16, 1, 8);
    }
    if (_store__WEBPACK_IMPORTED_MODULE_6__.store.difficulty !== _store__WEBPACK_IMPORTED_MODULE_6__.Difficulty.HARD) {
        (0,_graphics__WEBPACK_IMPORTED_MODULE_2__.printNumber)(ctx, gs.harry.scene + 1, 116, 3, _graphics__WEBPACK_IMPORTED_MODULE_2__.Colors.OFF_WHITE);
        (0,_graphics__WEBPACK_IMPORTED_MODULE_2__.printNumber)(ctx, gs.treasureCount, 92, 16, _graphics__WEBPACK_IMPORTED_MODULE_2__.Colors.OFF_WHITE);
        const sprites = _graphics__WEBPACK_IMPORTED_MODULE_2__.charSprites[_graphics__WEBPACK_IMPORTED_MODULE_2__.Colors.OFF_WHITE];
        ctx.drawImage(sprites[10], 100, 16);
        ctx.drawImage(sprites[3], 108, 16);
        ctx.drawImage(sprites[2], 116, 16);
    }
}
function renderScreen(ctx) {
    renderStrips(ctx);
    renderBackground(ctx, gs.harry.scene, gs.ox);
    if (gs.sceneAlpha === 1) {
        renderBackground(ctx, gs.nextScene, gs.nextOx);
    }
    else {
        ctx.globalAlpha = 1 - gs.sceneAlpha;
        renderBackground(ctx, gs.lastNextScene, gs.nextOx);
        ctx.globalAlpha = gs.sceneAlpha;
        renderBackground(ctx, gs.nextScene, gs.nextOx);
        ctx.globalAlpha = 1;
    }
    gs.harry.render(gs, ctx, gs.ox);
    renderLeaves(ctx, gs.harry.scene, gs.ox);
    if (gs.sceneAlpha === 1) {
        renderLeaves(ctx, gs.nextScene, gs.nextOx);
    }
    else {
        ctx.globalAlpha = 1 - gs.sceneAlpha;
        renderLeaves(ctx, gs.lastNextScene, gs.nextOx);
        ctx.globalAlpha = gs.sceneAlpha;
        renderLeaves(ctx, gs.nextScene, gs.nextOx);
        ctx.globalAlpha = 1;
    }
    renderHUD(ctx);
}


/***/ }),

/***/ "./src/game/harry.ts":
/*!***************************!*\
  !*** ./src/game/harry.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Harry: () => (/* binding */ Harry)
/* harmony export */ });
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/graphics */ "./src/graphics.ts");
/* harmony import */ var _input__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/input */ "./src/input.ts");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./map */ "./src/game/map.ts");
/* harmony import */ var _math__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/math */ "./src/math.ts");
/* harmony import */ var _audio__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/audio */ "./src/audio.ts");





const Y_UPPER_LEVEL = 119;
const Y_LOWER_LEVEL = 174;
const Y_HOLE_BOTTOM = 157;
const JUMP_ARC_BASE = 17;
const JUMP_ARC_HEIGHT = 11;
const T = JUMP_ARC_BASE;
const G = 2 * JUMP_ARC_HEIGHT / (T * T);
const VY0 = -G * T;
const INJURED_DELAY = 20; // 134;
const X_SPAWN_MARGIN = 38;
var MainState;
(function (MainState) {
    MainState[MainState["STANDING"] = 0] = "STANDING";
    MainState[MainState["FALLING"] = 1] = "FALLING";
    MainState[MainState["CLIMBING"] = 2] = "CLIMBING";
    MainState[MainState["INJURED"] = 3] = "INJURED";
    MainState[MainState["SWINGING"] = 4] = "SWINGING";
    MainState[MainState["SINKING"] = 5] = "SINKING";
    MainState[MainState["KNEELING"] = 6] = "KNEELING";
    MainState[MainState["SKIDDING"] = 7] = "SKIDDING";
})(MainState || (MainState = {}));
class Harry {
    mainState;
    lastMainState;
    scene;
    absoluteX;
    x;
    y;
    vy;
    dir;
    sprite;
    runCounter;
    climbCounter;
    teleported;
    injuredCounter;
    tunnelSpawning;
    releasedVine;
    swallow;
    kneeling;
    kneelingDelay;
    rightTouchMeansDown;
    rollingDelay;
    constructor(harry = {
        mainState: MainState.STANDING,
        lastMainState: MainState.STANDING,
        scene: 0,
        absoluteX: 4,
        x: 4,
        y: Y_UPPER_LEVEL,
        vy: 0,
        dir: 0,
        sprite: 0,
        runCounter: 0,
        climbCounter: 0,
        teleported: false,
        injuredCounter: 0,
        tunnelSpawning: false,
        releasedVine: false,
        swallow: false,
        kneeling: false,
        kneelingDelay: false,
        rightTouchMeansDown: false,
        rollingDelay: 0,
    }) {
        this.mainState = harry.mainState;
        this.lastMainState = harry.lastMainState;
        this.scene = harry.scene;
        this.absoluteX = harry.absoluteX;
        this.x = harry.x;
        this.y = harry.y;
        this.vy = harry.vy;
        this.dir = harry.dir;
        this.sprite = harry.sprite;
        this.runCounter = harry.runCounter;
        this.climbCounter = harry.climbCounter;
        this.teleported = harry.teleported;
        this.injuredCounter = harry.injuredCounter;
        this.tunnelSpawning = harry.tunnelSpawning;
        this.releasedVine = harry.releasedVine;
        this.swallow = harry.swallow;
        this.kneeling = harry.kneeling;
        this.kneelingDelay = harry.kneelingDelay;
        this.rightTouchMeansDown = harry.rightTouchMeansDown;
        this.rollingDelay = harry.rollingDelay;
    }
    intersects(mask, x, y) {
        return (0,_math__WEBPACK_IMPORTED_MODULE_3__.spritesIntersect)(mask, x, y, _graphics__WEBPACK_IMPORTED_MODULE_0__.harryMasks[this.dir][this.sprite], Math.floor(this.x) - 4, Math.floor(this.y) - 22);
    }
    canBeHitByRollingLog() {
        return this.mainState === MainState.STANDING || this.mainState === MainState.KNEELING
            || this.mainState === MainState.CLIMBING;
    }
    isClimbing() {
        return this.mainState === MainState.CLIMBING;
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
    teleport(x) {
        this.teleported = true;
        this.setX(x);
    }
    setX(x) {
        this.incrementX(x - this.x);
    }
    incrementX(deltaX) {
        this.absoluteX += deltaX;
        this.x += deltaX;
        if (this.x < 0) {
            this.x += _graphics__WEBPACK_IMPORTED_MODULE_0__.Resolution.WIDTH;
            if (this.y > Y_UPPER_LEVEL) {
                this.scene -= 3;
            }
            else {
                --this.scene;
            }
            if (this.scene < 0) {
                this.scene += _map__WEBPACK_IMPORTED_MODULE_2__.map.length;
            }
        }
        else if (this.x >= _graphics__WEBPACK_IMPORTED_MODULE_0__.Resolution.WIDTH) {
            this.x -= _graphics__WEBPACK_IMPORTED_MODULE_0__.Resolution.WIDTH;
            if (this.y > Y_UPPER_LEVEL) {
                this.scene += 3;
            }
            else {
                ++this.scene;
            }
            if (this.scene >= _map__WEBPACK_IMPORTED_MODULE_2__.map.length) {
                this.scene -= _map__WEBPACK_IMPORTED_MODULE_2__.map.length;
            }
        }
    }
    startFalling(gs, v0) {
        this.mainState = MainState.FALLING;
        this.y += v0;
        this.vy = G + v0;
        this.sprite = 2;
        this.kneeling = false;
        this.updateShift(gs);
    }
    endFalling(gs, y) {
        this.mainState = MainState.STANDING;
        this.y = y;
        this.vy = 0;
        this.sprite = 2;
        this.runCounter = 0;
        this.tunnelSpawning = false;
        this.releasedVine = false;
        this.updateShift(gs);
    }
    startClimbing(y) {
        this.mainState = MainState.CLIMBING;
        this.teleport(64);
        this.y = y;
        this.sprite = 7;
        this.kneeling = false;
        this.climbCounter = 0;
        this.rightTouchMeansDown = (y === 134) !== (this.dir !== 0);
    }
    endClimbing(x, y, dir) {
        this.mainState = MainState.STANDING;
        this.teleport(x);
        this.y = y;
        this.runCounter = 0;
        this.sprite = 0;
        this.dir = dir;
    }
    updateShift(gs) {
        const { wall } = _map__WEBPACK_IMPORTED_MODULE_2__.map[this.scene];
        let shifting = false;
        if (_input__WEBPACK_IMPORTED_MODULE_1__.rightPressed) {
            let moveRight = true;
            if (this.y >= 120 && ((wall === _map__WEBPACK_IMPORTED_MODULE_2__.WallType.RIGHT && this.x === 119)
                || (wall === _map__WEBPACK_IMPORTED_MODULE_2__.WallType.LEFT && this.x === 1))) {
                moveRight = false;
            }
            else if (this.y > Y_UPPER_LEVEL && this.y <= Y_HOLE_BOTTOM) {
                if (this.x >= 32 && this.x <= 44) {
                    if (this.x > 43.5) {
                        moveRight = false;
                    }
                }
                else if (this.x >= 84 && this.x <= 96) {
                    if (this.x > 95.5) {
                        moveRight = false;
                    }
                }
            }
            if (moveRight) {
                this.incrementX(.5);
                this.dir = 0;
                shifting = true;
            }
        }
        else if (_input__WEBPACK_IMPORTED_MODULE_1__.leftPressed) {
            let moveLeft = true;
            if (this.y >= 120 && ((wall === _map__WEBPACK_IMPORTED_MODULE_2__.WallType.LEFT && this.x === 10)
                || (wall === _map__WEBPACK_IMPORTED_MODULE_2__.WallType.RIGHT && this.x === 128))) {
                moveLeft = false;
            }
            else if (this.y > Y_UPPER_LEVEL && this.y <= Y_HOLE_BOTTOM) {
                if (this.x >= 32 && this.x <= 43) {
                    if (this.x < 32.5) {
                        moveLeft = false;
                    }
                }
                else if (this.x >= 84 && this.x <= 95) {
                    if (this.x < 84.5) {
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
    canStartClimbingUp() {
        return this.mainState == MainState.STANDING && this.y === Y_LOWER_LEVEL && this.x >= 56 && this.x <= 72
            && !(_input__WEBPACK_IMPORTED_MODULE_1__.leftPressed || _input__WEBPACK_IMPORTED_MODULE_1__.rightPressed || _input__WEBPACK_IMPORTED_MODULE_1__.upPressed || _input__WEBPACK_IMPORTED_MODULE_1__.downPressed || _input__WEBPACK_IMPORTED_MODULE_1__.jumpPressed);
    }
    updateStanding(gs) {
        const { ladder, holes } = _map__WEBPACK_IMPORTED_MODULE_2__.map[this.scene];
        if (holes && this.y === Y_UPPER_LEVEL && ((this.x >= 32 && this.x <= 44) || (this.x >= 84 && this.x <= 96))) {
            this.startFalling(gs, G);
            gs.score = Math.max(0, gs.score - 100);
            (0,_audio__WEBPACK_IMPORTED_MODULE_4__.play)('sfx/fall.mp3');
            return;
        }
        if (_input__WEBPACK_IMPORTED_MODULE_1__.jumpPressed) {
            this.startFalling(gs, VY0);
            (0,_audio__WEBPACK_IMPORTED_MODULE_4__.play)('sfx/jump.mp3');
            return;
        }
        if (ladder) {
            if (this.y === Y_UPPER_LEVEL && ((this.x >= 60 && this.x <= 67)
                || (((_input__WEBPACK_IMPORTED_MODULE_1__.downPressed && !(_input__WEBPACK_IMPORTED_MODULE_1__.leftPressed || _input__WEBPACK_IMPORTED_MODULE_1__.rightPressed)) || _input__WEBPACK_IMPORTED_MODULE_1__.downJustPressed)
                    && this.x >= 56 && this.x <= 72))) {
                this.startClimbing(134);
                return;
            }
            if (this.y === Y_LOWER_LEVEL && ((_input__WEBPACK_IMPORTED_MODULE_1__.upPressed && !(_input__WEBPACK_IMPORTED_MODULE_1__.leftPressed || _input__WEBPACK_IMPORTED_MODULE_1__.rightPressed)) || _input__WEBPACK_IMPORTED_MODULE_1__.upJustPressed)
                && this.x >= 56 && this.x <= 72) {
                this.startClimbing(this.y);
                return;
            }
        }
        if (this.updateShift(gs)) {
            if (this.runCounter === 0 && ++this.sprite === 6) {
                this.sprite = 1;
            }
            this.runCounter = (this.runCounter + 1) & 3;
        }
        else {
            this.runCounter = 0;
            this.sprite = (this.lastMainState === MainState.FALLING) ? 2 : 0;
        }
    }
    updateFalling(gs) {
        const { ladder, holes, wall } = _map__WEBPACK_IMPORTED_MODULE_2__.map[this.scene];
        if (ladder && this.y >= 134 && this.y < Y_LOWER_LEVEL && this.x >= 60 && this.x <= 67) {
            const stepsToTop = Math.floor((this.y - 134) / 4);
            this.startClimbing(134 + 4 * stepsToTop);
            this.dir ^= stepsToTop & 1;
            return;
        }
        const nextY = this.y + this.vy;
        if (this.y <= Y_UPPER_LEVEL && nextY >= Y_UPPER_LEVEL) {
            if (ladder && this.x >= 60 && this.x <= 67) {
                this.startClimbing(134);
                return;
            }
            if (!holes || this.x < 32 || this.x > 95 || (this.x > 43 && this.x < 84)) {
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
    climbUpward() {
        if (this.y === 134) {
            this.climbCounter = 0;
        }
        else if (++this.climbCounter >= 8) {
            this.climbCounter = 0;
            this.y -= 4;
            this.dir ^= 1;
        }
    }
    climbDownward() {
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
    updateClimbing(gs) {
        if (this.y <= 142) {
            if (this.y === 134 && _input__WEBPACK_IMPORTED_MODULE_1__.upPressed) {
                if (this.rightTouchMeansDown) {
                    this.endClimbing(59, Y_UPPER_LEVEL, 1);
                }
                else {
                    this.endClimbing(69, Y_UPPER_LEVEL, 0);
                }
                return;
            }
            if (_input__WEBPACK_IMPORTED_MODULE_1__.rightJustPressed || (_input__WEBPACK_IMPORTED_MODULE_1__.jumpJustPressed && this.dir === 0)) {
                this.endClimbing(69, Y_UPPER_LEVEL, 0);
                return;
            }
            if (_input__WEBPACK_IMPORTED_MODULE_1__.leftJustPressed || (_input__WEBPACK_IMPORTED_MODULE_1__.jumpJustPressed && this.dir === 1)) {
                this.endClimbing(59, Y_UPPER_LEVEL, 1);
                return;
            }
        }
        if (this.y >= 170 && !_input__WEBPACK_IMPORTED_MODULE_1__.upPressed && (_input__WEBPACK_IMPORTED_MODULE_1__.leftPressed || _input__WEBPACK_IMPORTED_MODULE_1__.rightPressed)) {
            this.endClimbing(this.x, Y_LOWER_LEVEL, this.dir);
            return;
        }
        if (_input__WEBPACK_IMPORTED_MODULE_1__.upPressed) {
            this.climbUpward();
        }
        else if (_input__WEBPACK_IMPORTED_MODULE_1__.downPressed && this.climbDownward()) {
            return;
        }
    }
    isInjured() {
        return this.mainState === MainState.INJURED || this.mainState === MainState.SINKING;
    }
    injure() {
        this.mainState = MainState.INJURED;
        this.injuredCounter = INJURED_DELAY;
        (0,_audio__WEBPACK_IMPORTED_MODULE_4__.play)('sfx/die.mp3');
    }
    startTunnelSpawn(gs) {
        if (gs.extraLives === 0) {
            gs.endGame();
            return;
        }
        --gs.extraLives;
        this.mainState = MainState.FALLING;
        this.tunnelSpawning = true;
        let spawnX;
        if (this.dir === 0) {
            spawnX = this.x - X_SPAWN_MARGIN;
            if (spawnX < 4) {
                spawnX = this.x + X_SPAWN_MARGIN;
            }
        }
        else {
            spawnX = this.x + X_SPAWN_MARGIN;
            if (spawnX >= 140) {
                spawnX = this.x - X_SPAWN_MARGIN;
            }
        }
        this.teleport(spawnX);
        this.y = 149;
        this.vy = 0;
        this.sprite = 2;
    }
    startTreeSpawn(gs) {
        if (gs.extraLives === 0) {
            gs.endGame();
            return;
        }
        --gs.extraLives;
        this.mainState = MainState.FALLING;
        this.teleport((this.dir === 0) ? 8 : 127);
        this.y = 51;
        this.vy = 0;
        this.sprite = 2;
        this.swallow = false;
    }
    updateInjured(gs) {
        if (--this.injuredCounter === 0) {
            if (this.isUnderground()) {
                this.startTunnelSpawn(gs);
            }
            else {
                this.startTreeSpawn(gs);
            }
            return;
        }
    }
    swing() {
        this.mainState = MainState.SWINGING;
        this.sprite = 6;
        this.teleported = true;
        (0,_audio__WEBPACK_IMPORTED_MODULE_4__.play)('sfx/swing.mp3');
    }
    updateSwinging(gs) {
        const v = _graphics__WEBPACK_IMPORTED_MODULE_0__.vineStates[gs.vine.sprite];
        this.setX(this.dir === 0 ? v.x + 1 : v.x);
        this.y = v.y + 17;
        if ((this.dir === 0 && _input__WEBPACK_IMPORTED_MODULE_1__.rightJustPressed) || (this.dir === 1 && _input__WEBPACK_IMPORTED_MODULE_1__.leftJustPressed)) {
            this.startFalling(gs, v.vy);
            this.releasedVine = true;
            return;
        }
    }
    checkSink(xMin, xMax) {
        const X = Math.floor(this.x);
        if (this.mainState !== MainState.STANDING || this.y !== Y_UPPER_LEVEL || X < xMin || X > xMax) {
            return false;
        }
        this.mainState = MainState.SINKING;
        this.sprite = 0;
        (0,_audio__WEBPACK_IMPORTED_MODULE_4__.play)('sfx/die.mp3');
        return true;
    }
    checkSwallow(xMin, xMax) {
        const X = Math.floor(this.x);
        if (X < xMin || X > xMax) {
            return;
        }
        this.swallow = true;
    }
    updateSinking(gs) {
        if (++this.y > 143 + INJURED_DELAY) {
            this.startTreeSpawn(gs);
            return;
        }
    }
    startKnelling() {
        this.mainState = MainState.KNEELING;
        this.sprite = 5;
        this.kneeling = true;
        this.kneelingDelay = true;
    }
    rolled() {
        (0,_audio__WEBPACK_IMPORTED_MODULE_4__.play)('sfx/kneel.mp3', true);
        this.rollingDelay = 2;
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
        (0,_audio__WEBPACK_IMPORTED_MODULE_4__.play)('sfx/kneel.mp3', true);
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
    updateKneeling(gs) {
        if (this.kneelingDelay) {
            this.kneelingDelay = false;
        }
        else {
            this.mainState = MainState.STANDING;
            this.sprite = 0;
            this.kneeling = false;
            (0,_audio__WEBPACK_IMPORTED_MODULE_4__.stop)('sfx/kneel.mp3');
        }
    }
    updateSkidding(gs) {
        this.updateKneeling(gs);
        this.updateStanding(gs);
    }
    update(gs) {
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
        if (this.rollingDelay > 0 && --this.rollingDelay === 0) {
            (0,_audio__WEBPACK_IMPORTED_MODULE_4__.stop)('sfx/kneel.mp3');
        }
    }
    render(gs, ctx, ox) {
        const sprite = _graphics__WEBPACK_IMPORTED_MODULE_0__.harrySprites[this.dir][this.kneeling ? 5 : this.sprite];
        const X = Math.floor(this.x) - 4 - ox;
        const Y = this.kneeling ? Y_UPPER_LEVEL - 17 : Math.floor(this.y) - 22;
        if (this.mainState === MainState.SINKING) {
            if (this.swallow) {
                if (Y < 121) {
                    ctx.drawImage(sprite, 0, 0, 8, 121 - Y, X, Y, 8, 121 - Y);
                    const crocImages = _graphics__WEBPACK_IMPORTED_MODULE_0__.crocSprites[gs.sceneStates[this.scene].enteredLeft ? 0 : 1];
                    ctx.drawImage(crocImages[0], 0, 9, 8, 2, 44 - ox, 120, 8, 2);
                    ctx.drawImage(crocImages[0], 0, 9, 8, 2, 60 - ox, 120, 8, 2);
                    ctx.drawImage(crocImages[0], 0, 9, 8, 2, 76 - ox, 120, 8, 2);
                }
            }
            else if (Y < 119) {
                ctx.drawImage(sprite, 0, 0, 8, 119 - Y, X, Y, 8, 119 - Y);
            }
        }
        else if (this.tunnelSpawning && Y >= 127 && Y < 142) {
            ctx.drawImage(sprite, 0, 142 - Y, 8, Y - 100, X, 142, 8, Y - 100);
        }
        else if (Y < 101 || Y >= 127) {
            ctx.drawImage(sprite, X, Y);
        }
        else {
            if (Y < 122) {
                ctx.drawImage(sprite, 0, 0, 8, 122 - Y, X, Y, 8, 122 - Y);
            }
            if (Y > 106) {
                ctx.drawImage(sprite, 0, 127 - Y, 8, Y - 105, X, 127, 8, Y - 105);
            }
        }
    }
}


/***/ }),

/***/ "./src/game/map.ts":
/*!*************************!*\
  !*** ./src/game/map.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ObsticleType: () => (/* binding */ ObsticleType),
/* harmony export */   PitType: () => (/* binding */ PitType),
/* harmony export */   Scene: () => (/* binding */ Scene),
/* harmony export */   TreasureType: () => (/* binding */ TreasureType),
/* harmony export */   WallType: () => (/* binding */ WallType),
/* harmony export */   map: () => (/* binding */ map)
/* harmony export */ });
const map = new Array(255);
var PitType;
(function (PitType) {
    PitType[PitType["TAR"] = 0] = "TAR";
    PitType[PitType["QUICKSAND"] = 1] = "QUICKSAND";
    PitType[PitType["CROCS"] = 2] = "CROCS";
    PitType[PitType["SHIFTING_TAR"] = 3] = "SHIFTING_TAR";
    PitType[PitType["SHIFTING_QUICKSAND"] = 4] = "SHIFTING_QUICKSAND";
    PitType[PitType["NONE"] = 5] = "NONE";
})(PitType || (PitType = {}));
var TreasureType;
(function (TreasureType) {
    TreasureType[TreasureType["MONEY_BAG"] = 0] = "MONEY_BAG";
    TreasureType[TreasureType["SILVER_BRICK"] = 1] = "SILVER_BRICK";
    TreasureType[TreasureType["GOLD_BRICK"] = 2] = "GOLD_BRICK";
    TreasureType[TreasureType["DIAMOND_RING"] = 3] = "DIAMOND_RING";
    TreasureType[TreasureType["NONE"] = 4] = "NONE";
})(TreasureType || (TreasureType = {}));
var ObsticleType;
(function (ObsticleType) {
    ObsticleType[ObsticleType["ONE_ROLLING_LOG"] = 0] = "ONE_ROLLING_LOG";
    ObsticleType[ObsticleType["TWO_ROLLING_LOGS_NEAR"] = 1] = "TWO_ROLLING_LOGS_NEAR";
    ObsticleType[ObsticleType["TWO_ROLLING_LOGS_FAR"] = 2] = "TWO_ROLLING_LOGS_FAR";
    ObsticleType[ObsticleType["THREE_ROLLING_LOGS"] = 3] = "THREE_ROLLING_LOGS";
    ObsticleType[ObsticleType["ONE_STATIONARY_LOG"] = 4] = "ONE_STATIONARY_LOG";
    ObsticleType[ObsticleType["THREE_STATIONARY_LOGS"] = 5] = "THREE_STATIONARY_LOGS";
    ObsticleType[ObsticleType["FIRE"] = 6] = "FIRE";
    ObsticleType[ObsticleType["COBRA"] = 7] = "COBRA";
    ObsticleType[ObsticleType["NONE"] = 8] = "NONE";
})(ObsticleType || (ObsticleType = {}));
var WallType;
(function (WallType) {
    WallType[WallType["LEFT"] = 0] = "LEFT";
    WallType[WallType["RIGHT"] = 1] = "RIGHT";
    WallType[WallType["NONE"] = 2] = "NONE";
})(WallType || (WallType = {}));
class Scene {
    trees;
    ladder;
    holes;
    vine;
    pit;
    treasure;
    obsticles;
    wall;
    scorpion;
    difficulty;
    constructor(trees, ladder, holes, vine, pit, treasure, obsticles, wall, scorpion, difficulty) {
        this.trees = trees;
        this.ladder = ladder;
        this.holes = holes;
        this.vine = vine;
        this.pit = pit;
        this.treasure = treasure;
        this.obsticles = obsticles;
        this.wall = wall;
        this.scorpion = scorpion;
        this.difficulty = difficulty;
    }
}
let seed = 0xC4;
for (let i = 0; i < map.length; ++i) {
    let difficulty = 304;
    const trees = seed >> 6;
    let ladder = false;
    let holes = false;
    let vine = false;
    let pit = PitType.NONE;
    let treasure = TreasureType.NONE;
    let obsticles = ObsticleType.NONE;
    let wall = WallType.NONE;
    switch ((seed >> 3) & 7) {
        case 0:
            ladder = true;
            difficulty += 5;
            break;
        case 1:
            ladder = true;
            holes = true;
            difficulty += 10;
            break;
        case 2:
            vine = true;
            pit = PitType.TAR;
            difficulty += 143;
            break;
        case 3:
            vine = true;
            pit = PitType.QUICKSAND;
            difficulty += 143;
            break;
        case 4:
            vine = ((seed >> 1) & 1) === 1;
            pit = PitType.CROCS;
            difficulty += vine ? 143 : 240;
            break;
        case 5:
            pit = PitType.SHIFTING_TAR;
            treasure = seed & 3;
            difficulty += 111;
            break;
        case 6:
            pit = PitType.SHIFTING_TAR;
            vine = true;
            difficulty += 111;
            break;
        case 7:
            pit = PitType.SHIFTING_QUICKSAND;
            difficulty += 111;
            break;
    }
    if (treasure === TreasureType.NONE && pit !== PitType.CROCS) {
        obsticles = seed & 7;
        switch (obsticles) {
            case ObsticleType.ONE_STATIONARY_LOG:
            case ObsticleType.THREE_STATIONARY_LOGS:
            case ObsticleType.ONE_ROLLING_LOG:
                difficulty += 5;
                break;
            case ObsticleType.TWO_ROLLING_LOGS_FAR:
                difficulty += 10;
                break;
            case ObsticleType.TWO_ROLLING_LOGS_NEAR:
                difficulty += 15;
                break;
            case ObsticleType.THREE_ROLLING_LOGS:
                difficulty += 20;
                break;
            case ObsticleType.FIRE:
            case ObsticleType.COBRA:
                difficulty += 30;
                break;
        }
    }
    if (ladder) {
        wall = (seed >> 7) & 1;
    }
    map[i] = new Scene(trees, ladder, holes, vine, pit, treasure, obsticles, wall, !ladder, difficulty);
    seed = 0xFF & ((seed << 1) | (((seed >> 7) & 1) ^ ((seed >> 5) & 1) ^ ((seed >> 4) & 1) ^ ((seed >> 3) & 1)));
}


/***/ }),

/***/ "./src/game/pit.ts":
/*!*************************!*\
  !*** ./src/game/pit.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Pit: () => (/* binding */ Pit)
/* harmony export */ });
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./map */ "./src/game/map.ts");
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/graphics */ "./src/graphics.ts");
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/store */ "./src/store.ts");



const PIT_OPEN_FRAMES = 71;
const PIT_CLOSED_FRAMES = 143;
const PIT_SHIFT_FRAMES = 4;
const CROC_CLOSED_FRAMES = 192; // 128
const CROC_OPENED_FRAMES = 128; // 128
const X_SHIFTS = [
    [33, 95],
    [37, 91],
    [41, 87],
    [49, 79],
    [61, 67],
];
const X_CLOSED_CROCS = [
    [33, 43],
    [53, 59],
    [69, 75],
    [85, 95],
];
const X_OPENED_CROCS_LEFT = [
    [33, 48],
    [53, 64],
    [69, 80],
    [85, 95],
];
const X_OPENED_CROCS_RIGHT = [
    [33, 43],
    [48, 59],
    [64, 75],
    [80, 95],
];
const X_CROCS = [
    [45, 51],
    [61, 67],
    [77, 83],
];
var PitState;
(function (PitState) {
    PitState[PitState["OPENED"] = 0] = "OPENED";
    PitState[PitState["CLOSING"] = 1] = "CLOSING";
    PitState[PitState["CLOSED"] = 2] = "CLOSED";
    PitState[PitState["OPENING"] = 3] = "OPENING";
})(PitState || (PitState = {}));
var CrocState;
(function (CrocState) {
    CrocState[CrocState["OPENED"] = 0] = "OPENED";
    CrocState[CrocState["CLOSED"] = 1] = "CLOSED";
})(CrocState || (CrocState = {}));
class Pit {
    pitState;
    pitOffset;
    pitCounter;
    crocState;
    crocCounter;
    constructor(pit = {
        pitState: PitState.OPENED,
        pitOffset: 0,
        pitCounter: PIT_OPEN_FRAMES,
        crocState: CrocState.CLOSED,
        crocCounter: CROC_CLOSED_FRAMES,
    }) {
        this.pitState = pit.pitState;
        this.pitOffset = pit.pitOffset;
        this.pitCounter = pit.pitCounter;
        this.crocState = pit.crocState;
        this.crocCounter = pit.crocCounter;
    }
    updatePitOpened(gs) {
        if (--this.pitCounter >= 0) {
            return;
        }
        this.pitState = PitState.CLOSING;
        this.pitCounter = PIT_SHIFT_FRAMES;
        ++this.pitOffset;
    }
    updatePitClosing(gs) {
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
    updatePitClosed(gs) {
        if (--this.pitCounter >= 0) {
            return;
        }
        this.pitState = PitState.OPENING;
        this.pitCounter = PIT_SHIFT_FRAMES;
        --this.pitOffset;
    }
    updatePitOpening(gs) {
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
    updateCrocOpened(gs) {
        if (--this.crocCounter === 0) {
            this.crocState = CrocState.CLOSED;
            this.crocCounter = CROC_CLOSED_FRAMES + 1;
            this.updateCrocClosed(gs);
            return;
        }
        const { harry, sceneStates } = gs;
        if (_map__WEBPACK_IMPORTED_MODULE_0__.map[harry.scene].pit !== _map__WEBPACK_IMPORTED_MODULE_0__.PitType.CROCS) {
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
    updateCrocClosed(gs) {
        if (--this.crocCounter === 0) {
            this.crocState = CrocState.OPENED;
            this.crocCounter = CROC_OPENED_FRAMES + 1;
            this.updateCrocOpened(gs);
            return;
        }
        const { harry } = gs;
        if (_map__WEBPACK_IMPORTED_MODULE_0__.map[harry.scene].pit !== _map__WEBPACK_IMPORTED_MODULE_0__.PitType.CROCS) {
            return;
        }
        for (let i = X_CLOSED_CROCS.length - 1; i >= 0; --i) {
            const xCrocs = X_CLOSED_CROCS[i];
            if (harry.checkSink(xCrocs[0], xCrocs[1])) {
                break;
            }
        }
    }
    update(gs) {
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
        switch (_map__WEBPACK_IMPORTED_MODULE_0__.map[harry.scene].pit) {
            case _map__WEBPACK_IMPORTED_MODULE_0__.PitType.TAR:
            case _map__WEBPACK_IMPORTED_MODULE_0__.PitType.QUICKSAND:
                harry.checkSink(X_SHIFTS[0][0], X_SHIFTS[0][1]);
                break;
            case _map__WEBPACK_IMPORTED_MODULE_0__.PitType.SHIFTING_TAR:
            case _map__WEBPACK_IMPORTED_MODULE_0__.PitType.SHIFTING_QUICKSAND:
                if (this.pitOffset < 5) {
                    harry.checkSink(X_SHIFTS[this.pitOffset][0], X_SHIFTS[this.pitOffset][1]);
                }
                break;
        }
    }
    render(gs, ctx, scene, ox) {
        const { pit } = _map__WEBPACK_IMPORTED_MODULE_0__.map[scene];
        const sprites = _graphics__WEBPACK_IMPORTED_MODULE_1__.pitSprites[(pit === _map__WEBPACK_IMPORTED_MODULE_0__.PitType.TAR || pit == _map__WEBPACK_IMPORTED_MODULE_0__.PitType.SHIFTING_TAR) ? 0 : 1];
        if (pit === _map__WEBPACK_IMPORTED_MODULE_0__.PitType.SHIFTING_TAR || pit === _map__WEBPACK_IMPORTED_MODULE_0__.PitType.SHIFTING_QUICKSAND) {
            if (_store__WEBPACK_IMPORTED_MODULE_2__.store.difficulty !== _store__WEBPACK_IMPORTED_MODULE_2__.Difficulty.HARD && this.pitState !== PitState.OPENED) {
                ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_1__.pitSprites[2][0], 32 - ox, 114);
                ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_1__.pitSprites[2][1], 32 - ox, 119);
            }
            if (this.pitState !== PitState.CLOSED) {
                ctx.drawImage(sprites[0], 0, 0, 64, 5 - this.pitOffset, 32 - ox, 114 + this.pitOffset, 64, 5 - this.pitOffset);
                ctx.drawImage(sprites[1], 0, this.pitOffset, 64, 5 - this.pitOffset, 32 - ox, 119, 64, 5 - this.pitOffset);
            }
        }
        else {
            ctx.drawImage(sprites[0], 32 - ox, 114);
            ctx.drawImage(sprites[1], 32 - ox, 119);
            if (pit === _map__WEBPACK_IMPORTED_MODULE_0__.PitType.CROCS) {
                const crocImages = _graphics__WEBPACK_IMPORTED_MODULE_1__.crocSprites[gs.sceneStates[scene].enteredLeft ? 0 : 1];
                const sprite = this.crocState === CrocState.OPENED ? 1 : 0;
                ctx.drawImage(crocImages[sprite], 44 - ox, 111);
                ctx.drawImage(crocImages[sprite], 60 - ox, 111);
                ctx.drawImage(crocImages[sprite], 76 - ox, 111);
            }
        }
    }
}


/***/ }),

/***/ "./src/game/rattle.ts":
/*!****************************!*\
  !*** ./src/game/rattle.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Rattle: () => (/* binding */ Rattle)
/* harmony export */ });
class Rattle {
    seed;
    constructor(rattle = {
        seed: 1,
    }) {
        this.seed = rattle.seed;
    }
    update() {
        let a = this.seed;
        a <<= 1;
        a ^= this.seed;
        a <<= 1;
        this.seed = 0xFF & ((this.seed << 1) | ((a & 0x100) ? 1 : 0));
    }
    getValue() {
        return (this.seed >> 4) & 1;
    }
}


/***/ }),

/***/ "./src/game/rolling-log.ts":
/*!*********************************!*\
  !*** ./src/game/rolling-log.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RollingLog: () => (/* binding */ RollingLog)
/* harmony export */ });
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/graphics */ "./src/graphics.ts");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map */ "./src/game/map.ts");


class RollingLog {
    xCounter;
    spriteCounter;
    constructor(rollingLog = {
        xCounter: 72,
        spriteCounter: 0,
    }) {
        this.xCounter = rollingLog.xCounter;
        this.spriteCounter = rollingLog.spriteCounter;
    }
    // When the scroll position changes, floor the rolling logs counter to prevent jittering. Jittering occurs when the 
    // scroll position and the rolling logs change on alternate frames.
    sync() {
        this.xCounter = Math.floor(this.xCounter);
    }
    checkRolled(gs, x, y, sprite, offset, rollingRight) {
        const { harry } = gs;
        const X = (x + offset) % _graphics__WEBPACK_IMPORTED_MODULE_0__.Resolution.WIDTH;
        if (this.computeFade(gs, X, offset, gs.harry.scene, rollingRight) === 1
            && harry.x >= X - 3 && harry.x <= X + 2
            && harry.intersects(_graphics__WEBPACK_IMPORTED_MODULE_0__.logMasks[sprite], X - 4, y)) {
            gs.harry.rolled();
            if (gs.score > 0) {
                --gs.score;
            }
        }
    }
    update(gs) {
        this.xCounter += .5;
        if (this.xCounter === _graphics__WEBPACK_IMPORTED_MODULE_0__.Resolution.WIDTH) {
            this.xCounter = 0;
        }
        this.spriteCounter = (this.spriteCounter + 1) & 0xF;
        const { harry } = gs;
        const { obsticles } = _map__WEBPACK_IMPORTED_MODULE_1__.map[harry.scene];
        if (!harry.canBeHitByRollingLog() || obsticles > _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.THREE_ROLLING_LOGS) {
            return;
        }
        const rollingRight = gs.sceneStates[harry.scene].enteredLeft;
        const x = Math.floor(rollingRight ? this.xCounter : _graphics__WEBPACK_IMPORTED_MODULE_0__.Resolution.WIDTH - .5 - this.xCounter);
        const s = this.spriteCounter >> 2;
        const sprite = s & 1;
        const y = 111 + ((s === 0) ? 1 : 0);
        this.checkRolled(gs, x, y, sprite, 0, rollingRight);
        switch (obsticles) {
            case _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.TWO_ROLLING_LOGS_NEAR:
                this.checkRolled(gs, x, y, sprite, 16, rollingRight);
                break;
            case _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.THREE_ROLLING_LOGS:
                this.checkRolled(gs, x, y, sprite, 64, rollingRight);
            // fall through to next case to check the third log
            case _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.TWO_ROLLING_LOGS_FAR:
                this.checkRolled(gs, x, y, sprite, 32, rollingRight);
                break;
        }
    }
    fadeLog(gs, scene, rollingRight, offset) {
        if (gs.sceneStates[scene].enteredLeft !== rollingRight) {
            return true;
        }
        const { obsticles } = _map__WEBPACK_IMPORTED_MODULE_1__.map[scene];
        switch (offset) {
            case 0:
                if (obsticles > _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.THREE_ROLLING_LOGS) {
                    return true;
                }
                break;
            case 16:
                if (obsticles !== _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.TWO_ROLLING_LOGS_NEAR) {
                    return true;
                }
                break;
            case 32:
                if (obsticles !== _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.TWO_ROLLING_LOGS_FAR && obsticles !== _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.THREE_ROLLING_LOGS) {
                    return true;
                }
                break;
            case 64:
                if (obsticles !== _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.THREE_ROLLING_LOGS) {
                    return true;
                }
                break;
        }
        return false;
    }
    computeFade(gs, X, offset, scene, rollingRight) {
        if (X <= 15) {
            let leftScene = scene - (gs.harry.isUnderground() ? 3 : 1);
            if (leftScene < 0) {
                leftScene += gs.sceneStates.length;
            }
            if (this.fadeLog(gs, leftScene, rollingRight, offset)) {
                return (X + 1) / 17;
            }
        }
        else if (X >= _graphics__WEBPACK_IMPORTED_MODULE_0__.Resolution.WIDTH - 15) {
            let rightScene = scene + (gs.harry.isUnderground() ? 3 : 1);
            if (rightScene >= gs.sceneStates.length) {
                rightScene -= gs.sceneStates.length;
            }
            if (this.fadeLog(gs, rightScene, rollingRight, offset)) {
                return (_graphics__WEBPACK_IMPORTED_MODULE_0__.Resolution.WIDTH - X + 1) / 17;
            }
        }
        return 1;
    }
    renderLog(gs, ctx, sprite, x, y, offset, scene, rollingRight, ox) {
        const X = (x + offset) % _graphics__WEBPACK_IMPORTED_MODULE_0__.Resolution.WIDTH;
        ctx.globalAlpha = this.computeFade(gs, X, offset, scene, rollingRight);
        ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_0__.logSprites[sprite], X - 4 - ox, y);
        ctx.globalAlpha = 1;
    }
    render(gs, ctx, scene, ox) {
        const rollingRight = gs.sceneStates[scene].enteredLeft;
        const x = Math.floor(rollingRight ? this.xCounter : _graphics__WEBPACK_IMPORTED_MODULE_0__.Resolution.WIDTH - .5 - this.xCounter);
        const s = this.spriteCounter >> 2;
        const sprite = s & 1;
        const y = 111 + ((s === 0) ? 1 : 0);
        this.renderLog(gs, ctx, sprite, x, y, 0, scene, rollingRight, ox);
        switch (_map__WEBPACK_IMPORTED_MODULE_1__.map[scene].obsticles) {
            case _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.TWO_ROLLING_LOGS_NEAR:
                this.renderLog(gs, ctx, sprite, x, y, 16, scene, rollingRight, ox);
                break;
            case _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.THREE_ROLLING_LOGS:
                this.renderLog(gs, ctx, sprite, x, y, 64, scene, rollingRight, ox);
            // fall through to next case to draw the third log
            case _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.TWO_ROLLING_LOGS_FAR:
                this.renderLog(gs, ctx, sprite, x, y, 32, scene, rollingRight, ox);
                break;
        }
    }
}


/***/ }),

/***/ "./src/game/scorpion.ts":
/*!******************************!*\
  !*** ./src/game/scorpion.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Scorpion: () => (/* binding */ Scorpion)
/* harmony export */ });
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/graphics */ "./src/graphics.ts");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map */ "./src/game/map.ts");


const X_START = _graphics__WEBPACK_IMPORTED_MODULE_0__.Resolution.WIDTH / 2;
const X_MIN = 4;
const X_MAX = _graphics__WEBPACK_IMPORTED_MODULE_0__.Resolution.WIDTH - 4;
const X_MARGIN = _graphics__WEBPACK_IMPORTED_MODULE_0__.Resolution.WIDTH / 8;
const FRAMES_PER_UPDATE = 8;
class Scorpion {
    x;
    X;
    dir;
    sprite;
    updateCounter;
    constructor(scorpion = {
        x: X_START,
        X: X_START,
        dir: 0,
        sprite: 0,
        updateCounter: FRAMES_PER_UPDATE,
    }) {
        this.x = scorpion.x;
        this.X = scorpion.X;
        this.dir = scorpion.dir;
        this.sprite = scorpion.sprite;
        this.updateCounter = scorpion.updateCounter;
    }
    update(gs) {
        const harryNearby = _map__WEBPACK_IMPORTED_MODULE_1__.map[gs.harry.scene].scorpion && gs.harry.isUnderground();
        if (harryNearby && gs.harry.intersects(_graphics__WEBPACK_IMPORTED_MODULE_0__.scorpionMasks[this.dir][this.sprite], Math.floor(this.x) - 4, 158)) {
            gs.harry.injure();
            return;
        }
        if (--this.updateCounter > 0) {
            return;
        }
        this.updateCounter = FRAMES_PER_UPDATE;
        this.sprite ^= 1;
        if (harryNearby && Math.abs(gs.harry.x - this.x) >= X_MARGIN) {
            const lastDir = this.dir;
            this.dir = (this.x > gs.harry.x) ? 1 : 0;
            if (lastDir !== this.dir) {
                return;
            }
        }
        if (this.dir === 0) {
            if (this.x >= X_MAX) {
                this.dir = 1;
            }
            else {
                ++this.x;
            }
        }
        else {
            if (this.x <= X_MIN) {
                this.dir = 0;
            }
            else {
                --this.x;
            }
        }
    }
    render(gs, ctx, ox) {
        ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_0__.sorpionSprites[this.dir][this.sprite], Math.floor(this.x) - 4 - ox, 158);
    }
}


/***/ }),

/***/ "./src/game/stationary-log.ts":
/*!************************************!*\
  !*** ./src/game/stationary-log.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StationaryLog: () => (/* binding */ StationaryLog)
/* harmony export */ });
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/graphics */ "./src/graphics.ts");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map */ "./src/game/map.ts");


class StationaryLog {
    constructor(_ = {}) {
    }
    checkSkid(gs, x, y) {
        const { harry } = gs;
        if (harry.x >= x + 1 && harry.x <= x + 6 && harry.intersects(_graphics__WEBPACK_IMPORTED_MODULE_0__.logMasks[1], x, y)) {
            harry.skidded();
            if (gs.score > 0) {
                --gs.score;
            }
        }
    }
    update(gs) {
        switch (_map__WEBPACK_IMPORTED_MODULE_1__.map[gs.harry.scene].obsticles) {
            case _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.THREE_STATIONARY_LOGS:
                this.checkSkid(gs, 12, 111);
                this.checkSkid(gs, 127, 111);
            // fall through to test to the final log
            case _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.ONE_STATIONARY_LOG:
                this.checkSkid(gs, 108, 111);
                break;
        }
    }
    render(gs, ctx, scene, ox) {
        switch (_map__WEBPACK_IMPORTED_MODULE_1__.map[scene].obsticles) {
            case _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.THREE_STATIONARY_LOGS:
                ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_0__.logSprites[1], 12 - ox, 111);
                ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_0__.logSprites[1], 127 - ox, 111);
            // fall through to render to the final log
            case _map__WEBPACK_IMPORTED_MODULE_1__.ObsticleType.ONE_STATIONARY_LOG:
                ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_0__.logSprites[1], 108 - ox, 111);
                break;
        }
    }
}


/***/ }),

/***/ "./src/game/treasure-map.ts":
/*!**********************************!*\
  !*** ./src/game/treasure-map.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Direction: () => (/* binding */ Direction),
/* harmony export */   Tier: () => (/* binding */ Tier),
/* harmony export */   TreasureCell: () => (/* binding */ TreasureCell),
/* harmony export */   treasureCells: () => (/* binding */ treasureCells),
/* harmony export */   treasureIndices: () => (/* binding */ treasureIndices),
/* harmony export */   updateTreasureMapIndex: () => (/* binding */ updateTreasureMapIndex)
/* harmony export */ });
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./map */ "./src/game/map.ts");
/* harmony import */ var _dijkstra__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dijkstra */ "./src/game/dijkstra.ts");


var Direction;
(function (Direction) {
    Direction[Direction["RIGHT"] = 0] = "RIGHT";
    Direction[Direction["LEFT"] = 1] = "LEFT";
    Direction[Direction["UP"] = 2] = "UP";
    Direction[Direction["DOWN"] = 3] = "DOWN";
})(Direction || (Direction = {}));
var Tier;
(function (Tier) {
    Tier[Tier["UPPER"] = 0] = "UPPER";
    Tier[Tier["LOWER"] = 1] = "LOWER";
})(Tier || (Tier = {}));
class Node {
    scene;
    tier;
    constructor(scene, tier) {
        this.scene = scene;
        this.tier = tier;
    }
}
function createNodes() {
    const nodes = new Array(_map__WEBPACK_IMPORTED_MODULE_0__.map.length);
    for (let scene = _map__WEBPACK_IMPORTED_MODULE_0__.map.length - 1; scene >= 0; --scene) {
        nodes[scene] = [new Node(scene, Tier.UPPER), new Node(scene, Tier.LOWER)];
    }
    return nodes;
}
function createGraph(nodes) {
    const graph = new Map();
    for (let scene = _map__WEBPACK_IMPORTED_MODULE_0__.map.length - 1; scene >= 0; --scene) {
        {
            const edges = [];
            if (_map__WEBPACK_IMPORTED_MODULE_0__.map[scene].ladder) {
                edges.push({
                    node: nodes[scene][Tier.LOWER],
                    weight: 165 + _map__WEBPACK_IMPORTED_MODULE_0__.map[scene].difficulty,
                });
            }
            let leftScene = scene - 1;
            if (leftScene < 0) {
                leftScene += _map__WEBPACK_IMPORTED_MODULE_0__.map.length;
            }
            let rightScene = scene + 1;
            if (rightScene >= _map__WEBPACK_IMPORTED_MODULE_0__.map.length) {
                rightScene -= _map__WEBPACK_IMPORTED_MODULE_0__.map.length;
            }
            edges.push({
                node: nodes[leftScene][Tier.UPPER],
                weight: _map__WEBPACK_IMPORTED_MODULE_0__.map[scene].difficulty + _map__WEBPACK_IMPORTED_MODULE_0__.map[leftScene].difficulty,
            });
            edges.push({
                node: nodes[rightScene][Tier.UPPER],
                weight: _map__WEBPACK_IMPORTED_MODULE_0__.map[scene].difficulty + _map__WEBPACK_IMPORTED_MODULE_0__.map[rightScene].difficulty,
            });
            graph.set(nodes[scene][Tier.UPPER], edges);
        }
        {
            const edges = [];
            if (_map__WEBPACK_IMPORTED_MODULE_0__.map[scene].ladder) {
                edges.push({
                    node: nodes[scene][Tier.UPPER],
                    weight: 165 + _map__WEBPACK_IMPORTED_MODULE_0__.map[scene].difficulty,
                });
            }
            let leftScene = scene - 3;
            if (leftScene < 0) {
                leftScene += _map__WEBPACK_IMPORTED_MODULE_0__.map.length;
            }
            let rightScene = scene + 3;
            if (rightScene >= _map__WEBPACK_IMPORTED_MODULE_0__.map.length) {
                rightScene -= _map__WEBPACK_IMPORTED_MODULE_0__.map.length;
            }
            if (_map__WEBPACK_IMPORTED_MODULE_0__.map[scene].wall !== _map__WEBPACK_IMPORTED_MODULE_0__.WallType.LEFT && _map__WEBPACK_IMPORTED_MODULE_0__.map[leftScene].wall !== _map__WEBPACK_IMPORTED_MODULE_0__.WallType.RIGHT) {
                edges.push({
                    node: nodes[leftScene][Tier.LOWER],
                    weight: 10,
                });
            }
            if (_map__WEBPACK_IMPORTED_MODULE_0__.map[scene].wall !== _map__WEBPACK_IMPORTED_MODULE_0__.WallType.RIGHT && _map__WEBPACK_IMPORTED_MODULE_0__.map[rightScene].wall !== _map__WEBPACK_IMPORTED_MODULE_0__.WallType.LEFT) {
                edges.push({
                    node: nodes[rightScene][Tier.LOWER],
                    weight: 10,
                });
            }
            graph.set(nodes[scene][Tier.LOWER], edges);
        }
    }
    return graph;
}
class TreasureCell {
    direction;
    constructor(direction) {
        this.direction = direction;
    }
}
function updateTreasureMapIndex(gs) {
    // Foward route -- Not as short as the reverse route, but doable in 20 minutes.
    for (let i = 0; i < treasureIndices.length; ++i) {
        if (gs.sceneStates[treasureIndices[i]].treasure !== _map__WEBPACK_IMPORTED_MODULE_0__.TreasureType.NONE) {
            gs.treasureMapIndex = i;
            break;
        }
    }
    // Reverse route
    // for (let i = treasureIndices.length - 1, j = 0; i >= 0; --i, --j) {
    //     if (j < 0) {
    //         j += treasureIndices.length;
    //     }
    //     if (gs.sceneStates[treasureIndices[j]].treasure !== TreasureType.NONE) {
    //         gs.treasureMapIndex = j;
    //         break;
    //     }        
    // }
}
const treasureIndices = new Array(32);
const treasureCells = new Array(32);
function initTreasureCells() {
    const nodes = createNodes();
    const graph = createGraph(nodes);
    let treasureIndex = 0;
    for (let scene = 0; scene < _map__WEBPACK_IMPORTED_MODULE_0__.map.length; ++scene) {
        if (_map__WEBPACK_IMPORTED_MODULE_0__.map[scene].treasure === _map__WEBPACK_IMPORTED_MODULE_0__.TreasureType.NONE) {
            continue;
        }
        treasureIndices[treasureIndex] = scene;
        const distLinks = (0,_dijkstra__WEBPACK_IMPORTED_MODULE_1__.dijkstra)(graph, nodes[scene][Tier.UPPER]);
        const cells = treasureCells[treasureIndex++] = new Array(_map__WEBPACK_IMPORTED_MODULE_0__.map.length);
        for (let i = 0; i < _map__WEBPACK_IMPORTED_MODULE_0__.map.length; ++i) {
            cells[i] = new Array(2);
            {
                const distLink = distLinks.get(nodes[i][Tier.UPPER]);
                if (!distLink) {
                    throw new Error('Missing upper distLink');
                }
                const { link } = distLink;
                let direction = Direction.RIGHT;
                if (link) {
                    if (link.tier === Tier.LOWER) {
                        direction = Direction.DOWN;
                    }
                    else {
                        let leftScene = i - 1;
                        if (leftScene < 0) {
                            leftScene += _map__WEBPACK_IMPORTED_MODULE_0__.map.length;
                        }
                        direction = (link.scene === leftScene) ? Direction.LEFT : Direction.RIGHT;
                    }
                }
                cells[i][Tier.UPPER] = new TreasureCell(direction);
            }
            {
                const distLink = distLinks.get(nodes[i][Tier.LOWER]);
                if (!distLink) {
                    throw new Error('Missing lower distLink');
                }
                const { link } = distLink;
                let direction = Direction.RIGHT;
                if (link) {
                    if (link.tier === Tier.UPPER) {
                        direction = Direction.UP;
                    }
                    else {
                        let leftScene = i - 3;
                        if (leftScene < 0) {
                            leftScene += _map__WEBPACK_IMPORTED_MODULE_0__.map.length;
                        }
                        direction = (link.scene === leftScene) ? Direction.LEFT : Direction.RIGHT;
                    }
                }
                cells[i][Tier.LOWER] = new TreasureCell(direction);
            }
        }
    }
}
initTreasureCells();


/***/ }),

/***/ "./src/game/treasure.ts":
/*!******************************!*\
  !*** ./src/game/treasure.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Treasure: () => (/* binding */ Treasure)
/* harmony export */ });
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/graphics */ "./src/graphics.ts");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map */ "./src/game/map.ts");
/* harmony import */ var _treasure_map__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./treasure-map */ "./src/game/treasure-map.ts");
/* harmony import */ var _audio__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/audio */ "./src/audio.ts");




class Treasure {
    constructor(_ = {}) {
    }
    update(gs) {
        let mask;
        let points = 0;
        switch (gs.sceneStates[gs.harry.scene].treasure) {
            case _map__WEBPACK_IMPORTED_MODULE_1__.TreasureType.DIAMOND_RING:
                mask = _graphics__WEBPACK_IMPORTED_MODULE_0__.ringMask;
                points = 5000;
                break;
            case _map__WEBPACK_IMPORTED_MODULE_1__.TreasureType.GOLD_BRICK:
                mask = _graphics__WEBPACK_IMPORTED_MODULE_0__.goldMasks[gs.rattle.getValue()];
                points = 4000;
                break;
            case _map__WEBPACK_IMPORTED_MODULE_1__.TreasureType.SILVER_BRICK:
                mask = _graphics__WEBPACK_IMPORTED_MODULE_0__.silverMasks[gs.rattle.getValue()];
                points = 3000;
                break;
            case _map__WEBPACK_IMPORTED_MODULE_1__.TreasureType.MONEY_BAG:
                mask = _graphics__WEBPACK_IMPORTED_MODULE_0__.moneyMask;
                points = 2000;
                break;
            default:
                return;
        }
        if (gs.harry.intersects(mask, 108, 111)) {
            gs.sceneStates[gs.harry.scene].treasure = _map__WEBPACK_IMPORTED_MODULE_1__.TreasureType.NONE;
            gs.score += points;
            if (++gs.treasureCount === 32) {
                gs.endGame();
            }
            else {
                (0,_treasure_map__WEBPACK_IMPORTED_MODULE_2__.updateTreasureMapIndex)(gs);
            }
            (0,_audio__WEBPACK_IMPORTED_MODULE_3__.play)('sfx/treasure.mp3');
        }
    }
    render(gs, ctx, scene, ox) {
        let sprite;
        switch (gs.sceneStates[scene].treasure) {
            case _map__WEBPACK_IMPORTED_MODULE_1__.TreasureType.DIAMOND_RING:
                sprite = _graphics__WEBPACK_IMPORTED_MODULE_0__.ringSprite;
                break;
            case _map__WEBPACK_IMPORTED_MODULE_1__.TreasureType.GOLD_BRICK:
                sprite = _graphics__WEBPACK_IMPORTED_MODULE_0__.goldSprites[gs.rattle.getValue()];
                break;
            case _map__WEBPACK_IMPORTED_MODULE_1__.TreasureType.SILVER_BRICK:
                sprite = _graphics__WEBPACK_IMPORTED_MODULE_0__.silverSprites[gs.rattle.getValue()];
                break;
            case _map__WEBPACK_IMPORTED_MODULE_1__.TreasureType.MONEY_BAG:
                sprite = _graphics__WEBPACK_IMPORTED_MODULE_0__.moneySprite;
                break;
            default:
                return;
        }
        ctx.drawImage(sprite, 108 - ox, 111);
    }
}


/***/ }),

/***/ "./src/game/vine-state.ts":
/*!********************************!*\
  !*** ./src/game/vine-state.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VineState: () => (/* binding */ VineState)
/* harmony export */ });
class VineState {
    x;
    y;
    vy;
    constructor(x, y, vy) {
        this.x = x;
        this.y = y;
        this.vy = vy;
    }
}


/***/ }),

/***/ "./src/game/vine.ts":
/*!**************************!*\
  !*** ./src/game/vine.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Vine: () => (/* binding */ Vine)
/* harmony export */ });
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/graphics */ "./src/graphics.ts");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map */ "./src/game/map.ts");


class Vine {
    sprite;
    constructor(vine = {
        sprite: Math.floor(_graphics__WEBPACK_IMPORTED_MODULE_0__.vineStates.length / 2),
    }) {
        this.sprite = vine.sprite;
    }
    update(gs) {
        if (++this.sprite === _graphics__WEBPACK_IMPORTED_MODULE_0__.vineStates.length) {
            this.sprite = 0;
        }
        const { harry } = gs;
        if (_map__WEBPACK_IMPORTED_MODULE_1__.map[harry.scene].vine && !harry.releasedVine && harry.isFalling()
            && harry.intersects(_graphics__WEBPACK_IMPORTED_MODULE_0__.vineMasks[this.sprite], 33 /* 31 */, 28)) {
            harry.swing();
        }
    }
    render(gs, ctx, ox) {
        ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_0__.vineSprites[this.sprite], 33 /* 31 */ - ox, 28);
    }
}


/***/ }),

/***/ "./src/graphics.ts":
/*!*************************!*\
  !*** ./src/graphics.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Colors: () => (/* binding */ Colors),
/* harmony export */   PhysicalDimensions: () => (/* binding */ PhysicalDimensions),
/* harmony export */   Resolution: () => (/* binding */ Resolution),
/* harmony export */   VINE_CX: () => (/* binding */ VINE_CX),
/* harmony export */   VINE_CY: () => (/* binding */ VINE_CY),
/* harmony export */   VINE_PERIOD: () => (/* binding */ VINE_PERIOD),
/* harmony export */   arrowSprites: () => (/* binding */ arrowSprites),
/* harmony export */   branchesSprite: () => (/* binding */ branchesSprite),
/* harmony export */   charSprites: () => (/* binding */ charSprites),
/* harmony export */   cobraMasks: () => (/* binding */ cobraMasks),
/* harmony export */   cobraSprites: () => (/* binding */ cobraSprites),
/* harmony export */   colors: () => (/* binding */ colors),
/* harmony export */   crocSprites: () => (/* binding */ crocSprites),
/* harmony export */   fireMasks: () => (/* binding */ fireMasks),
/* harmony export */   fireSprites: () => (/* binding */ fireSprites),
/* harmony export */   goldMasks: () => (/* binding */ goldMasks),
/* harmony export */   goldSprites: () => (/* binding */ goldSprites),
/* harmony export */   harryMasks: () => (/* binding */ harryMasks),
/* harmony export */   harrySprites: () => (/* binding */ harrySprites),
/* harmony export */   init: () => (/* binding */ init),
/* harmony export */   leavesSprites: () => (/* binding */ leavesSprites),
/* harmony export */   logMasks: () => (/* binding */ logMasks),
/* harmony export */   logSprites: () => (/* binding */ logSprites),
/* harmony export */   moneyMask: () => (/* binding */ moneyMask),
/* harmony export */   moneySprite: () => (/* binding */ moneySprite),
/* harmony export */   pitSprites: () => (/* binding */ pitSprites),
/* harmony export */   printNumber: () => (/* binding */ printNumber),
/* harmony export */   ringMask: () => (/* binding */ ringMask),
/* harmony export */   ringSprite: () => (/* binding */ ringSprite),
/* harmony export */   scorpionMasks: () => (/* binding */ scorpionMasks),
/* harmony export */   silverMasks: () => (/* binding */ silverMasks),
/* harmony export */   silverSprites: () => (/* binding */ silverSprites),
/* harmony export */   sorpionSprites: () => (/* binding */ sorpionSprites),
/* harmony export */   vineMasks: () => (/* binding */ vineMasks),
/* harmony export */   vineSprites: () => (/* binding */ vineSprites),
/* harmony export */   vineStates: () => (/* binding */ vineStates),
/* harmony export */   wallSprite: () => (/* binding */ wallSprite)
/* harmony export */ });
/* harmony import */ var _math__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/math */ "./src/math.ts");
/* harmony import */ var _game_vine_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/game/vine-state */ "./src/game/vine-state.ts");


class RGBColor {
    r;
    g;
    b;
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}
var Resolution;
(function (Resolution) {
    Resolution[Resolution["WIDTH"] = 136] = "WIDTH";
    Resolution[Resolution["HEIGHT"] = 180] = "HEIGHT";
})(Resolution || (Resolution = {}));
var PhysicalDimensions;
(function (PhysicalDimensions) {
    PhysicalDimensions[PhysicalDimensions["WIDTH"] = 3.4] = "WIDTH";
    PhysicalDimensions[PhysicalDimensions["HEIGHT"] = 2.3684210526315788] = "HEIGHT";
})(PhysicalDimensions || (PhysicalDimensions = {}));
var Colors;
(function (Colors) {
    Colors[Colors["BROWN"] = 18] = "BROWN";
    Colors[Colors["YELLOW"] = 30] = "YELLOW";
    Colors[Colors["ORANGE"] = 62] = "ORANGE";
    Colors[Colors["RED"] = 72] = "RED";
    Colors[Colors["OFF_GREEN"] = 213] = "OFF_GREEN";
    Colors[Colors["GREEN"] = 214] = "GREEN";
    Colors[Colors["BLUE"] = 164] = "BLUE";
    Colors[Colors["YELLOW_GREEN"] = 200] = "YELLOW_GREEN";
    Colors[Colors["PINK"] = 74] = "PINK";
    Colors[Colors["BLACK"] = 0] = "BLACK";
    Colors[Colors["OFF_BLACK"] = 2] = "OFF_BLACK";
    Colors[Colors["GREY"] = 6] = "GREY";
    Colors[Colors["OFF_WHITE"] = 12] = "OFF_WHITE";
    Colors[Colors["WHITE"] = 14] = "WHITE";
    Colors[Colors["DARK_GREEN"] = 210] = "DARK_GREEN";
    Colors[Colors["DARK_RED"] = 66] = "DARK_RED";
    Colors[Colors["DARK_YELLOW"] = 20] = "DARK_YELLOW";
    Colors[Colors["MID_YELLOW"] = 22] = "MID_YELLOW";
    Colors[Colors["LIGHT_YELLOW"] = 24] = "LIGHT_YELLOW";
    Colors[Colors["DARK_BROWN"] = 16] = "DARK_BROWN";
})(Colors || (Colors = {}));
const colors = new Array(256);
const harrySprites = new Array(2); // direction, sprite
const harryMasks = new Array(2); // direction, mask
const cobraSprites = new Array(2); // direction, sprite
const cobraMasks = new Array(2); // direction, mask
const crocSprites = new Array(2); // direction, sprite
const sorpionSprites = new Array(2); // direction, sprite
const scorpionMasks = new Array(2); // direction, mask
const leavesSprites = new Array(2); // direction, sprite
const logSprites = new Array(2);
const logMasks = new Array(2);
const fireSprites = new Array(2);
const fireMasks = new Array(2);
const goldSprites = new Array(2);
const goldMasks = new Array(2);
const silverSprites = new Array(2);
const silverMasks = new Array(2);
let moneySprite;
let moneyMask;
let ringSprite;
let ringMask;
let wallSprite;
let branchesSprite;
const charSprites = new Array(256); // color, character
const pitSprites = new Array(3); // color(0=black,1=blue,2=yellow),sprite(0=bottom,1=top)
const VINE_PERIOD = 285;
const VINE_CX = 64; // 62 -- shifted vine 2 pixels right to better center it
const VINE_CY = 28;
const vineStates = new Array(VINE_PERIOD);
const vineSprites = new Array(VINE_PERIOD);
const vineMasks = new Array(VINE_PERIOD);
const arrowSprites = new Array(2); // color, direction (0=right, 1=left, 2=up, 3=down)
function createVineSprites(palette, promises) {
    const LENGTH = 73;
    const DISTORTION = 245 / 145;
    const MAX_ANGLE = Math.atan(1 / DISTORTION);
    let minX = VINE_CX;
    let minY = VINE_CY;
    let maxX = VINE_CX;
    let maxY = VINE_CY;
    for (let i = 0; i < VINE_PERIOD; ++i) {
        const t = _math__WEBPACK_IMPORTED_MODULE_0__.TAU * i / VINE_PERIOD;
        const a = MAX_ANGLE * Math.sin(t);
        const p = new _game_vine_state__WEBPACK_IMPORTED_MODULE_1__.VineState(Math.round(VINE_CX + LENGTH * DISTORTION * Math.sin(a) / 2), Math.round(VINE_CY + LENGTH * Math.cos(a)), -LENGTH * MAX_ANGLE * _math__WEBPACK_IMPORTED_MODULE_0__.TAU * Math.sin(a) * Math.cos(t) / VINE_PERIOD);
        vineStates[i] = p;
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
    }
    const color = palette[Colors.DARK_BROWN];
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const imageData = new ImageData(width, height);
    for (let i = 0; i < vineStates.length; ++i) {
        const p = vineStates[i];
        imageData.data.fill(0);
        plotLine(imageData, VINE_CX - minX, VINE_CY - minY, p.x - minX, p.y - minY, color);
        vineMasks[i] = createMask(imageData);
        promises.push(createImageBitmap(imageData).then(imageBitmap => vineSprites[i] = imageBitmap));
    }
}
async function createSprite(width, height, callback) {
    return new Promise(resolve => {
        const imageData = new ImageData(width, height);
        callback(imageData);
        createImageBitmap(imageData).then(imageBitmap => resolve({ imageBitmap, imageData }));
    });
}
function createMask(imageData) {
    const mask = new Array(imageData.height);
    const { data } = imageData;
    for (let y = 0, i = 3; y < imageData.height; ++y) {
        mask[y] = new Array(imageData.width);
        for (let x = 0; x < imageData.width; ++x, i += 4) {
            mask[y][x] = data[i] !== 0;
        }
    }
    return mask;
}
function createSpriteAndMask(binStr, palette, spriteOffset, colorOffset, height, flipped, spriteCallback, maskCallback, promises) {
    promises.push(createSprite(8, height, imageData => {
        if (flipped) {
            for (let y = 0; y < height; ++y) {
                const offset = height - 1 - y;
                const byte = binStr.charCodeAt(spriteOffset + offset);
                const color = palette[binStr.charCodeAt(colorOffset + offset)];
                for (let x = 0, mask = 0x01; x < 8; ++x, mask <<= 1) {
                    if ((byte & mask) !== 0) {
                        setColor(imageData, x, y, color);
                    }
                }
            }
        }
        else {
            for (let y = 0; y < height; ++y) {
                const offset = height - 1 - y;
                const byte = binStr.charCodeAt(spriteOffset + offset);
                const color = palette[binStr.charCodeAt(colorOffset + offset)];
                for (let x = 0, mask = 0x80; x < 8; ++x, mask >>= 1) {
                    if ((byte & mask) !== 0) {
                        setColor(imageData, x, y, color);
                    }
                }
            }
        }
    }).then(({ imageBitmap, imageData }) => {
        spriteCallback(imageBitmap);
        if (maskCallback) {
            maskCallback(createMask(imageData));
        }
    }));
}
function extractPalette() {
    const palette = new Array(256);
    const binStr = atob('AAAAPz8+ZGRjhISDoqKhurq50tLR6urpPT0AXl4Ke3sVmZkgtLQqzc005uY+/f1IcSMAhj0LmVcYrW8mvYYyzZs+3LBJ6s'
        + 'JUhhUAmi8OrkgewGEv0Xc+4I1N76Jb/bVoigAAnhMSsSgnwj080lFQ4mRj73V0/YaFeQBYjRJuoCeEsTuYwE6q0GG83XHM6oLcRQB4XRKPci'
        + 'ekiDu5m07KrmHcv3Hs0IL7DgCFKROZQyitXT2/dFHQi2TfoXXutYb7AACKEhOdJCiwNz3BSVHRWmTganXueYb7ABV9EjGTJEynN2e7SYDMWp'
        + 'fdaq7tecL7ACdYEkV0JGKNN36nSZe+WrDUasfoed37ADUmEldCJHZdN5V2SbGOWsylauW7ef3PADkAE1sSKHknPZc8UbNQZM1jdeZ0hv2FDj'
        + 'IAK1QRR3MjY5M2fbBIlctZreVpwv14Jy4ARU4PYmshfogzl6NDsLxTx9Ri3epwPSMAXkINe18dmXsttJY7za9K5sdX/d1k');
    for (let i = 0x00; i <= 0xFF; ++i) {
        const j = 3 * (i >> 1);
        const col = new RGBColor(binStr.charCodeAt(j), binStr.charCodeAt(j + 1), binStr.charCodeAt(j + 2));
        palette[i] = col;
        colors[i] = `#${((col.r << 16) | (col.g << 8) | col.b).toString(16).padStart(6, '0')}`;
    }
    return palette;
}
function setColor(imageData, x, y, color) {
    const offset = 4 * (y * imageData.width + x);
    const data = imageData.data;
    data[offset] = color.r;
    data[offset + 1] = color.g;
    data[offset + 2] = color.b;
    data[offset + 3] = 0xFF;
}
function plotLine(imageData, x0, y0, x1, y1, color) {
    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let error = dx + dy;
    while (true) {
        setColor(imageData, x0, y0, color);
        if (x0 === x1 && y0 === y1) {
            break;
        }
        const e2 = 2 * error;
        if (e2 >= dy) {
            error = error + dy;
            x0 = x0 + sx;
        }
        if (e2 <= dx) {
            error = error + dx;
            y0 = y0 + sy;
        }
    }
}
async function init() {
    let Offsets;
    (function (Offsets) {
        Offsets[Offsets["CLIMBCOLTAB"] = 0] = "CLIMBCOLTAB";
        Offsets[Offsets["RUNCOLTAB"] = 22] = "RUNCOLTAB";
        Offsets[Offsets["LOGCOLOR"] = 43] = "LOGCOLOR";
        Offsets[Offsets["FIRECOLOR"] = 59] = "FIRECOLOR";
        Offsets[Offsets["COBRACOLOR"] = 75] = "COBRACOLOR";
        Offsets[Offsets["CROCOCOLOR"] = 91] = "CROCOCOLOR";
        Offsets[Offsets["MONEYBAGCOLOR"] = 107] = "MONEYBAGCOLOR";
        Offsets[Offsets["SCORPIONCOLOR"] = 123] = "SCORPIONCOLOR";
        Offsets[Offsets["WALLCOLOR"] = 139] = "WALLCOLOR";
        Offsets[Offsets["RINGCOLOR"] = 155] = "RINGCOLOR";
        Offsets[Offsets["GOLDBARCOLOR"] = 171] = "GOLDBARCOLOR";
        Offsets[Offsets["SILVERBARCOLOR"] = 187] = "SILVERBARCOLOR";
        Offsets[Offsets["LEAVESCOLOR"] = 203] = "LEAVESCOLOR";
        Offsets[Offsets["BRANCHESCOLOR"] = 207] = "BRANCHESCOLOR";
        Offsets[Offsets["LEAVES0"] = 215] = "LEAVES0";
        Offsets[Offsets["LEAVES1"] = 219] = "LEAVES1";
        Offsets[Offsets["LEAVES2"] = 223] = "LEAVES2";
        Offsets[Offsets["LEAVES3"] = 227] = "LEAVES3";
        Offsets[Offsets["HARRY0"] = 231] = "HARRY0";
        Offsets[Offsets["HARRY1"] = 253] = "HARRY1";
        Offsets[Offsets["HARRY2"] = 275] = "HARRY2";
        Offsets[Offsets["HARRY3"] = 297] = "HARRY3";
        Offsets[Offsets["HARRY4"] = 319] = "HARRY4";
        Offsets[Offsets["HARRY5"] = 341] = "HARRY5";
        Offsets[Offsets["HARRY6"] = 363] = "HARRY6";
        Offsets[Offsets["HARRY7"] = 385] = "HARRY7";
        Offsets[Offsets["BRANCHES"] = 407] = "BRANCHES";
        Offsets[Offsets["PIT"] = 415] = "PIT";
        Offsets[Offsets["LOG0"] = 420] = "LOG0";
        Offsets[Offsets["FIRE0"] = 436] = "FIRE0";
        Offsets[Offsets["COBRA0"] = 452] = "COBRA0";
        Offsets[Offsets["COBRA1"] = 468] = "COBRA1";
        Offsets[Offsets["CROCO0"] = 484] = "CROCO0";
        Offsets[Offsets["CROCO1"] = 500] = "CROCO1";
        Offsets[Offsets["MONEYBAG"] = 516] = "MONEYBAG";
        Offsets[Offsets["SCORPION0"] = 532] = "SCORPION0";
        Offsets[Offsets["SCORPION1"] = 548] = "SCORPION1";
        Offsets[Offsets["WALL"] = 564] = "WALL";
        Offsets[Offsets["BAR0"] = 580] = "BAR0";
        Offsets[Offsets["BAR1"] = 596] = "BAR1";
        Offsets[Offsets["RING"] = 612] = "RING";
        Offsets[Offsets["ZERO"] = 628] = "ZERO";
        Offsets[Offsets["ONE"] = 636] = "ONE";
        Offsets[Offsets["TWO"] = 644] = "TWO";
        Offsets[Offsets["THREE"] = 652] = "THREE";
        Offsets[Offsets["FOUR"] = 660] = "FOUR";
        Offsets[Offsets["SIX"] = 676] = "SIX";
        Offsets[Offsets["SEVEN"] = 684] = "SEVEN";
        Offsets[Offsets["EIGHT"] = 692] = "EIGHT";
        Offsets[Offsets["NINE"] = 700] = "NINE";
        Offsets[Offsets["COLON"] = 708] = "COLON";
        Offsets[Offsets["ARROWRIGHT"] = 716] = "ARROWRIGHT";
        Offsets[Offsets["ARROWLEFT"] = 732] = "ARROWLEFT";
        Offsets[Offsets["ARROWUP"] = 748] = "ARROWUP";
        Offsets[Offsets["ARROWDOWN"] = 764] = "ARROWDOWN";
    })(Offsets || (Offsets = {}));
    const palette = extractPalette();
    const binStr = atob('0tLS0tLS0tLS0tLSyMjIyMjISkpKEtLS0tLS0tLS0tLIyMjIyMjISkpKEhISEhISEhISEhISEhISEhIQEBAQED4+Pi4uLi'
        + '4uLi4uAAAEAAQAAAAAAAAAAABCQtDQ0NDQ0NDQ0NDQ0NDQ0NAEBAQEBAQEBAQEBAQSBAQEDg4ODg4ODg4ODg4ODg4ODgZCQkIGQkJCBkJCQg'
        + 'ZCQkJCQh4eHh4eHh4eDg4ODg4OHh4eHh4eHh4ODg4ODg4ODgYGBgYGBgYODg4ODg4ODg7S0tLSEBAQEBAQEBABg8//ABg9fxi8/v8wePz+AA'
        + 'AAAAAzctoeHBhYWHw+GhgQGBgYAACAgMNiYjY+HBgYPD46OBgYEBgYGAAQICIkNDIWHhwYGBwcGBgYGBAYGBgADAgoKD4KDhwYGBwcGBgYGB'
        + 'gQGBgYAAACQ0R0FBwcGBgYPD46OBgYEBgYGAAYEBwYGBgYGBgYGBgcHhoYGBAYGBgAAAAAAAAAY/L23MDAwMDA8NCQ0NDAADAQEBAWFBQWEh'
        + 'YeHBg4ODweGgIYGBh+25mZmZmZmQABAw9/ABgkWlpaZn5edn5edjwYAADD5348GDx8fHg4ODAwEBAA/vn5+flgEAgMDAg4MEAAAP75+fr6YB'
        + 'AIDAwIODCAAAAAAAAA/6sDAwsuuuCAAAAAAAAAAP+rVf8GBAAAAAAAAD53d2N7Y29jNjYcCBw2AIUyPXj4xoKQiNhwAAAAAABJMzx4+sSSiN'
        + 'hwAAAAAAAA/rq6uv7u7u7+urq6/u7u7gD4/P7+fj4AEABUAJIAEAAA+Pz+/n4+AAAoAFQAEAAAAAA4bERERGw4EDh8OAAAADxmZmZmZmY8PB'
        + 'gYGBgYOBh+YGA8BgZGPDxGBgwMBkY8DAwMfkwsHAx8RgYGfGBgfjxmZmZ8YGI8GBgYGAwGQn48ZmY8PGZmPDxGBj5mZmY8ABgYAAAYGAAACA'
        + 'gMDP7+///+/gwMCAgAABAQMDB/f///f38wMBAQABAQODh8fP7+ODg4ODg4ODg4ODg4ODg4OP7+fHw4OBAQ');
    const promises = [];
    for (let dir = 0; dir < 2; ++dir) {
        const flipped = dir === 1;
        // leaves
        leavesSprites[dir] = new Array(4);
        for (let i = 0; i < 4; ++i) {
            createSpriteAndMask(binStr, palette, Offsets.LEAVES0 + 4 * i, Offsets.LEAVESCOLOR, 4, flipped, sprite => leavesSprites[dir][i] = sprite, null, promises);
        }
        // harry
        harrySprites[dir] = new Array(8);
        harryMasks[dir] = new Array(8);
        for (let i = 0; i < 8; ++i) {
            const j = (i <= 5) ? 5 - i : i;
            createSpriteAndMask(binStr, palette, Offsets.HARRY0 + 22 * i, (i === 7) ? Offsets.CLIMBCOLTAB : Offsets.RUNCOLTAB, 22, flipped, sprite => harrySprites[dir][j] = sprite, mask => harryMasks[dir][j] = mask, promises);
        }
        // cobra
        cobraSprites[dir] = new Array(2);
        cobraMasks[dir] = new Array(2);
        createSpriteAndMask(binStr, palette, Offsets.COBRA1, Offsets.COBRACOLOR, 16, flipped, sprite => cobraSprites[dir][0] = sprite, mask => cobraMasks[dir][0] = mask, promises);
        createSpriteAndMask(binStr, palette, Offsets.COBRA0, Offsets.COBRACOLOR, 16, flipped, sprite => cobraSprites[dir][1] = sprite, mask => cobraMasks[dir][1] = mask, promises);
        // croc
        crocSprites[dir] = new Array(2);
        createSpriteAndMask(binStr, palette, Offsets.CROCO1, Offsets.CROCOCOLOR, 16, flipped, sprite => crocSprites[dir][0] = sprite, null, promises);
        createSpriteAndMask(binStr, palette, Offsets.CROCO0, Offsets.CROCOCOLOR, 16, flipped, sprite => crocSprites[dir][1] = sprite, null, promises);
        // sorpion
        sorpionSprites[dir] = new Array(2);
        scorpionMasks[dir] = new Array(2);
        createSpriteAndMask(binStr, palette, Offsets.SCORPION1, Offsets.SCORPIONCOLOR, 16, flipped, sprite => sorpionSprites[dir][0] = sprite, mask => scorpionMasks[dir][0] = mask, promises);
        createSpriteAndMask(binStr, palette, Offsets.SCORPION0, Offsets.SCORPIONCOLOR, 16, flipped, sprite => sorpionSprites[dir][1] = sprite, mask => scorpionMasks[dir][1] = mask, promises);
    }
    // log
    createSpriteAndMask(binStr, palette, Offsets.LOG0, Offsets.LOGCOLOR, 16, true, sprite => logSprites[0] = sprite, mask => logMasks[0] = mask, promises);
    createSpriteAndMask(binStr, palette, Offsets.LOG0, Offsets.LOGCOLOR, 16, false, sprite => logSprites[1] = sprite, mask => logMasks[1] = mask, promises);
    // fire
    createSpriteAndMask(binStr, palette, Offsets.FIRE0, Offsets.FIRECOLOR, 16, true, sprite => fireSprites[0] = sprite, mask => fireMasks[0] = mask, promises);
    createSpriteAndMask(binStr, palette, Offsets.FIRE0, Offsets.FIRECOLOR, 16, false, sprite => fireSprites[1] = sprite, mask => fireMasks[1] = mask, promises);
    // gold
    createSpriteAndMask(binStr, palette, Offsets.BAR1, Offsets.GOLDBARCOLOR, 16, false, sprite => goldSprites[0] = sprite, mask => goldMasks[0] = mask, promises);
    createSpriteAndMask(binStr, palette, Offsets.BAR0, Offsets.GOLDBARCOLOR, 16, false, sprite => goldSprites[1] = sprite, mask => goldMasks[1] = mask, promises);
    // silver
    createSpriteAndMask(binStr, palette, Offsets.BAR1, Offsets.SILVERBARCOLOR, 16, false, sprite => silverSprites[0] = sprite, mask => silverMasks[0] = mask, promises);
    createSpriteAndMask(binStr, palette, Offsets.BAR0, Offsets.SILVERBARCOLOR, 16, false, sprite => silverSprites[1] = sprite, mask => silverMasks[1] = mask, promises);
    // money
    createSpriteAndMask(binStr, palette, Offsets.MONEYBAG, Offsets.MONEYBAGCOLOR, 16, false, sprite => moneySprite = sprite, mask => moneyMask = mask, promises);
    // ring
    createSpriteAndMask(binStr, palette, Offsets.RING, Offsets.RINGCOLOR, 16, false, sprite => ringSprite = sprite, mask => ringMask = mask, promises);
    // wall
    createSpriteAndMask(binStr, palette, Offsets.WALL, Offsets.WALLCOLOR, 16, false, sprite => wallSprite = sprite, null, promises);
    // branches
    createSpriteAndMask(binStr, palette, Offsets.BRANCHES, Offsets.BRANCHESCOLOR, 8, false, sprite => branchesSprite = sprite, null, promises);
    // characters        
    for (let color = 0; color < 256; ++color) {
        const charCol = palette[color];
        charSprites[color] = new Array(11);
        for (let char = 0; char < 11; ++char) {
            promises.push(createSprite(8, 8, imageData => {
                const offset = Offsets.ZERO + 8 * (char + 1) - 1;
                for (let y = 0; y < 8; ++y) {
                    const byte = binStr.charCodeAt(offset - y);
                    for (let x = 0, mask = 0x80; x < 8; ++x, mask >>= 1) {
                        if ((byte & mask) !== 0) {
                            setColor(imageData, x, y, charCol);
                        }
                    }
                }
            }).then(({ imageBitmap }) => charSprites[color][char] = imageBitmap));
        }
    }
    // pits
    const pitColors = [Colors.BLACK, Colors.BLUE, Colors.MID_YELLOW];
    for (let color = 0; color < pitColors.length; ++color) {
        const pitCol = palette[pitColors[color]];
        pitSprites[color] = new Array(2);
        for (let sprite = 0; sprite < 2; ++sprite) {
            promises.push(createSprite(64, 5, imageData => {
                for (let y = 0; y < 5; ++y) {
                    const Y = (sprite === 0) ? 4 - y : y;
                    const byte = binStr.charCodeAt(Offsets.PIT + y);
                    for (let x = 0, mask = 0x80, x4 = 0; x < 8; ++x, mask >>= 1, x4 += 4) {
                        if ((byte & mask) === 0) {
                            for (let i = 0; i < 4; ++i) {
                                const X = x4 + i;
                                setColor(imageData, 31 - X, Y, pitCol);
                                setColor(imageData, 32 + X, Y, pitCol);
                            }
                        }
                    }
                }
            }).then(({ imageBitmap }) => pitSprites[color][sprite] = imageBitmap));
        }
    }
    // vines
    createVineSprites(palette, promises);
    // arrows
    const arrowColors = [Colors.OFF_GREEN, Colors.OFF_BLACK];
    for (let color = 0; color < arrowColors.length; ++color) {
        const arrowCol = palette[arrowColors[color]];
        arrowSprites[color] = new Array(4);
        for (let sprite = 0; sprite < 4; ++sprite) {
            promises.push(createSprite(8, 16, imageData => {
                const offset = Offsets.ARROWRIGHT + 16 * sprite;
                for (let y = 0; y < 16; ++y) {
                    const byte = binStr.charCodeAt(offset + y);
                    for (let x = 0, mask = 0x80; x < 8; ++x, mask >>= 1) {
                        if ((byte & mask) !== 0) {
                            setColor(imageData, x, y, arrowCol);
                        }
                    }
                }
            }).then(({ imageBitmap }) => arrowSprites[color][sprite] = imageBitmap));
        }
    }
    await Promise.all(promises);
}
function printNumber(ctx, value, x, y, color, minDigits = 1) {
    const sprites = charSprites[color];
    while (value > 0 || minDigits > 0) {
        ctx.drawImage(sprites[value % 10], x, y);
        value = Math.floor(value / 10);
        --minDigits;
        x -= 8;
    }
}


/***/ }),

/***/ "./src/input.ts":
/*!**********************!*\
  !*** ./src/input.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   downJustPressed: () => (/* binding */ downJustPressed),
/* harmony export */   downJustReleased: () => (/* binding */ downJustReleased),
/* harmony export */   downPressed: () => (/* binding */ downPressed),
/* harmony export */   jumpJustPressed: () => (/* binding */ jumpJustPressed),
/* harmony export */   jumpJustReleased: () => (/* binding */ jumpJustReleased),
/* harmony export */   jumpPressed: () => (/* binding */ jumpPressed),
/* harmony export */   leftJustPressed: () => (/* binding */ leftJustPressed),
/* harmony export */   leftJustReleased: () => (/* binding */ leftJustReleased),
/* harmony export */   leftPressed: () => (/* binding */ leftPressed),
/* harmony export */   resetInput: () => (/* binding */ resetInput),
/* harmony export */   rightJustPressed: () => (/* binding */ rightJustPressed),
/* harmony export */   rightJustReleased: () => (/* binding */ rightJustReleased),
/* harmony export */   rightPressed: () => (/* binding */ rightPressed),
/* harmony export */   startInput: () => (/* binding */ startInput),
/* harmony export */   stopInput: () => (/* binding */ stopInput),
/* harmony export */   upJustPressed: () => (/* binding */ upJustPressed),
/* harmony export */   upJustReleased: () => (/* binding */ upJustReleased),
/* harmony export */   upPressed: () => (/* binding */ upPressed),
/* harmony export */   updateInput: () => (/* binding */ updateInput)
/* harmony export */ });
/* harmony import */ var _screen__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/screen */ "./src/screen.ts");

const ANALOG_STICK_THRESHOLD = 0.5;
let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let downPressed = false;
let jumpPressed = false;
let leftJustPressed = false;
let rightJustPressed = false;
let upJustPressed = false;
let downJustPressed = false;
let jumpJustPressed = false;
let leftJustReleased = false;
let rightJustReleased = false;
let upJustReleased = false;
let downJustReleased = false;
let jumpJustReleased = false;
let lastLeftPressed = false;
let lastRightPressed = false;
let lastUpPressed = false;
let lastDownPressed = false;
let lastJumpPressed = false;
let leftKeyPressed = 0;
let rightKeyPressed = 0;
let upKeyPressed = 0;
let downKeyPressed = 0;
let jumpKeyPressed = false;
let leftScreenTouched = 0;
let rightScreenTouched = 0;
let hideCursorTimeoutId = null;
let cursorHidden = false;
class TouchData {
    timestampDown = 0;
    xDown = 0;
    yDown = 0;
    x = 0;
    y = 0;
}
const touchDatas = new Map();
function resetInput() {
    leftKeyPressed = 0;
    rightKeyPressed = 0;
    upKeyPressed = 0;
    downKeyPressed = 0;
    jumpKeyPressed = false;
    leftScreenTouched = 0;
    rightScreenTouched = 0;
    touchDatas.clear();
}
// export function isTouchOnlyDevice(): boolean {
//     const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
//     const supportsHover = window.matchMedia('(hover: hover)').matches;
//     const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
//     return supportsTouch && !supportsHover && isCoarsePointer;
// }
function startInput() {
    window.addEventListener('click', onClick);
    window.addEventListener('mousemove', resetHideCursorTimer);
    window.addEventListener('mouseenter', resetHideCursorTimer);
    window.addEventListener('mouseleave', cancelHideCursorTimer);
    resetHideCursorTimer();
    window.addEventListener('touchstart', onTouch, { passive: false });
    window.addEventListener('touchmove', onTouch, { passive: false });
    window.addEventListener('touchend', onTouch, { passive: false });
    window.addEventListener('touchcancel', onTouch, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    resetInput();
}
function stopInput() {
    window.removeEventListener('click', onClick);
    window.removeEventListener('mousemove', resetHideCursorTimer);
    window.removeEventListener('mouseenter', resetHideCursorTimer);
    window.removeEventListener('mouseleave', cancelHideCursorTimer);
    cancelHideCursorTimer();
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('touchstart', onTouch);
    window.removeEventListener('touchmove', onTouch);
    window.removeEventListener('touchend', onTouch);
    window.removeEventListener('touchcancel', onTouch);
    resetInput();
}
function updateInput(gs) {
    let touchLeft = false;
    let touchRight = false;
    let touchUp = false;
    let touchDown = false;
    let touchJump = false;
    if (gs.harry.canStartClimbingUp() && ((rightScreenTouched !== 0 && gs.harry.dir === 0)
        || (leftScreenTouched !== 0 && gs.harry.dir === 1))) {
        touchUp = true;
    }
    else if (gs.harry.isClimbing()) {
        if (leftScreenTouched > rightScreenTouched) {
            if (gs.harry.rightTouchMeansDown) {
                touchUp = true;
            }
            else {
                touchDown = true;
            }
        }
        else if (rightScreenTouched > leftScreenTouched) {
            if (gs.harry.rightTouchMeansDown) {
                touchDown = true;
            }
            else {
                touchUp = true;
            }
        }
    }
    else if (leftScreenTouched > rightScreenTouched) {
        if (rightScreenTouched > 0) {
            touchRight = true;
            touchJump = true;
        }
        else {
            touchLeft = true;
        }
    }
    else if (rightScreenTouched > leftScreenTouched) {
        if (leftScreenTouched > 0) {
            touchLeft = true;
            touchJump = true;
        }
        else {
            touchRight = true;
        }
    }
    let gamepadLeft = false;
    let gamepadRight = false;
    let gamepadUp = false;
    let gamepadDown = false;
    let gamepadJump = false;
    const gamepads = navigator.getGamepads();
    if (gamepads) {
        for (let i = gamepads.length - 1; i >= 0; --i) {
            const gamepad = gamepads[i];
            if (!gamepad) {
                continue;
            }
            // D-pad left or left bumper or left stick
            if (gamepad.buttons[14]?.pressed || gamepad.buttons[4]?.pressed || gamepad.buttons[10]?.pressed) {
                gamepadLeft = true;
            }
            // D-pad right or right bumper or right stick
            if (gamepad.buttons[15]?.pressed || gamepad.buttons[5]?.pressed || gamepad.buttons[11]?.pressed) {
                gamepadRight = true;
            }
            // D-pad up
            if (gamepad.buttons[12]?.pressed) {
                gamepadUp = true;
            }
            // D-pad down
            if (gamepad.buttons[13]?.pressed) {
                gamepadDown = true;
            }
            // Analog stick left and right
            const leftStickX = gamepad.axes[0];
            const rightStickX = gamepad.axes[2];
            if (leftStickX < -ANALOG_STICK_THRESHOLD || rightStickX < -ANALOG_STICK_THRESHOLD) {
                gamepadLeft = true;
            }
            else if (leftStickX > ANALOG_STICK_THRESHOLD || rightStickX > ANALOG_STICK_THRESHOLD) {
                gamepadRight = true;
            }
            // Analog stick up and down
            const leftStickY = gamepad.axes[1];
            const rightStickY = gamepad.axes[3];
            if (leftStickY < -ANALOG_STICK_THRESHOLD || rightStickY < -ANALOG_STICK_THRESHOLD) {
                gamepadUp = true;
            }
            else if (leftStickY > ANALOG_STICK_THRESHOLD || rightStickY > ANALOG_STICK_THRESHOLD) {
                gamepadDown = true;
            }
            // Non-directional buttons
            if (gamepad.buttons[0]?.pressed || gamepad.buttons[1]?.pressed || gamepad.buttons[2]?.pressed
                || gamepad.buttons[3]?.pressed || gamepad.buttons[6]?.pressed || gamepad.buttons[7]?.pressed
                || gamepad.buttons[8]?.pressed || gamepad.buttons[9]?.pressed) {
                gamepadJump = true;
            }
        }
    }
    leftPressed = touchLeft || gamepadLeft || leftKeyPressed > rightKeyPressed;
    rightPressed = touchRight || gamepadRight || rightKeyPressed > leftKeyPressed;
    upPressed = touchUp || gamepadUp || upKeyPressed > downKeyPressed;
    downPressed = touchDown || gamepadDown || downKeyPressed > upKeyPressed;
    jumpPressed = touchJump || gamepadJump || jumpKeyPressed;
    leftJustPressed = leftPressed && !lastLeftPressed;
    leftJustReleased = !leftPressed && lastLeftPressed;
    rightJustPressed = rightPressed && !lastRightPressed;
    rightJustReleased = !rightPressed && lastRightPressed;
    upJustPressed = upPressed && !lastUpPressed;
    upJustReleased = !upPressed && lastUpPressed;
    downJustPressed = downPressed && !lastDownPressed;
    downJustReleased = !downPressed && lastDownPressed;
    jumpJustPressed = jumpPressed && !lastJumpPressed;
    jumpJustReleased = !jumpPressed && lastJumpPressed;
    lastLeftPressed = leftPressed;
    lastRightPressed = rightPressed;
    lastUpPressed = upPressed;
    lastDownPressed = downPressed;
    lastJumpPressed = jumpPressed;
}
function cancelHideCursorTimer() {
    if (hideCursorTimeoutId !== null) {
        clearTimeout(hideCursorTimeoutId);
        hideCursorTimeoutId = null;
    }
    if (cursorHidden) {
        document.body.style.cursor = 'default';
        cursorHidden = false;
    }
}
function resetHideCursorTimer() {
    cancelHideCursorTimer();
    hideCursorTimeoutId = window.setTimeout(() => {
        document.body.style.cursor = 'none';
        cursorHidden = true;
    }, 3000);
}
function onTouch(e) {
    e.preventDefault();
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    const landscape = innerWidth >= innerHeight;
    for (let i = e.changedTouches.length - 1; i >= 0; --i) {
        const t = e.changedTouches[i];
        let x;
        let y;
        if (landscape) {
            x = t.clientX;
            y = t.clientY;
        }
        else {
            x = innerHeight - 1 - t.clientY;
            y = t.clientX;
        }
        switch (e.type) {
            case 'touchstart': {
                const touchData = new TouchData();
                touchData.timestampDown = Date.now();
                touchData.xDown = touchData.x = x;
                touchData.yDown = touchData.y = y;
                touchDatas.set(t.identifier, touchData);
                break;
            }
            case 'touchmove': {
                resetHideCursorTimer();
                const touchData = touchDatas.get(t.identifier);
                if (touchData) {
                    touchData.x = x;
                    touchData.y = y;
                }
                break;
            }
            case 'touchend':
            case 'touchcancel': {
                const touchData = touchDatas.get(t.identifier);
                if (touchData) {
                    if (x < 64 && y < 64 && touchData.xDown < 64 && touchData.yDown < 64) {
                        (0,_screen__WEBPACK_IMPORTED_MODULE_0__.exit)();
                    }
                    touchDatas.delete(t.identifier);
                }
                break;
            }
        }
    }
    const halfInnerWidth = innerWidth / 2;
    leftScreenTouched = rightScreenTouched = 0;
    for (const [identifier, touchData] of Array.from(touchDatas)) {
        if (touchData.x < halfInnerWidth) {
            leftScreenTouched = touchData.timestampDown;
        }
        else {
            rightScreenTouched = touchData.timestampDown;
        }
        outer: {
            for (let i = e.touches.length - 1; i >= 0; --i) {
                const t = e.touches[i];
                if (t.identifier === identifier) {
                    break outer;
                }
            }
            touchDatas.delete(identifier);
        }
    }
}
function onClick(e) {
    if (!(e.clientX && e.clientY)) {
        return;
    }
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    let x;
    let y;
    if (innerWidth >= innerHeight) {
        x = e.clientX;
        y = e.clientY;
    }
    else {
        x = innerHeight - 1 - e.clientY;
        y = e.clientX;
    }
    if (x < 64 && y < 64) {
        (0,_screen__WEBPACK_IMPORTED_MODULE_0__.exit)();
    }
}
function onKeyDown(e) {
    switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
            leftKeyPressed = rightKeyPressed + 1;
            break;
        case 'KeyD':
        case 'ArrowRight':
            rightKeyPressed = leftKeyPressed + 1;
            break;
        case 'KeyW':
        case 'ArrowUp':
            upKeyPressed = downKeyPressed + 1;
            break;
        case 'KeyS':
        case 'ArrowDown':
            downKeyPressed = upKeyPressed + 1;
            break;
        case 'Escape':
            (0,_screen__WEBPACK_IMPORTED_MODULE_0__.exit)();
            break;
        default:
            jumpKeyPressed = true;
            break;
    }
    // touch testing
    // switch (e.code) {
    //     case 'KeyA':
    //         leftScreenTouched = rightScreenTouched + 1;
    //         break;
    //     case 'Quote':
    //         rightScreenTouched = leftScreenTouched + 1;
    //         break;
    // }
}
function onKeyUp(e) {
    switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
            leftKeyPressed = 0;
            break;
        case 'KeyD':
        case 'ArrowRight':
            rightKeyPressed = 0;
            break;
        case 'KeyW':
        case 'ArrowUp':
            upKeyPressed = 0;
            break;
        case 'KeyS':
        case 'ArrowDown':
            downKeyPressed = 0;
            break;
        case 'Escape':
            break;
        default:
            jumpKeyPressed = false;
            break;
    }
    // touch testing
    // switch (e.code) {
    //     case 'KeyA':
    //         leftScreenTouched = 0;
    //         break;
    //     case 'Quote':
    //         rightScreenTouched = 0;
    //         break;
    // }    
}


/***/ }),

/***/ "./src/math.ts":
/*!*********************!*\
  !*** ./src/math.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TAU: () => (/* binding */ TAU),
/* harmony export */   clamp: () => (/* binding */ clamp),
/* harmony export */   gaussianRandom: () => (/* binding */ gaussianRandom),
/* harmony export */   mod: () => (/* binding */ mod),
/* harmony export */   spritesIntersect: () => (/* binding */ spritesIntersect)
/* harmony export */ });
const TAU = 2 * Math.PI;
// TODO REMOVE
function gaussianRandom(mean, stdDev) {
    let u;
    let v;
    do {
        u = Math.random();
    } while (u === 0);
    do {
        v = Math.random();
    } while (v === 0);
    return (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)) * stdDev + mean;
}
function clamp(value, min, max) {
    return (value < min) ? min : (value > max) ? max : value;
}
function mod(n, m) {
    return ((n % m) + m) % m;
}
function spritesIntersect(mask0, x0, y0, mask1, x1, y1) {
    x0 = Math.floor(x0);
    y0 = Math.floor(y0);
    const width0 = mask0[0].length;
    const height0 = mask0.length;
    const xMax0 = width0 - 1;
    const yMax0 = height0 - 1;
    x1 = Math.floor(x1) - x0;
    y1 = Math.floor(y1) - y0;
    const width1 = mask1[0].length;
    const height1 = mask1.length;
    const xMax1 = x1 + width1 - 1;
    const yMax1 = y1 + height1 - 1;
    if (yMax1 < 0 || yMax0 < y1 || xMax1 < 0 || xMax0 < x1) {
        return false;
    }
    const xMin = Math.max(0, x1);
    const xMax = Math.min(xMax0, xMax1);
    const yMin = Math.max(0, y1);
    const yMax = Math.min(yMax0, yMax1);
    for (let y = yMin; y <= yMax; ++y) {
        for (let x = xMin; x <= xMax; ++x) {
            if (mask0[y][x] && mask1[y - y1][x - x1]) {
                return true;
            }
        }
    }
    return false;
}


/***/ }),

/***/ "./src/progress.ts":
/*!*************************!*\
  !*** ./src/progress.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   enter: () => (/* binding */ enter),
/* harmony export */   exit: () => (/* binding */ exit)
/* harmony export */ });
/* harmony import */ var _download__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./download */ "./src/download.ts");
/* harmony import */ var _audio__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./audio */ "./src/audio.ts");
/* harmony import */ var _start__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./start */ "./src/start.ts");
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./store */ "./src/store.ts");
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./graphics */ "./src/graphics.ts");





let landscape = false;
let progressBar;
function enter() {
    window.addEventListener('resize', windowResized);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    const mainElement = document.getElementById('main-content');
    mainElement.innerHTML = `
            <div id="progress-container">
                <div id="progress-div">
                    <progress id="loading-progress" value="0" max="100"></progress>
                </div>
            </div>`;
    progressBar = document.getElementById('loading-progress');
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', messageReceived);
    }
    windowResized();
    (0,_download__WEBPACK_IMPORTED_MODULE_0__.download)('resources.zip', frac => {
        progressBar.value = 100 * frac;
        setProgressBarColor('#0075FF');
    }).then(onDownload);
}
function exit() {
    window.removeEventListener('resize', windowResized);
    window.removeEventListener('touchmove', onTouchMove);
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', messageReceived);
    }
}
function setProgressBarColor(color) {
    if (progressBar) {
        if (color === progressBar.style.color) {
            return;
        }
        progressBar.style.color = color;
    }
    const styleId = 'progress-bar-style';
    let styleSheet = document.getElementById(styleId);
    if (!styleSheet) {
        styleSheet = document.createElement("style");
        styleSheet.id = styleId;
        document.head.appendChild(styleSheet);
    }
    styleSheet.innerText = `
        #loading-progress::-webkit-progress-value {
            background-color: ${color} !important;
        }
        #loading-progress::-moz-progress-bar {
            background-color: ${color} !important;
        }
    `;
}
function messageReceived(e) {
    if (progressBar) {
        progressBar.value = 100 * e.data;
        setProgressBarColor('#48D800');
    }
}
function onDownload(arrayBuffer) {
    __webpack_require__.e(/*! import() | jszip */ "vendors").then(__webpack_require__.t.bind(__webpack_require__, /*! jszip */ "./node_modules/jszip/dist/jszip.min.js", 23)).then(({ default: JSZip }) => {
        new JSZip().loadAsync(arrayBuffer).then(zip => Object.entries(zip.files).forEach(entry => {
            const [filename, fileData] = entry;
            if (fileData.dir) {
                return;
            }
            if (filename.endsWith('.mp3')) {
                (0,_audio__WEBPACK_IMPORTED_MODULE_1__.decodeAudioData)(filename, fileData);
            }
        }));
    });
    (0,_audio__WEBPACK_IMPORTED_MODULE_1__.waitForDecodes)().then(() => {
        document.getElementById('loading-progress').value = 100;
        setTimeout(() => {
            (0,_store__WEBPACK_IMPORTED_MODULE_3__.loadStore)();
            (0,_graphics__WEBPACK_IMPORTED_MODULE_4__.init)().then(() => {
                exit();
                (0,_start__WEBPACK_IMPORTED_MODULE_2__.enter)();
            });
        }, 10);
    });
}
function onTouchMove(e) {
    e.preventDefault();
}
function windowResized() {
    const progressContainer = document.getElementById('progress-container');
    const progressDiv = document.getElementById('progress-div');
    progressContainer.style.width = progressContainer.style.height = '';
    progressContainer.style.left = progressContainer.style.top = '';
    progressContainer.style.display = 'none';
    progressDiv.style.top = progressDiv.style.left = progressDiv.style.transform = '';
    progressDiv.style.display = 'none';
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    landscape = (innerWidth >= innerHeight);
    progressContainer.style.left = '0px';
    progressContainer.style.top = '0px';
    progressContainer.style.width = `${innerWidth}px`;
    progressContainer.style.height = `${innerHeight}px`;
    progressContainer.style.display = 'block';
    progressDiv.style.display = 'flex';
    if (landscape) {
        const rect = progressDiv.getBoundingClientRect();
        progressDiv.style.left = `${(innerWidth - rect.width) / 2}px`;
        progressDiv.style.top = `${(innerHeight - rect.height) / 2}px`;
    }
    else {
        progressDiv.style.transform = 'rotate(-90deg)';
        const rect = progressDiv.getBoundingClientRect();
        progressDiv.style.left = `${(innerWidth - rect.height) / 2}px`;
        progressDiv.style.top = `${(innerHeight - rect.width) / 2}px`;
    }
}


/***/ }),

/***/ "./src/screen.ts":
/*!***********************!*\
  !*** ./src/screen.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dpr: () => (/* binding */ dpr),
/* harmony export */   enter: () => (/* binding */ enter),
/* harmony export */   exit: () => (/* binding */ exit),
/* harmony export */   render: () => (/* binding */ render)
/* harmony export */ });
/* harmony import */ var _animate__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./animate */ "./src/animate.ts");
/* harmony import */ var _wake_lock__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./wake-lock */ "./src/wake-lock.ts");
/* harmony import */ var _start__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./start */ "./src/start.ts");
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./graphics */ "./src/graphics.ts");
/* harmony import */ var _input__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./input */ "./src/input.ts");
/* harmony import */ var _game_game__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./game/game */ "./src/game/game.ts");
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./store */ "./src/store.ts");
/* harmony import */ var _audio__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./audio */ "./src/audio.ts");








let dpr;
let mainCanvas;
let mainCtx;
let mainCanvasWidth;
let mainCanvasHeight;
let screenCanvas;
let ctx;
let removeMediaEventListener = null;
let exiting = false;
let screenWidth;
let screenHeight;
let screenX;
let screenY;
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
}
;
function enter() {
    exiting = false;
    (0,_game_game__WEBPACK_IMPORTED_MODULE_5__.initGame)();
    document.body.style.backgroundColor = '#C2BCB1';
    screenCanvas = new OffscreenCanvas(_graphics__WEBPACK_IMPORTED_MODULE_3__.Resolution.WIDTH, _graphics__WEBPACK_IMPORTED_MODULE_3__.Resolution.HEIGHT);
    ctx = screenCanvas.getContext('2d');
    const mainElement = document.getElementById("main-content");
    mainElement.innerHTML = `<canvas id="main-canvas" class="canvas" width="1" height="1"></canvas>`;
    mainCanvas = document.getElementById("main-canvas");
    mainCanvas.style.touchAction = 'none';
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('resize', onWindowResized);
    window.addEventListener('focus', onVisibilityChanged);
    window.addEventListener('blur', onVisibilityChanged);
    document.addEventListener('visibilitychange', onVisibilityChanged);
    (0,_wake_lock__WEBPACK_IMPORTED_MODULE_1__.acquireWakeLock)();
    updatePixelRatio();
    (0,_input__WEBPACK_IMPORTED_MODULE_4__.startInput)();
    (0,_animate__WEBPACK_IMPORTED_MODULE_0__.startAnimation)();
}
function cleanUp() {
    if (exiting) {
        return;
    }
    exiting = true;
    (0,_animate__WEBPACK_IMPORTED_MODULE_0__.stopAnimation)();
    (0,_input__WEBPACK_IMPORTED_MODULE_4__.stopInput)();
    (0,_audio__WEBPACK_IMPORTED_MODULE_7__.stopAll)();
    (0,_wake_lock__WEBPACK_IMPORTED_MODULE_1__.releaseWakeLock)();
    window.removeEventListener('beforeunload', onBeforeUnload);
    window.removeEventListener('resize', onWindowResized);
    window.removeEventListener('focus', onVisibilityChanged);
    window.removeEventListener('blur', onVisibilityChanged);
    document.removeEventListener('visibilitychange', onVisibilityChanged);
    if (removeMediaEventListener !== null) {
        removeMediaEventListener();
        removeMediaEventListener = null;
    }
    (0,_store__WEBPACK_IMPORTED_MODULE_6__.saveStore)();
}
function exit() {
    cleanUp();
    (0,_start__WEBPACK_IMPORTED_MODULE_2__.enter)();
}
function render() {
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
    (0,_game_game__WEBPACK_IMPORTED_MODULE_5__.renderScreen)(ctx);
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
    mainCanvas = document.getElementById("main-canvas");
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
    }
    else {
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
    screenWidth = screenHeight * _graphics__WEBPACK_IMPORTED_MODULE_3__.PhysicalDimensions.WIDTH / _graphics__WEBPACK_IMPORTED_MODULE_3__.PhysicalDimensions.HEIGHT;
    if (screenWidth > mainCanvasWidth) {
        screenWidth = mainCanvasWidth;
        screenHeight = screenWidth * _graphics__WEBPACK_IMPORTED_MODULE_3__.PhysicalDimensions.HEIGHT / _graphics__WEBPACK_IMPORTED_MODULE_3__.PhysicalDimensions.WIDTH;
        screenX = 0;
        screenY = Math.round((mainCanvasHeight - screenHeight) / 2);
    }
    else {
        screenX = Math.round((mainCanvasWidth - screenWidth) / 2);
        screenY = 0;
    }
    render();
}
function onVisibilityChanged() {
    if (!exiting && document.visibilityState === 'visible' && document.hasFocus()) {
        (0,_wake_lock__WEBPACK_IMPORTED_MODULE_1__.acquireWakeLock)();
        (0,_input__WEBPACK_IMPORTED_MODULE_4__.resetInput)();
        (0,_animate__WEBPACK_IMPORTED_MODULE_0__.startAnimation)();
    }
    else {
        (0,_animate__WEBPACK_IMPORTED_MODULE_0__.stopAnimation)();
        (0,_audio__WEBPACK_IMPORTED_MODULE_7__.stopAll)();
    }
}
function onBeforeUnload() {
    cleanUp();
}


/***/ }),

/***/ "./src/start.ts":
/*!**********************!*\
  !*** ./src/start.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   enter: () => (/* binding */ enter),
/* harmony export */   exit: () => (/* binding */ exit)
/* harmony export */ });
/* harmony import */ var _audio__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./audio */ "./src/audio.ts");
/* harmony import */ var _screen__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./screen */ "./src/screen.ts");
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./store */ "./src/store.ts");



let landscape = false;
let dropdownToggleListener;
let dropdownCloseListener;
const optionListners = new Array(3);
let selectedDifficulty;
function enter() {
    selectedDifficulty = _store__WEBPACK_IMPORTED_MODULE_2__.store.difficulty;
    document.body.style.backgroundColor = '#0F0F0F';
    window.addEventListener('resize', windowResized);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    const mainElement = document.getElementById('main-content');
    mainElement.innerHTML = `
            <div id="start-container">
                <div id="start-div">
                    <div id="high-score-div">High Score: ${_store__WEBPACK_IMPORTED_MODULE_2__.store.highScores[selectedDifficulty]}</div>
                    <div class="volume-div">
                        <span class="left-volume-label material-icons" id="left-volume-span" 
                                lang="en">volume_mute</span>
                        <input type="range" id="volume-input" min="0" max="100" step="any" value="10">
                        <span class="right-volume-label" id="right-volume-span" lang="en">100</span>
                    </div>
                    <div class="difficulty-div">
                        <div id="dropdown-label">Difficulty:</div>
                        <div id="custom-dropdown" class="custom-dropdown">
                            <div class="dropdown-selected">${getDifficultyName()}</div>
                            <div class="dropdown-options">
                                <div class="dropdown-option" data-value="0">Easy</div>
                                <div class="dropdown-option" data-value="1">Normal</div>
                                <div class="dropdown-option" data-value="2">Hard</div>
                            </div>
                        </div>    
                    </div>    
                    <div id="go-div">${_store__WEBPACK_IMPORTED_MODULE_2__.store.gameState
        ? '<button id="start-button">New Game</button><button id="continue-button">Continue</button>'
        : '<button id="start-button">Start</button>'}
                    </div>
                </div>
            </div>`;
    const highScore = document.getElementById('high-score-div');
    (0,_audio__WEBPACK_IMPORTED_MODULE_0__.setVolume)(_store__WEBPACK_IMPORTED_MODULE_2__.store.volume);
    const volumeInput = document.getElementById('volume-input');
    volumeInput.addEventListener('input', volumeChanged);
    volumeInput.value = String(_store__WEBPACK_IMPORTED_MODULE_2__.store.volume);
    const startButton = document.getElementById('start-button');
    startButton.addEventListener('click', startButtonClicked);
    const continueButton = document.getElementById('continue-button');
    continueButton?.addEventListener('click', continueButtonClicked);
    const dropdown = document.getElementById('custom-dropdown');
    const selected = dropdown.querySelector('.dropdown-selected');
    const optionItems = dropdown.querySelectorAll('.dropdown-option');
    // Toggle dropdown open/closed on click
    dropdownToggleListener = () => dropdown.classList.toggle('open');
    selected.addEventListener('click', dropdownToggleListener);
    // Close if clicked outside
    dropdownCloseListener = event => {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove('open');
        }
    };
    document.addEventListener('click', dropdownCloseListener);
    // Handle clicks on each option
    optionItems.forEach(option => {
        const difficulty = Number(option.getAttribute('data-value'));
        optionListners[difficulty] = () => {
            selectedDifficulty = difficulty;
            highScore.textContent = `High Score: ${_store__WEBPACK_IMPORTED_MODULE_2__.store.highScores[selectedDifficulty]}`;
            selected.textContent = option.textContent; // Update the "selected" text            
            dropdown.classList.remove('open'); // Close dropdown
        };
        option.addEventListener('click', optionListners[difficulty]);
    });
    windowResized();
}
function exit() {
    window.removeEventListener('resize', windowResized);
    window.removeEventListener('touchmove', onTouchMove);
    const volumeInput = document.getElementById('volume-input');
    volumeInput.removeEventListener('input', volumeChanged);
    const startButton = document.getElementById('start-button');
    startButton.removeEventListener('click', startButtonClicked);
    const continueButton = document.getElementById('continue-button');
    continueButton?.removeEventListener('click', continueButtonClicked);
    const dropdown = document.getElementById('custom-dropdown');
    document.removeEventListener('click', dropdownCloseListener);
    const selected = dropdown.querySelector('.dropdown-selected');
    selected.removeEventListener('click', dropdownToggleListener);
    const optionItems = dropdown.querySelectorAll('.dropdown-option');
    optionItems.forEach(option => option.removeEventListener('click', optionListners[Number(option.getAttribute('data-value'))]));
    (0,_store__WEBPACK_IMPORTED_MODULE_2__.saveStore)();
}
function getDifficultyName() {
    switch (_store__WEBPACK_IMPORTED_MODULE_2__.store.difficulty) {
        case _store__WEBPACK_IMPORTED_MODULE_2__.Difficulty.EASY:
            return "Easy";
        case _store__WEBPACK_IMPORTED_MODULE_2__.Difficulty.NORMAL:
            return "Normal";
        default:
            return "Hard";
    }
}
function startButtonClicked() {
    _store__WEBPACK_IMPORTED_MODULE_2__.store.gameState = undefined;
    _store__WEBPACK_IMPORTED_MODULE_2__.store.difficulty = selectedDifficulty;
    continueButtonClicked();
}
function continueButtonClicked() {
    (0,_audio__WEBPACK_IMPORTED_MODULE_0__.setVolume)(_store__WEBPACK_IMPORTED_MODULE_2__.store.volume);
    exit();
    (0,_screen__WEBPACK_IMPORTED_MODULE_1__.enter)();
}
function onTouchMove(e) {
    let target = e.target;
    while (target !== null) {
        if (target.id === 'volume-input') {
            if (landscape) {
                return;
            }
            const volumeInput = target;
            const max = parseFloat(volumeInput.max);
            const min = parseFloat(volumeInput.min);
            const rect = volumeInput.getBoundingClientRect();
            const value = (1 - ((e.touches[0].clientY - rect.top) / rect.height)) * (max - min) + min;
            volumeInput.value = value.toString();
            volumeInput.dispatchEvent(new Event('input'));
            return;
        }
        target = target.parentElement;
    }
    e.preventDefault();
}
function volumeChanged() {
    const leftVolumeSpan = document.getElementById('left-volume-span');
    const volumeInput = document.getElementById('volume-input');
    const rightVolumeSpan = document.getElementById('right-volume-span');
    _store__WEBPACK_IMPORTED_MODULE_2__.store.volume = 100 * (+volumeInput.value - +volumeInput.min) / (+volumeInput.max - +volumeInput.min);
    volumeInput.style.setProperty('--thumb-position', `${_store__WEBPACK_IMPORTED_MODULE_2__.store.volume}%`);
    if (_store__WEBPACK_IMPORTED_MODULE_2__.store.volume === 0) {
        leftVolumeSpan.textContent = 'volume_off';
    }
    else if (_store__WEBPACK_IMPORTED_MODULE_2__.store.volume < 33) {
        leftVolumeSpan.textContent = 'volume_mute';
    }
    else if (_store__WEBPACK_IMPORTED_MODULE_2__.store.volume < 66) {
        leftVolumeSpan.textContent = 'volume_down';
    }
    else {
        leftVolumeSpan.textContent = 'volume_up';
    }
    rightVolumeSpan.textContent = String(Math.round(_store__WEBPACK_IMPORTED_MODULE_2__.store.volume));
}
function windowResized() {
    const startContainer = document.getElementById('start-container');
    const startDiv = document.getElementById('start-div');
    const leftVolumeSpan = document.getElementById('left-volume-span');
    const rightVolumeSpan = document.getElementById('right-volume-span');
    startContainer.style.width = startContainer.style.height = '';
    startContainer.style.left = startContainer.style.top = '';
    startContainer.style.display = 'none';
    startDiv.style.left = startDiv.style.top = startDiv.style.transform = '';
    startDiv.style.display = 'none';
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    landscape = (innerWidth >= innerHeight);
    startContainer.style.left = '0px';
    startContainer.style.top = '0px';
    startContainer.style.width = `${innerWidth}px`;
    startContainer.style.height = `${innerHeight}px`;
    startContainer.style.display = 'block';
    startDiv.style.display = 'flex';
    leftVolumeSpan.style.width = '';
    leftVolumeSpan.style.display = 'inline-block';
    leftVolumeSpan.style.textAlign = 'center';
    leftVolumeSpan.textContent = '\u{1F507}';
    leftVolumeSpan.style.transform = '';
    rightVolumeSpan.style.width = '';
    rightVolumeSpan.style.display = 'inline-block';
    rightVolumeSpan.style.textAlign = 'center';
    rightVolumeSpan.textContent = '100';
    if (landscape) {
        const leftVolumeSpanWidth = leftVolumeSpan.getBoundingClientRect().width;
        leftVolumeSpan.style.width = `${leftVolumeSpanWidth}px`;
        const rightVolumeSpanWidth = rightVolumeSpan.getBoundingClientRect().width;
        rightVolumeSpan.style.width = `${rightVolumeSpanWidth}px`;
        const rect = startDiv.getBoundingClientRect();
        startDiv.style.left = `${(innerWidth - rect.width) / 2}px`;
        startDiv.style.top = `${(innerHeight - rect.height) / 2}px`;
    }
    else {
        const leftVolumeSpanHeight = leftVolumeSpan.getBoundingClientRect().height;
        leftVolumeSpan.style.width = `${leftVolumeSpanHeight}px`;
        const rightVolumeSpanHeight = rightVolumeSpan.getBoundingClientRect().height;
        rightVolumeSpan.style.width = `${rightVolumeSpanHeight}px`;
        startDiv.style.transform = 'rotate(-90deg)';
        const rect = startDiv.getBoundingClientRect();
        startDiv.style.left = `${(innerWidth - rect.height) / 2}px`;
        startDiv.style.top = `${(innerHeight - rect.width) / 2}px`;
    }
    rightVolumeSpan.textContent = String(_store__WEBPACK_IMPORTED_MODULE_2__.store.volume);
    volumeChanged();
}


/***/ }),

/***/ "./src/store.ts":
/*!**********************!*\
  !*** ./src/store.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Difficulty: () => (/* binding */ Difficulty),
/* harmony export */   LOCAL_STORAGE_KEY: () => (/* binding */ LOCAL_STORAGE_KEY),
/* harmony export */   Store: () => (/* binding */ Store),
/* harmony export */   loadStore: () => (/* binding */ loadStore),
/* harmony export */   saveStore: () => (/* binding */ saveStore),
/* harmony export */   store: () => (/* binding */ store)
/* harmony export */ });
/* harmony import */ var _game_game_state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game/game-state */ "./src/game/game-state.ts");

const LOCAL_STORAGE_KEY = 'pitfall-store';
var Difficulty;
(function (Difficulty) {
    Difficulty[Difficulty["EASY"] = 0] = "EASY";
    Difficulty[Difficulty["NORMAL"] = 1] = "NORMAL";
    Difficulty[Difficulty["HARD"] = 2] = "HARD";
})(Difficulty || (Difficulty = {}));
class Store {
    highScores = [0, 0, 0];
    volume = 10;
    difficulty = 0;
    gameState = undefined;
}
let store;
function saveStore() {
    if (store.gameState?.gameOver) {
        store.gameState = undefined;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
}
function loadStore() {
    if (store) {
        return;
    }
    const str = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (str) {
        try {
            store = JSON.parse(str);
            store.gameState = (store.gameState && !store.gameState.gameOver)
                ? new _game_game_state__WEBPACK_IMPORTED_MODULE_0__.GameState(store.gameState) : undefined;
        }
        catch {
            store = new Store();
        }
    }
    else {
        store = new Store();
    }
}


/***/ }),

/***/ "./src/wake-lock.ts":
/*!**************************!*\
  !*** ./src/wake-lock.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   acquireWakeLock: () => (/* binding */ acquireWakeLock),
/* harmony export */   releaseWakeLock: () => (/* binding */ releaseWakeLock)
/* harmony export */ });
let wakeLock = null;
let acquiringWaitLock = false;
function acquireWakeLock() {
    if (!acquiringWaitLock && wakeLock === null && 'wakeLock' in navigator) {
        acquiringWaitLock = true;
        navigator.wakeLock.request('screen')
            .then(w => {
            if (acquiringWaitLock) {
                wakeLock = w;
                wakeLock.addEventListener("release", () => {
                    if (!acquiringWaitLock) {
                        wakeLock = null;
                    }
                });
            }
        }).catch(_ => {
        }).finally(() => acquiringWaitLock = false);
    }
}
function releaseWakeLock() {
    if (wakeLock !== null && 'wakeLock' in navigator) {
        acquiringWaitLock = false;
        wakeLock.release()
            .then(() => {
            if (!acquiringWaitLock) {
                wakeLock = null;
            }
        }).catch(_ => {
        });
    }
}


/***/ })

}]);
//# sourceMappingURL=app.bundle.js.map