import { exit } from '@/screen';

let leftKeyPressed = 0;
let rightKeyPressed = 0;
let upKeyPressed = 0;
let downKeyPressed = 0;
let jumpKeyPressed = false;

// let leftScreenTouched = false;
// let rightScreenTouched = false;

let hideCursorTimeoutId: number | null = null;
let cursorHidden = false;

// let lastLeftGamepadDown = false;
// let lastRightGamepadDown = false;
// let lastFireGamepadDown = false;

class TouchData {
    timestampDown = 0;
    xDown = 0;
    yDown = 0;
    x = 0;
    y = 0;
}

const touchDatas: Map<number, TouchData> = new Map();

export function resetInput() {
    leftKeyPressed = 0;
    rightKeyPressed = 0;
    upKeyPressed = 0;
    downKeyPressed = 0;
    jumpKeyPressed = false; 
    
    // leftScreenTouched = false;
    // rightScreenTouched = false;

    touchDatas.clear();
}

export function isTouchOnlyDevice(): boolean {
    const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    return supportsTouch && !supportsHover && isCoarsePointer;
}

export function startInput() {
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

export function stopInput() {
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

export function updateInput() {
    // const gamepads = navigator.getGamepads();
    // if (!gamepads) {
    //     return;
    // }

    // let leftDown = false;
    // let rightDown = false;
    // let fireDown = false;
    // for (let i = gamepads.length - 1; i >= 0; --i) {
    //     const gamepad = gamepads[i];
    //     if (!gamepad) {
    //         continue;            
    //     } 

    //     // D-pad left or left shoulder or left stick
    //     if (gamepad.buttons[14]?.pressed || gamepad.buttons[4]?.pressed || gamepad.buttons[10]?.pressed) {
    //         leftDown = true;
    //     }

    //     // D-pad right or right shoulder or right stick
    //     if (gamepad.buttons[15]?.pressed || gamepad.buttons[5]?.pressed || gamepad.buttons[11]?.pressed) {
    //         rightDown = true;
    //     }

    //     // Analog stick left or right
    //     const horizontalAxis = gamepad.axes[0];
    //     if (horizontalAxis < -0.5) {
    //         leftDown = true;
    //     } else if (horizontalAxis > 0.5) {
    //         rightDown = true;
    //     }

    //     // Non-directional buttons
    //     if (gamepad.buttons[0]?.pressed || gamepad.buttons[1]?.pressed || gamepad.buttons[2]?.pressed 
    //             || gamepad.buttons[3]?.pressed || gamepad.buttons[6]?.pressed || gamepad.buttons[7]?.pressed 
    //             || gamepad.buttons[8]?.pressed || gamepad.buttons[9]?.pressed) {
    //         fireDown = true;
    //     }
    // }

    // if (leftDown) {
    //     if (!lastLeftGamepadDown) {            
    //         leftKeyPressed = rightKeyPressed + 1;
    //     }
    // } else if (lastLeftGamepadDown) {
    //     leftKeyPressed = 0;
    // }
    // lastLeftGamepadDown = leftDown;

    // if (rightDown) {
    //     if (!lastRightGamepadDown) {            
    //         rightKeyPressed = leftKeyPressed + 1;
    //     }
    // } else if (lastRightGamepadDown) {
    //     rightKeyPressed = 0;
    // }
    // lastRightGamepadDown = rightDown;

    // if (fireDown) {
    //     if (!lastFireGamepadDown) {
    //         fireKeyPressed = true;
    //     }
    // } else if (lastFireGamepadDown) {
    //     fireKeyPressed = false;
    // }
    // lastFireGamepadDown = fireDown;
}

export function isLeftPressed(): boolean {
    return leftKeyPressed > rightKeyPressed;
}

export function isRightPressed(): boolean {
    return rightKeyPressed > leftKeyPressed;
}

export function isUpPressed(): boolean {
    return upKeyPressed > downKeyPressed;
}

export function isDownPressed(): boolean {
    return downKeyPressed > upKeyPressed;
}

export function isJumpPressed(): boolean {
    return jumpKeyPressed;
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

function onTouch(e: TouchEvent) {
    e.preventDefault();    

    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    const landscape = innerWidth >= innerHeight;

    for (let i = e.changedTouches.length - 1; i >= 0; --i) {
        const t = e.changedTouches[i];
        let x: number;
        let y: number;
        if (landscape) {
            x = t.clientX;
            y = t.clientY;
        } else {
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
                        exit();
                    } 
                    touchDatas.delete(t.identifier);
                }              
                break;
            }
        }
    }
    
    let td: TouchData | null = null;
    for (const [ identifier, touchData ] of Array.from(touchDatas)) {
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
    // if (td) {
    //     if (td.x < innerWidth / 2) {
    //         leftScreenTouched = true;
    //         rightScreenTouched = false;
    //     } else {
    //         leftScreenTouched = false;
    //         rightScreenTouched = true;
    //     }
    // } else {
    //     leftScreenTouched = rightScreenTouched = false;
    // }
}

function onClick(e: MouseEvent) {
    if (!(e.clientX && e.clientY)) {
        return;
    }

    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    let x: number;
    let y: number;
    if (innerWidth >= innerHeight) {
        x = e.clientX;
        y = e.clientY;
    } else {
        x = innerHeight - 1 - e.clientY;
        y = e.clientX;
    }

    if (x < 64 && y < 64) {
        exit();
    }
}

function onKeyDown(e: KeyboardEvent) {
    switch(e.code) {
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
            exit();
            break;    
        default:
            jumpKeyPressed = true;
            break;            
    }
}

function onKeyUp(e: KeyboardEvent) {
    switch(e.code) {
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
}