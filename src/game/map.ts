export const map = new Array<Scene>(255);

class Scene {
    constructor(public trees: number) {

    }
}

let seed = 0xC4;
for (let i = 0; i < map.length; ++i) {  
    // const b7 = (seed >> 7) & 1;
    // const b6 = (seed >> 7) & 1;
    // const b5 = (seed >> 7) & 1;
    // const b4 = (seed >> 7) & 1;
    // const b3 = (seed >> 7) & 1;
    // const b2 = (seed >> 7) & 1;
    // const b1 = (seed >> 7) & 1;
    // const b0 = (seed >> 7) & 1;
    const trees = seed >> 6; // four tree patterns determined by bits 7 and 6
    console.log(`${i} ${trees}`); // TODO REMOVE
    map[i] = new Scene(trees);

    seed = 0xFF & ((seed << 1) | (((seed >> 7) & 1) ^ ((seed >> 5) & 1) ^ ((seed >> 4) & 1) ^ ((seed >> 3) & 1)));
}