export class Rattle {   

    seed: number;

    constructor(rattle: {
        seed: number;
    } = {
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

    getValue(): number {
        return (this.seed >> 4) & 1;
    }
}