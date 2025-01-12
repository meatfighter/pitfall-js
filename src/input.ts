import { exit } from '@/screen';

const ANALOG_STICK_THRESHOLD = 0.5;

export let leftPressed = false;
export let rightPressed = false;
export let upPressed = false;
export let downPressed = false;
export let jumpPressed = false;

export let leftJustPressed = false;
export let rightJustPressed = false;
export let upJustPressed = false;
export let downJustPressed = false;
export let jumpJustPressed = false;

export let leftJustReleased = false;
export let rightJustReleased = false;
export let upJustReleased = false;
export let downJustReleased = false;
export let jumpJustReleased = false;

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
            const leftStickX  = gamepad.axes[0];
            const rightStickX  = gamepad.axes[2];
            if (leftStickX < -ANALOG_STICK_THRESHOLD || rightStickX  < -ANALOG_STICK_THRESHOLD) {
                gamepadLeft = true;
            } else if (leftStickX > ANALOG_STICK_THRESHOLD || rightStickX > ANALOG_STICK_THRESHOLD) {
                gamepadRight = true;
            }

            // Analog stick up and down
            const leftStickY  = gamepad.axes[1];
            const rightStickY  = gamepad.axes[3];
            if (leftStickY  < -ANALOG_STICK_THRESHOLD || rightStickY < -ANALOG_STICK_THRESHOLD) {
                gamepadUp = true;
            } else if (leftStickY > ANALOG_STICK_THRESHOLD || rightStickY > ANALOG_STICK_THRESHOLD) {
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

    leftPressed = gamepadLeft || leftKeyPressed > rightKeyPressed;
    rightPressed = gamepadRight || rightKeyPressed > leftKeyPressed;
    upPressed = gamepadUp || upKeyPressed > downKeyPressed;
    downPressed = gamepadDown || downKeyPressed > upKeyPressed;
    jumpPressed = gamepadJump || jumpKeyPressed;    

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
            exit();
            break;    
        default:
            jumpKeyPressed = true;
            break;            
    }

    // switch (e.code) {
    //     case 'KeyA':
    //         if (rightKeyPressed > 0) {
    //             jumpKeyPressed = true;
    //             leftKeyPressed = 0;
    //             downKeyPressed = 0;                
    //         } else {
    //             jumpKeyPressed = false;
    //             leftKeyPressed = 1;
    //             downKeyPressed = 1;
    //         }            
    //         break;
    //     case 'Quote':
    //         if (leftKeyPressed > 0) {
    //             jumpKeyPressed = true;
    //             rightKeyPressed = 0;
    //             upKeyPressed = 0;
    //         } else {
    //             jumpKeyPressed = false;
    //             rightKeyPressed = 1;
    //             upKeyPressed = 1;
    //         }
    //         break;
    // }
}

function onKeyUp(e: KeyboardEvent) {
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

    // switch (e.code) {
    //     case 'KeyA':
    //         leftKeyPressed = 0;
    //         jumpKeyPressed = false;
    //         downKeyPressed = 0;
    //         break;
    //     case 'Quote':
    //         rightKeyPressed = 0;
    //         jumpKeyPressed = false;
    //         upKeyPressed = 0;
    //         break;
    // }
}