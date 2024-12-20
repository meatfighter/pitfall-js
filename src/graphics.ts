class RGBColor {
    constructor(public readonly r: number, public readonly g: number, public readonly b: number) {        
    }
}

export type Sprite = ImageBitmap;
export type Mask = boolean[][];

export enum Resolution {
    WIDTH = 160,
    HEIGHT = 228,
}

export enum PhysicalDimensions {
    WIDTH = 4,
    HEIGHT = 3,
}

export const colors: string[] = new Array<string>(256);

export const harrySprites: Sprite[][] = new Array<Sprite[]>(2); // direction, sprite
export const harryMasks: Mask[][] = new Array<Mask[]>(2); // direction, mask

export const cobraSprites: Sprite[][] = new Array<Sprite[]>(2); // direction, sprite
export const cobraMasks: Mask[][] = new Array<Mask[]>(2); // direction, mask

export const crocSprites: Sprite[][] = new Array<Sprite[]>(2); // direction, sprite
export const crocMasks: Mask[][] = new Array<Mask[]>(2); // direction, mask

export const sorpionSprites: Sprite[][] = new Array<Sprite[]>(2); // direction, sprite
export const sorpionMasks: Mask[][] = new Array<Mask[]>(2); // direction, mask

export const logSprites: Sprite[] = new Array<Sprite>(2);
export const logMasks: Mask[] = new Array<Mask>(2);

export const fireSprites: Sprite[] = new Array<Sprite>(2);
export const fireMasks: Mask[] = new Array<Mask>(2);

export const goldSprites: Sprite[] = new Array<Sprite>(2);
export const goldMasks: Mask[] = new Array<Mask>(2);

export const silverSprites: Sprite[] = new Array<Sprite>(2);
export const silverMasks: Mask[] = new Array<Mask>(2);

export let moneySprite: Sprite;
export let moneyMask: Mask;

export let ringSprite: Sprite;
export let ringMask: Mask;

export let wallSprite: Sprite;

export const charSprites: Sprite[][] = new Array<Sprite[]>(256); // color, character

async function createSprite(width: number, height: number, callback: (imageData: ImageData) => void): 
        Promise<{ imageBitmap: Sprite, imageData: ImageData }> {
    return new Promise(resolve => {
        const imageData = new ImageData(width, height);
        callback(imageData);
        createImageBitmap(imageData).then(imageBitmap => resolve({ imageBitmap, imageData }));
    });
}

function createMask(imageData: ImageData): Mask {
    const mask = new Array<boolean[]>(imageData.height);
    const { data } = imageData;
    for (let y = 0, i = 3; y < imageData.height; ++y) {
        mask[y] = new Array<boolean>(imageData.width);
        for (let x = 0; x < imageData.width; ++x, i += 4) {
            mask[y][x] = data[i] !== 0;
        }
    }
    return mask;
}

function createSpriteAndMask(binStr: string, palette: RGBColor[], spriteOffset: number, colorOffset: number, 
        height: number, flipped: boolean, spriteCallback: (sprite: Sprite) => void, 
        maskCallback: ((mask: Mask) => void) | null, promises: Promise<any>[]) {

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
        } else {
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

function extractPalette(): RGBColor[] {
    const palette = new Array<RGBColor>(256);
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

function setColor(imageData: ImageData, x: number, y: number, color: RGBColor) {
    const offset = 4 * (y * imageData.width + x);
    const data = imageData.data;
    data[offset] = color.r;
    data[offset + 1] = color.g;
    data[offset + 2] = color.b;
    data[offset + 3] = 0xFF;
}

export async function init() {

    enum Offsets {
        CLIMBCOLTAB = 0,
        RUNCOLTAB = 22,
        LOGCOLOR = 43,
        FIRECOLOR = 59,
        COBRACOLOR = 75,
        CROCOCOLOR = 91,
        MONEYBAGCOLOR = 107,
        SCORPIONCOLOR = 123,
        WALLCOLOR = 139,
        RINGCOLOR = 155,
        GOLDBARCOLOR = 171,
        SILVERBARCOLOR = 187,
        PFLEAVESTAB = 203,
        HARRY0 = 219,
        HARRY1 = 241,
        HARRY2 = 263,
        HARRY3 = 285,
        HARRY4 = 307,
        HARRY5 = 329,
        HARRY6 = 351,
        HARRY7 = 373,
        BRANCHTAB = 395,
        ONEHOLE = 404,
        THREEHOLES = 412,
        PIT = 420,
        LOG0 = 428,
        FIRE0 = 444,
        COBRA0 = 460,
        COBRA1 = 476,
        CROCO0 = 492,
        CROCO1 = 508,
        MONEYBAG = 524,
        SCORPION0 = 540,
        SCORPION1 = 556,
        WALL = 572,
        BAR0 = 588,
        BAR1 = 604,
        RING = 620,
        ZERO = 636,
        ONE = 644,
        TWO = 652,
        THREE = 660,
        FOUR = 668,
        SIX = 684,
        SEVEN = 692,
        EIGHT = 700,
        NINE = 708,
        COLON = 716,
    }

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

    const promises: Promise<any>[] = [];

    // harry
    for (let dir = 0; dir < 2; ++dir) {
        harrySprites[dir] = new Array<Sprite>(8);
        harryMasks[dir] = new Array<Mask>(8);
        for (let i = 0; i < 8; ++i) {
            let j = (i <= 5) ? 5 - i : i;
            createSpriteAndMask(binStr, palette, Offsets.HARRY0 + 22 * i, 
                    (i === 7) ? Offsets.CLIMBCOLTAB : Offsets.RUNCOLTAB, 22, dir === 1, 
                    sprite => harrySprites[dir][j] = sprite, mask => harryMasks[dir][j] = mask, promises);
        }
    }

    // log
    createSpriteAndMask(binStr, palette, Offsets.LOG0, Offsets.LOGCOLOR, 16, true,
            sprite => logSprites[0] = sprite, mask => logMasks[0] = mask, promises);
    createSpriteAndMask(binStr, palette, Offsets.LOG0, Offsets.LOGCOLOR, 16, false,
            sprite => logSprites[1] = sprite, mask => logMasks[1] = mask, promises);
            
    // fire
    createSpriteAndMask(binStr, palette, Offsets.FIRE0, Offsets.FIRECOLOR, 16, true,
            sprite => fireSprites[0] = sprite, mask => fireMasks[0] = mask, promises);
    createSpriteAndMask(binStr, palette, Offsets.FIRE0, Offsets.FIRECOLOR, 16, false,
            sprite => fireSprites[1] = sprite, mask => fireMasks[1] = mask, promises);

    // gold
    createSpriteAndMask(binStr, palette, Offsets.BAR1, Offsets.GOLDBARCOLOR, 16, false,
            sprite => goldSprites[0] = sprite, mask => goldMasks[0] = mask, promises);
    createSpriteAndMask(binStr, palette, Offsets.BAR0, Offsets.GOLDBARCOLOR, 16, false,
            sprite => goldSprites[1] = sprite, mask => goldMasks[1] = mask, promises);
    
    // silver
    createSpriteAndMask(binStr, palette, Offsets.BAR1, Offsets.SILVERBARCOLOR, 16, false,
            sprite => silverSprites[0] = sprite, mask => silverMasks[0] = mask, promises);
    createSpriteAndMask(binStr, palette, Offsets.BAR0, Offsets.SILVERBARCOLOR, 16, false,
            sprite => silverSprites[1] = sprite, mask => silverMasks[1] = mask, promises);

    // money
    createSpriteAndMask(binStr, palette, Offsets.MONEYBAG, Offsets.MONEYBAGCOLOR, 16, false, 
            sprite => moneySprite = sprite, mask => moneyMask = mask, promises);

    // ring
    createSpriteAndMask(binStr, palette, Offsets.RING, Offsets.RINGCOLOR, 16, false, sprite => ringSprite = sprite, 
            mask => ringMask = mask, promises);

    // wall
    createSpriteAndMask(binStr, palette, Offsets.WALL, Offsets.WALLCOLOR, 16, false, sprite => wallSprite = sprite, 
            null, promises);

    // characters        
    for (let color = 0; color < 256; ++color) {        
        const charCol = palette[color];
        charSprites[color] = new Array<Sprite>(11);
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