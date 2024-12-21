import { harrySprites } from "@/graphics";
import { GameState } from "./game-state";

export class Harry {
    x = 12;
    y = 119;

    update(gs: GameState) {

    }

    render(ctx: OffscreenCanvasRenderingContext2D) {
        ctx.drawImage(harrySprites[0][0], this.x - 4, this.y - 22);
    }
}