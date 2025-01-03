export class Rattle {   

    seed = 1;

    update() {        
        let a = this.seed;
        a <<= 1;
        a ^= this.seed;
        a <<= 1;
        this.seed = (this.seed << 1) | ((a & 0x100) ? 1 : 0);
    }

    getValue(): number {
        return (this.seed >> 4) & 1;
    }
}