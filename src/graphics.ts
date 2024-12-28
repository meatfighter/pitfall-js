class RGBColor {
    constructor(public readonly r: number, public readonly g: number, public readonly b: number) {        
    }
}

export type Sprite = ImageBitmap;
export type Mask = boolean[][];

export enum Resolution {
    WIDTH = 152,
    HEIGHT = 180,
}

export enum PhysicalDimensions {
    WIDTH = 4 * 152 / 160,
    HEIGHT = 3 * 180 / 228,
}

export enum Colors {
    BROWN = 0x12,
    YELLOW = 0x1e,
    ORANGE = 0x3e,
    RED = 0x48,
    GREEN = 0xd6,
    BLUE = 0xa4,
    YELLOW_GREEN = 0xc8,
    PINK = 0x4a,
    BLACK = 0x00,
    GREY = 0x06,
    WHITE = 0x0e,
    DARK_GREEN = 0xd2,
    DARK_RED = 0x42,
    DARK_YELLOW = 0x14,
    LIGHT_YELLOW = 0x18,
    DARK_BROWN = 0x10,    
}

export const colors: string[] = new Array<string>(256);

export const harrySprites: Sprite[][] = new Array<Sprite[]>(2); // direction, sprite
export const harryMasks: Mask[][] = new Array<Mask[]>(2); // direction, mask

export const cobraSprites: Sprite[][] = new Array<Sprite[]>(2); // direction, sprite
export const cobraMasks: Mask[][] = new Array<Mask[]>(2); // direction, mask

export const crocSprites: Sprite[][] = new Array<Sprite[]>(2); // direction, sprite
export const crocMasks: Mask[][] = new Array<Mask[]>(2); // direction, mask

export const sorpionSprites: Sprite[][] = new Array<Sprite[]>(2); // direction, sprite
export const scorpionMasks: Mask[][] = new Array<Mask[]>(2); // direction, mask

export const leavesSprites: Sprite[][] = new Array<Sprite[]>(2); // direction, sprite

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

export let branchesSprite: Sprite;

export const charSprites: Sprite[][] = new Array<Sprite[]>(256); // color, character

export const pitSprites: Sprite[][] = new Array<Sprite[]>(2); // color (0=black, 1=blue), sprite (0=bottom, 1=top)

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
        LEAVESCOLOR = 203,
        BRANCHESCOLOR = 207,
        LEAVES0 = 215,
        LEAVES1 = 219,
        LEAVES2 = 223,
        LEAVES3 = 227,
        HARRY0 = 231,
        HARRY1 = 253,
        HARRY2 = 275,
        HARRY3 = 297,
        HARRY4 = 319,
        HARRY5 = 341,
        HARRY6 = 363,
        HARRY7 = 385,
        BRANCHES = 407,
        PIT = 415,
        LOG0 = 420,
        FIRE0 = 436,
        COBRA0 = 452,
        COBRA1 = 468,
        CROCO0 = 484,
        CROCO1 = 500,
        MONEYBAG = 516,
        SCORPION0 = 532,
        SCORPION1 = 548,
        WALL = 564,
        BAR0 = 580,
        BAR1 = 596,
        RING = 612,
        ZERO = 628,
        ONE = 636,
        TWO = 644,
        THREE = 652,
        FOUR = 660,
        SIX = 676,
        SEVEN = 684,
        EIGHT = 692,
        NINE = 700,
        COLON = 708,
    }

    const palette = extractPalette();

    const binStr = atob('0tLS0tLS0tLS0tLSyMjIyMjISkpKEtLS0tLS0tLS0tLIyMjIyMjISkpKEhISEhISEhISEhISEhISEhISEhISEj4+Pi4uLi'
        + '4uLi4uAAAGAAYAAAAAAAAAAABCQtLS0tLS0tLS0tLS0tLS0tIGBgYGBgYGBgYGBgYSBgYGDg4ODg4ODg4ODg4ODg4ODgZCQkIGQkJCBkJCQg'
        + 'ZCQkJCQh4eHh4eHh4eDg4ODg4OHh4eHh4eHh4ODg4ODg4ODgYGBgYGBgYODg4ODg4ODg7S0tLSEBAQEBAQEBABg8//ABg9fxi8/v8wePz+AA'
        + 'AAAAAzctoeHBhYWHw+GhgQGBgYAACAgMNiYjY+HBgYPD46OBgYEBgYGAAQICIkNDIWHhwYGBwcGBgYGBAYGBgADAgoKD4KDhwYGBwcGBgYGB'
        + 'gQGBgYAAACQ0R0FBwcGBgYPD46OBgYEBgYGAAYEBwYGBgYGBgYGBgcHhoYGBAYGBgAAAAAAAAAY/L23MDAwMDA8NCQ0NDAADAQEBAWFBQWEh'
        + 'YeHBg4ODweGgIYGBh+25mZmZmZmQABAw9/ABgkWlpaZn5edn5edjwYAADD5348GDx8fHg4ODAwEBAA/vn5+flgEAgMDAg4MEAAAP75+fr6YB'
        + 'AIDAwIODCAAAAAAAAA/6sDAwsuuuCAAAAAAAAAAP+rVf8GBAAAAAAAAD53d2N7Y29jNjYcCBw2AIUyPXj4xoKQiNhwAAAAAABJMzx4+sSSiN'
        + 'hwAAAAAAAA/rq6uv7u7u7+urq6/u7u7gD4/P7+fj4AEABUAJIAEAAA+Pz+/n4+AAAoAFQAEAAAAAA4bERERGw4EDh8OAAAADxmZmZmZmY8PB'
        + 'gYGBgYOBh+YGA8BgZGPDxGBgwMBkY8DAwMfkwsHAx8RgYGfGBgfjxmZmZ8YGI8GBgYGAwGQn48ZmY8PGZmPDxGBj5mZmY8ABgYAAAYGAA=');

    const promises: Promise<any>[] = [];

    for (let dir = 0; dir < 2; ++dir) {
        const flipped = dir === 1;

        // leaves
        leavesSprites[dir] = new Array<Sprite>(4);
        for (let i = 0; i < 4; ++i) {
            createSpriteAndMask(binStr, palette, Offsets.LEAVES0 + 4 * i, Offsets.LEAVESCOLOR, 4, flipped,
                sprite => leavesSprites[dir][i] = sprite, null, promises);
        }

        // harry
        harrySprites[dir] = new Array<Sprite>(8);
        harryMasks[dir] = new Array<Mask>(8);
        for (let i = 0; i < 8; ++i) {
            const j = (i <= 5) ? 5 - i : i;
            createSpriteAndMask(binStr, palette, Offsets.HARRY0 + 22 * i, 
                    (i === 7) ? Offsets.CLIMBCOLTAB : Offsets.RUNCOLTAB, 22, flipped, 
                    sprite => harrySprites[dir][j] = sprite, mask => harryMasks[dir][j] = mask, promises);
        }        

        // cobra
        cobraSprites[dir] = new Array<Sprite>(2);
        cobraMasks[dir] = new Array<Mask>(2);
        createSpriteAndMask(binStr, palette, Offsets.COBRA1, Offsets.COBRACOLOR, 16, flipped,
                sprite => cobraSprites[dir][0] = sprite, mask => cobraMasks[dir][0] = mask, promises);
        createSpriteAndMask(binStr, palette, Offsets.COBRA0, Offsets.COBRACOLOR, 16, flipped,
                sprite => cobraSprites[dir][1] = sprite, mask => cobraMasks[dir][1] = mask, promises);

        // croc
        crocSprites[dir] = new Array<Sprite>(2);
        crocMasks[dir] = new Array<Mask>(2);
        createSpriteAndMask(binStr, palette, Offsets.CROCO1, Offsets.CROCOCOLOR, 16, flipped,
                sprite => crocSprites[dir][0] = sprite, mask => crocMasks[dir][0] = mask, promises);
        createSpriteAndMask(binStr, palette, Offsets.CROCO0, Offsets.CROCOCOLOR, 16, flipped,
                sprite => crocSprites[dir][1] = sprite, mask => crocMasks[dir][1] = mask, promises);

        // sorpion
        sorpionSprites[dir] = new Array<Sprite>(2);
        scorpionMasks[dir] = new Array<Mask>(2);
        createSpriteAndMask(binStr, palette, Offsets.SCORPION1, Offsets.SCORPIONCOLOR, 16, flipped,
                sprite => sorpionSprites[dir][0] = sprite, mask => scorpionMasks[dir][0] = mask, promises);
        createSpriteAndMask(binStr, palette, Offsets.SCORPION0, Offsets.SCORPIONCOLOR, 16, flipped,
                sprite => sorpionSprites[dir][1] = sprite, mask => scorpionMasks[dir][1] = mask, promises);
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

    // branches
    createSpriteAndMask(binStr, palette, Offsets.BRANCHES, Offsets.BRANCHESCOLOR, 8, false, 
            sprite => branchesSprite = sprite, null, promises);    

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

    // pits
    for (let color = 0; color < 2; ++color) {
        const pitCol = palette[color === 0 ? Colors.BLACK : Colors.BLUE];
        pitSprites[color] = new Array<Sprite>(2);
        for (let sprite = 0; sprite < 2; ++sprite) {
            promises.push(createSprite(64, 5, imageData => {
                for (let y = 0; y < 5; ++y) {
                    const Y = (sprite === 0) ? y : 4 - y;
                    const byte = binStr.charCodeAt(Offsets.PIT);
                    for (let x = 0, mask = 0x80, x4 = 0; x < 8; ++x, mask >>= 1, x4 += 4) {
                        if ((byte & mask) === 0) {
                            for (let i = 0; i < 4; ++i) {
                                const X = x4 + i;
                                setColor(imageData, X, Y, pitCol);
                                setColor(imageData, 63 - X, Y, pitCol);
                            }
                        }
                    }
                }
            }).then(({ imageBitmap }) => pitSprites[color][sprite] = imageBitmap));
        }
    }
    
    await Promise.all(promises);
}