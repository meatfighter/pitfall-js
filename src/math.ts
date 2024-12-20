import { Mask } from './graphics';

export const TAU = 2 * Math.PI;

export function gaussianRandom(mean: number, stdDev: number): number {
    let u: number;
    let v: number;
    do {
        u = Math.random();
    } while (u === 0);
    do {
        v = Math.random();
    } while(v === 0);
    return (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)) * stdDev + mean;
}

export function clamp(value: number, min: number, max: number) {
    return (value < min) ? min : (value > max) ? max : value;
}

export function bulletIntersects(
        bulletX: number, bulletY: number, bulletHeight: number,
        mask: Mask, maskX: number, maskY: number): boolean {

    maskX = Math.floor(maskX);
    maskY = Math.floor(maskY);                    
    bulletX = Math.floor(bulletX) - maskX;
    bulletY = Math.floor(bulletY) - maskY;
 
    const maskMaxX = mask[0].length - 1;
    const maskMaxY = mask.length - 1;
    const bulletMaxY = bulletY + bulletHeight - 1;
    
    if (bulletMaxY < 0 || bulletX < 0 || bulletY > maskMaxY || bulletX > maskMaxX) {
        return false;
    }

    const yMax = Math.min(bulletMaxY, maskMaxY);
    for (let y = Math.max(bulletY, 0); y <= yMax; ++y) {
        if (mask[y][bulletX]) {
            return true;
        }
    }

    return false;
}

export function spritesIntersect(
        mask0: Mask, x0: number, y0: number,
        mask1: Mask, x1: number, y1: number): boolean {

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
            if (mask0[y][x]) {
                return true;
            }
        }
    }

    return false;
}