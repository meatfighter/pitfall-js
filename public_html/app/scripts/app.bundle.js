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

/***/ "./src/game/game-state.ts":
/*!********************************!*\
  !*** ./src/game/game-state.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GameState: () => (/* binding */ GameState)
/* harmony export */ });
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/store */ "./src/store.ts");
/* harmony import */ var _harry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./harry */ "./src/game/harry.ts");


class GameState {
    harry = new _harry__WEBPACK_IMPORTED_MODULE_1__.Harry();
    save() {
        (0,_store__WEBPACK_IMPORTED_MODULE_0__.saveStore)();
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
/* harmony export */   renderScreen: () => (/* binding */ renderScreen),
/* harmony export */   resetGame: () => (/* binding */ resetGame),
/* harmony export */   saveGame: () => (/* binding */ saveGame),
/* harmony export */   update: () => (/* binding */ update)
/* harmony export */ });
/* harmony import */ var _game_state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game-state */ "./src/game/game-state.ts");
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/graphics */ "./src/graphics.ts");


let gs;
function resetGame() {
    gs = new _game_state__WEBPACK_IMPORTED_MODULE_0__.GameState();
}
function saveGame() {
    gs.save();
}
function update() {
    gs.harry.update(gs);
}
function renderScreen(ctx) {
    ctx.fillStyle = _graphics__WEBPACK_IMPORTED_MODULE_1__.colors[_graphics__WEBPACK_IMPORTED_MODULE_1__.Colors.DARK_GREEN];
    ctx.fillRect(0, 0, _graphics__WEBPACK_IMPORTED_MODULE_1__.Resolution.WIDTH, 51);
    ctx.fillStyle = _graphics__WEBPACK_IMPORTED_MODULE_1__.colors[_graphics__WEBPACK_IMPORTED_MODULE_1__.Colors.GREEN];
    ctx.fillRect(0, 51, _graphics__WEBPACK_IMPORTED_MODULE_1__.Resolution.WIDTH, 60);
    ctx.fillStyle = _graphics__WEBPACK_IMPORTED_MODULE_1__.colors[_graphics__WEBPACK_IMPORTED_MODULE_1__.Colors.LIGHT_YELLOW];
    ctx.fillRect(0, 111, _graphics__WEBPACK_IMPORTED_MODULE_1__.Resolution.WIDTH, 16);
    ctx.fillStyle = _graphics__WEBPACK_IMPORTED_MODULE_1__.colors[_graphics__WEBPACK_IMPORTED_MODULE_1__.Colors.DARK_YELLOW];
    ctx.fillRect(0, 127, _graphics__WEBPACK_IMPORTED_MODULE_1__.Resolution.WIDTH, 15);
    ctx.fillRect(0, 174, _graphics__WEBPACK_IMPORTED_MODULE_1__.Resolution.WIDTH, 6);
    gs.harry.render(ctx);
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

class Harry {
    x = 12;
    y = 119;
    update(gs) {
    }
    render(ctx) {
        ctx.drawImage(_graphics__WEBPACK_IMPORTED_MODULE_0__.harrySprites[0][0], this.x - 4, this.y - 22);
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
/* harmony export */   charSprites: () => (/* binding */ charSprites),
/* harmony export */   cobraMasks: () => (/* binding */ cobraMasks),
/* harmony export */   cobraSprites: () => (/* binding */ cobraSprites),
/* harmony export */   colors: () => (/* binding */ colors),
/* harmony export */   crocMasks: () => (/* binding */ crocMasks),
/* harmony export */   crocSprites: () => (/* binding */ crocSprites),
/* harmony export */   fireMasks: () => (/* binding */ fireMasks),
/* harmony export */   fireSprites: () => (/* binding */ fireSprites),
/* harmony export */   goldMasks: () => (/* binding */ goldMasks),
/* harmony export */   goldSprites: () => (/* binding */ goldSprites),
/* harmony export */   harryMasks: () => (/* binding */ harryMasks),
/* harmony export */   harrySprites: () => (/* binding */ harrySprites),
/* harmony export */   init: () => (/* binding */ init),
/* harmony export */   logMasks: () => (/* binding */ logMasks),
/* harmony export */   logSprites: () => (/* binding */ logSprites),
/* harmony export */   moneyMask: () => (/* binding */ moneyMask),
/* harmony export */   moneySprite: () => (/* binding */ moneySprite),
/* harmony export */   ringMask: () => (/* binding */ ringMask),
/* harmony export */   ringSprite: () => (/* binding */ ringSprite),
/* harmony export */   silverMasks: () => (/* binding */ silverMasks),
/* harmony export */   silverSprites: () => (/* binding */ silverSprites),
/* harmony export */   sorpionMasks: () => (/* binding */ sorpionMasks),
/* harmony export */   sorpionSprites: () => (/* binding */ sorpionSprites),
/* harmony export */   wallSprite: () => (/* binding */ wallSprite)
/* harmony export */ });
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
    Resolution[Resolution["WIDTH"] = 152] = "WIDTH";
    Resolution[Resolution["HEIGHT"] = 180] = "HEIGHT";
})(Resolution || (Resolution = {}));
// TODO UNCOMMENT
var PhysicalDimensions;
(function (PhysicalDimensions) {
    PhysicalDimensions[PhysicalDimensions["WIDTH"] = 3.8] = "WIDTH";
    PhysicalDimensions[PhysicalDimensions["HEIGHT"] = 2.3684210526315788] = "HEIGHT";
})(PhysicalDimensions || (PhysicalDimensions = {}));
// export enum PhysicalDimensions { // TODO REMOVE
//     WIDTH = 304,
//     HEIGHT = 180,
// }
var Colors;
(function (Colors) {
    Colors[Colors["BROWN"] = 18] = "BROWN";
    Colors[Colors["YELLOW"] = 30] = "YELLOW";
    Colors[Colors["ORANGE"] = 62] = "ORANGE";
    Colors[Colors["RED"] = 72] = "RED";
    Colors[Colors["GREEN"] = 214] = "GREEN";
    Colors[Colors["BLUE"] = 164] = "BLUE";
    Colors[Colors["YELLOW_GREEN"] = 200] = "YELLOW_GREEN";
    Colors[Colors["PINK"] = 74] = "PINK";
    Colors[Colors["BLACK"] = 0] = "BLACK";
    Colors[Colors["GREY"] = 6] = "GREY";
    Colors[Colors["WHITE"] = 14] = "WHITE";
    Colors[Colors["DARK_GREEN"] = 210] = "DARK_GREEN";
    Colors[Colors["DARK_RED"] = 66] = "DARK_RED";
    Colors[Colors["DARK_YELLOW"] = 20] = "DARK_YELLOW";
    Colors[Colors["LIGHT_YELLOW"] = 24] = "LIGHT_YELLOW";
})(Colors || (Colors = {}));
const colors = new Array(256);
const harrySprites = new Array(2); // direction, sprite
const harryMasks = new Array(2); // direction, mask
const cobraSprites = new Array(2); // direction, sprite
const cobraMasks = new Array(2); // direction, mask
const crocSprites = new Array(2); // direction, sprite
const crocMasks = new Array(2); // direction, mask
const sorpionSprites = new Array(2); // direction, sprite
const sorpionMasks = new Array(2); // direction, mask
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
const charSprites = new Array(256); // color, character
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
        Offsets[Offsets["PFLEAVESTAB"] = 203] = "PFLEAVESTAB";
        Offsets[Offsets["HARRY0"] = 219] = "HARRY0";
        Offsets[Offsets["HARRY1"] = 241] = "HARRY1";
        Offsets[Offsets["HARRY2"] = 263] = "HARRY2";
        Offsets[Offsets["HARRY3"] = 285] = "HARRY3";
        Offsets[Offsets["HARRY4"] = 307] = "HARRY4";
        Offsets[Offsets["HARRY5"] = 329] = "HARRY5";
        Offsets[Offsets["HARRY6"] = 351] = "HARRY6";
        Offsets[Offsets["HARRY7"] = 373] = "HARRY7";
        Offsets[Offsets["BRANCHTAB"] = 395] = "BRANCHTAB";
        Offsets[Offsets["ONEHOLE"] = 404] = "ONEHOLE";
        Offsets[Offsets["THREEHOLES"] = 412] = "THREEHOLES";
        Offsets[Offsets["PIT"] = 420] = "PIT";
        Offsets[Offsets["LOG0"] = 428] = "LOG0";
        Offsets[Offsets["FIRE0"] = 444] = "FIRE0";
        Offsets[Offsets["COBRA0"] = 460] = "COBRA0";
        Offsets[Offsets["COBRA1"] = 476] = "COBRA1";
        Offsets[Offsets["CROCO0"] = 492] = "CROCO0";
        Offsets[Offsets["CROCO1"] = 508] = "CROCO1";
        Offsets[Offsets["MONEYBAG"] = 524] = "MONEYBAG";
        Offsets[Offsets["SCORPION0"] = 540] = "SCORPION0";
        Offsets[Offsets["SCORPION1"] = 556] = "SCORPION1";
        Offsets[Offsets["WALL"] = 572] = "WALL";
        Offsets[Offsets["BAR0"] = 588] = "BAR0";
        Offsets[Offsets["BAR1"] = 604] = "BAR1";
        Offsets[Offsets["RING"] = 620] = "RING";
        Offsets[Offsets["ZERO"] = 636] = "ZERO";
        Offsets[Offsets["ONE"] = 644] = "ONE";
        Offsets[Offsets["TWO"] = 652] = "TWO";
        Offsets[Offsets["THREE"] = 660] = "THREE";
        Offsets[Offsets["FOUR"] = 668] = "FOUR";
        Offsets[Offsets["SIX"] = 684] = "SIX";
        Offsets[Offsets["SEVEN"] = 692] = "SEVEN";
        Offsets[Offsets["EIGHT"] = 700] = "EIGHT";
        Offsets[Offsets["NINE"] = 708] = "NINE";
        Offsets[Offsets["COLON"] = 716] = "COLON";
    })(Offsets || (Offsets = {}));
    const palette = extractPalette();
    const binStr = atob('0tLS0tLS0tLS0tLSyMjIyMjISkpKEtLS0tLS0tLS0tLIyMjIyMjISkpKEhISEhISEhISEhISEhISEhISEhISEj4+Pi4uLi'
        + '4uLi4uAAAGAAYAAAAAAAAAAABCQtLS0tLS0tLS0tLS0tLS0tIGBgYGBgYGBgYGBgYSBgYGDg4ODg4ODg4ODg4ODg4ODgZCQkIGQkJCBkJCQg'
        + 'ZCQkJCQh4eHh4eHh4eDg4ODg4OHh4eHh4eHh4ODg4ODg4ODgYGBgYGBgYODg4ODg4ODg7/z4MBfz0YAP/+vBj+/HgwAAAAAAAzctoeHBhYWH'
        + 'w+GhgQGBgYAACAgMNiYjY+HBgYPD46OBgYEBgYGAAQICIkNDIWHhwYGBwcGBgYGBAYGBgADAgoKD4KDhwYGBwcGBgYGBgQGBgYAAACQ0R0FB'
        + 'wcGBgYPD46OBgYEBgYGAAYEBwYGBgYGBgYGBgcHhoYGBAYGBgAAAAAAAAAY/L23MDAwMDA8NCQ0NDAADAQEBAWFBQWEhYeHBg4ODweGgIYGB'
        + 'gYftuZmZmZmZl/f3///////3h4eP//////AAEDD3////8AGCRaWlpmfl52fl52PBgAAMPnfjwYPHx8eDg4MDAQEAD++fn5+WAQCAwMCDgwQA'
        + 'AA/vn5+vpgEAgMDAg4MIAAAAAAAAD/qwMDCy664IAAAAAAAAAA/6tV/wYEAAAAAAAAPnd3Y3tjb2M2NhwIHDYAhTI9ePjGgpCI2HAAAAAAAE'
        + 'kzPHj6xJKI2HAAAAAAAAD+urq6/u7u7v66urr+7u7uAPj8/v5+PgAQAFQAkgAQAAD4/P7+fj4AACgAVAAQAAAAADhsREREbDgQOHw4AAAAPG'
        + 'ZmZmZmZjw8GBgYGBg4GH5gYDwGBkY8PEYGDAwGRjwMDAx+TCwcDHxGBgZ8YGB+PGZmZnxgYjwYGBgYDAZCfjxmZjw8ZmY8PEYGPmZmZjwAGB'
        + 'gAABgYAA==');
    const promises = [];
    // harry
    for (let dir = 0; dir < 2; ++dir) {
        harrySprites[dir] = new Array(8);
        harryMasks[dir] = new Array(8);
        for (let i = 0; i < 8; ++i) {
            let j = (i <= 5) ? 5 - i : i;
            createSpriteAndMask(binStr, palette, Offsets.HARRY0 + 22 * i, (i === 7) ? Offsets.CLIMBCOLTAB : Offsets.RUNCOLTAB, 22, dir === 1, sprite => harrySprites[dir][j] = sprite, mask => harryMasks[dir][j] = mask, promises);
        }
    }
    for (let dir = 0; dir < 2; ++dir) {
        const flipped = dir === 1;
        // cobra
        cobraSprites[dir] = new Array(2);
        cobraMasks[dir] = new Array(2);
        createSpriteAndMask(binStr, palette, Offsets.COBRA1, Offsets.COBRACOLOR, 16, flipped, sprite => cobraSprites[dir][0] = sprite, mask => cobraMasks[dir][0] = mask, promises);
        createSpriteAndMask(binStr, palette, Offsets.COBRA0, Offsets.COBRACOLOR, 16, flipped, sprite => cobraSprites[dir][1] = sprite, mask => cobraMasks[dir][1] = mask, promises);
        // croc
        crocSprites[dir] = new Array(2);
        crocMasks[dir] = new Array(2);
        createSpriteAndMask(binStr, palette, Offsets.CROCO1, Offsets.CROCOCOLOR, 16, flipped, sprite => crocSprites[dir][0] = sprite, mask => crocMasks[dir][0] = mask, promises);
        createSpriteAndMask(binStr, palette, Offsets.CROCO0, Offsets.CROCOCOLOR, 16, flipped, sprite => crocSprites[dir][1] = sprite, mask => crocMasks[dir][1] = mask, promises);
        // sorpion
        sorpionSprites[dir] = new Array(2);
        sorpionMasks[dir] = new Array(2);
        createSpriteAndMask(binStr, palette, Offsets.SCORPION1, Offsets.SCORPIONCOLOR, 16, flipped, sprite => sorpionSprites[dir][0] = sprite, mask => sorpionMasks[dir][0] = mask, promises);
        createSpriteAndMask(binStr, palette, Offsets.SCORPION0, Offsets.SCORPIONCOLOR, 16, flipped, sprite => sorpionSprites[dir][1] = sprite, mask => sorpionMasks[dir][1] = mask, promises);
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
    await Promise.all(promises);
}


/***/ }),

/***/ "./src/input.ts":
/*!**********************!*\
  !*** ./src/input.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isFirePressed: () => (/* binding */ isFirePressed),
/* harmony export */   isLeftPressed: () => (/* binding */ isLeftPressed),
/* harmony export */   isRightPressed: () => (/* binding */ isRightPressed),
/* harmony export */   isTouchOnlyDevice: () => (/* binding */ isTouchOnlyDevice),
/* harmony export */   startInput: () => (/* binding */ startInput),
/* harmony export */   stopInput: () => (/* binding */ stopInput),
/* harmony export */   updateInput: () => (/* binding */ updateInput)
/* harmony export */ });
/* harmony import */ var _screen__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/screen */ "./src/screen.ts");

let leftKeyPressed = 0;
let rightKeyPressed = 0;
let fireKeyPressed = false;
let leftScreenTouched = false;
let rightScreenTouched = false;
let hideCursorTimeoutId = null;
let cursorHidden = false;
let lastLeftGamepadDown = false;
let lastRightGamepadDown = false;
let lastFireGamepadDown = false;
class TouchData {
    timestampDown = 0;
    xDown = 0;
    yDown = 0;
    x = 0;
    y = 0;
}
const touchDatas = new Map();
function isTouchOnlyDevice() {
    const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    return supportsTouch && !supportsHover && isCoarsePointer;
}
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
    leftKeyPressed = 0;
    rightKeyPressed = 0;
    fireKeyPressed = false;
    leftScreenTouched = false;
    rightScreenTouched = false;
    touchDatas.clear();
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
    leftKeyPressed = 0;
    rightKeyPressed = 0;
    fireKeyPressed = false;
    leftScreenTouched = false;
    rightScreenTouched = false;
    touchDatas.clear();
}
function updateInput() {
    const gamepads = navigator.getGamepads();
    if (!gamepads) {
        return;
    }
    let leftDown = false;
    let rightDown = false;
    let fireDown = false;
    for (let i = gamepads.length - 1; i >= 0; --i) {
        const gamepad = gamepads[i];
        if (!gamepad) {
            continue;
        }
        // D-pad left or left shoulder or left stick
        if (gamepad.buttons[14]?.pressed || gamepad.buttons[4]?.pressed || gamepad.buttons[10]?.pressed) {
            leftDown = true;
        }
        // D-pad right or right shoulder or right stick
        if (gamepad.buttons[15]?.pressed || gamepad.buttons[5]?.pressed || gamepad.buttons[11]?.pressed) {
            rightDown = true;
        }
        // Analog stick left or right
        const horizontalAxis = gamepad.axes[0];
        if (horizontalAxis < -0.5) {
            leftDown = true;
        }
        else if (horizontalAxis > 0.5) {
            rightDown = true;
        }
        // Non-directional buttons
        if (gamepad.buttons[0]?.pressed || gamepad.buttons[1]?.pressed || gamepad.buttons[2]?.pressed
            || gamepad.buttons[3]?.pressed || gamepad.buttons[6]?.pressed || gamepad.buttons[7]?.pressed
            || gamepad.buttons[8]?.pressed || gamepad.buttons[9]?.pressed) {
            fireDown = true;
        }
    }
    if (leftDown) {
        if (!lastLeftGamepadDown) {
            leftKeyPressed = rightKeyPressed + 1;
        }
    }
    else if (lastLeftGamepadDown) {
        leftKeyPressed = 0;
    }
    lastLeftGamepadDown = leftDown;
    if (rightDown) {
        if (!lastRightGamepadDown) {
            rightKeyPressed = leftKeyPressed + 1;
        }
    }
    else if (lastRightGamepadDown) {
        rightKeyPressed = 0;
    }
    lastRightGamepadDown = rightDown;
    if (fireDown) {
        if (!lastFireGamepadDown) {
            fireKeyPressed = true;
        }
    }
    else if (lastFireGamepadDown) {
        fireKeyPressed = false;
    }
    lastFireGamepadDown = fireDown;
}
function isLeftPressed() {
    return leftScreenTouched || leftKeyPressed > rightKeyPressed;
}
function isRightPressed() {
    return rightScreenTouched || rightKeyPressed > leftKeyPressed;
}
function isFirePressed() {
    return fireKeyPressed;
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
    let td = null;
    for (const [identifier, touchData] of Array.from(touchDatas)) {
        if (!td || touchData.timestampDown > td.timestampDown) {
            td = touchData;
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
    if (td) {
        if (td.x < innerWidth / 2) {
            leftScreenTouched = true;
            rightScreenTouched = false;
        }
        else {
            leftScreenTouched = false;
            rightScreenTouched = true;
        }
    }
    else {
        leftScreenTouched = rightScreenTouched = false;
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
        case 'Escape':
            (0,_screen__WEBPACK_IMPORTED_MODULE_0__.exit)();
            break;
        default:
            fireKeyPressed = true;
            break;
    }
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
        case 'Escape':
            break;
        default:
            fireKeyPressed = false;
            break;
    }
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
/* harmony import */ var _sfx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sfx */ "./src/sfx.ts");
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
                (0,_sfx__WEBPACK_IMPORTED_MODULE_1__.decodeAudioData)(filename, fileData);
            }
        }));
    });
    (0,_sfx__WEBPACK_IMPORTED_MODULE_1__.waitForDecodes)().then(() => {
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
    (0,_game_game__WEBPACK_IMPORTED_MODULE_5__.resetGame)();
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
    (0,_game_game__WEBPACK_IMPORTED_MODULE_5__.saveGame)();
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
        (0,_animate__WEBPACK_IMPORTED_MODULE_0__.startAnimation)();
    }
    else {
        (0,_animate__WEBPACK_IMPORTED_MODULE_0__.stopAnimation)();
    }
}
function onBeforeUnload() {
    cleanUp();
}


/***/ }),

/***/ "./src/sfx.ts":
/*!********************!*\
  !*** ./src/sfx.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decodeAudioData: () => (/* binding */ decodeAudioData),
/* harmony export */   getVolume: () => (/* binding */ getVolume),
/* harmony export */   playSoundEffect: () => (/* binding */ playSoundEffect),
/* harmony export */   setVolume: () => (/* binding */ setVolume),
/* harmony export */   waitForDecodes: () => (/* binding */ waitForDecodes)
/* harmony export */ });
const audioContext = new AudioContext();
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
function playSoundEffect(name) {
    if (audioContext.state === 'suspended') {
        if (docVisible) {
            audioContext.resume().then(() => playSoundEffect(name));
        }
        return;
    }
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers.get(name);
    source.connect(masterGain);
    source.start();
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
/* harmony import */ var _sfx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sfx */ "./src/sfx.ts");
/* harmony import */ var _screen__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./screen */ "./src/screen.ts");
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./store */ "./src/store.ts");



let landscape = false;
function enter() {
    document.body.style.backgroundColor = '#0F0F0F';
    window.addEventListener('resize', windowResized);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    const mainElement = document.getElementById('main-content');
    mainElement.innerHTML = `
            <div id="start-container">
                <div id="start-div">
                    <div id="high-score-div">High Score: ${_store__WEBPACK_IMPORTED_MODULE_2__.store.highScore}</div>
                    <div class="volume-div">
                        <span class="left-volume-label material-icons" id="left-volume-span" 
                                lang="en">volume_mute</span>
                        <input type="range" id="volume-input" min="0" max="100" step="any" value="10">
                        <span class="right-volume-label" id="right-volume-span" lang="en">100</span>
                    </div>
                    <div class="checkboxes-div">
                        <div class="checkbox-item">
                            <input type="checkbox" id="autofire-checkbox" name="autofire-checkbox">
                            <label for="autofire-checkbox">
                                <span class="custom-checkbox"></span>
                                Autofire
                            </label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="tracer-checkbox" name="tracer-checkbox">
                            <label for="tracer-checkbox">
                                <span class="custom-checkbox"></span>
                                Tracer
                            </label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="fast-checkbox" name="fast-checkbox">
                            <label for="fast-checkbox">
                                <span class="custom-checkbox"></span>
                                Fast
                            </label>
                        </div>
                    </div>
                    <div id="go-div">
                        <button id="start-button">${isNewGame() ? 'Start' : 'Continue'}</button>
                    </div>
                </div>
            </div>`;
    (0,_sfx__WEBPACK_IMPORTED_MODULE_0__.setVolume)(_store__WEBPACK_IMPORTED_MODULE_2__.store.volume);
    const volumeInput = document.getElementById('volume-input');
    volumeInput.addEventListener('input', volumeChanged);
    volumeInput.value = String(_store__WEBPACK_IMPORTED_MODULE_2__.store.volume);
    const autofireCheckbox = document.getElementById('autofire-checkbox');
    autofireCheckbox.checked = _store__WEBPACK_IMPORTED_MODULE_2__.store.autofire;
    const tracerCheckbox = document.getElementById('tracer-checkbox');
    tracerCheckbox.checked = _store__WEBPACK_IMPORTED_MODULE_2__.store.tracer;
    const fastCheckbox = document.getElementById('fast-checkbox');
    fastCheckbox.checked = _store__WEBPACK_IMPORTED_MODULE_2__.store.fast;
    const startButton = document.getElementById('start-button');
    startButton.addEventListener('click', startButtonClicked);
    windowResized();
}
function exit() {
    window.removeEventListener('resize', windowResized);
    window.removeEventListener('touchmove', onTouchMove);
    const volumeInput = document.getElementById('volume-input');
    volumeInput.removeEventListener('input', volumeChanged);
    const startButton = document.getElementById('start-button');
    startButton.removeEventListener('click', startButtonClicked);
    const autofireCheckbox = document.getElementById('autofire-checkbox');
    _store__WEBPACK_IMPORTED_MODULE_2__.store.autofire = autofireCheckbox.checked;
    const tracerCheckbox = document.getElementById('tracer-checkbox');
    _store__WEBPACK_IMPORTED_MODULE_2__.store.tracer = tracerCheckbox.checked;
    const fastCheckbox = document.getElementById('fast-checkbox');
    _store__WEBPACK_IMPORTED_MODULE_2__.store.fast = fastCheckbox.checked;
    (0,_store__WEBPACK_IMPORTED_MODULE_2__.saveStore)();
}
function startButtonClicked() {
    (0,_sfx__WEBPACK_IMPORTED_MODULE_0__.setVolume)(_store__WEBPACK_IMPORTED_MODULE_2__.store.volume);
    const autofireCheckbox = document.getElementById('autofire-checkbox');
    _store__WEBPACK_IMPORTED_MODULE_2__.store.autofire = autofireCheckbox.checked;
    const tracerCheckbox = document.getElementById('tracer-checkbox');
    _store__WEBPACK_IMPORTED_MODULE_2__.store.tracer = tracerCheckbox.checked;
    const fastCheckbox = document.getElementById('fast-checkbox');
    _store__WEBPACK_IMPORTED_MODULE_2__.store.fast = fastCheckbox.checked;
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
function isNewGame() {
    return true; // TODO
}


/***/ }),

/***/ "./src/store.ts":
/*!**********************!*\
  !*** ./src/store.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LOCAL_STORAGE_KEY: () => (/* binding */ LOCAL_STORAGE_KEY),
/* harmony export */   Store: () => (/* binding */ Store),
/* harmony export */   loadStore: () => (/* binding */ loadStore),
/* harmony export */   saveStore: () => (/* binding */ saveStore),
/* harmony export */   store: () => (/* binding */ store)
/* harmony export */ });
/* harmony import */ var _input__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./input */ "./src/input.ts");

const LOCAL_STORAGE_KEY = 'pitfall-store';
class Store {
    highScore = 0;
    volume = 10;
    autofire = (0,_input__WEBPACK_IMPORTED_MODULE_0__.isTouchOnlyDevice)();
    tracer = false;
    fast = false;
}
let store;
function saveStore() {
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