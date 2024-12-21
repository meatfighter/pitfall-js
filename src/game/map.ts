export const map = new Array<number>(255);

let seed = 0xC4;
for (let i = 0; i < map.length; ++i) {
    map[i] = seed;
    seed = 0xFF & ((seed << 1) | (((seed >> 7) & 1) ^ ((seed >> 5) & 1) ^ ((seed >> 4) & 1) ^ ((seed >> 3) & 1)));
}