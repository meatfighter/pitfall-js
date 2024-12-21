import { GameState } from './game-state';
import { charSprites, harrySprites, goldSprites, colors, Colors, Resolution } from '@/graphics';

let gs: GameState;

export function resetGame() {
    gs = new GameState();
}

export function saveGame() {
    gs.save();    
}

export function update() {   
    gs.harry.update(gs);
}

export function renderScreen(ctx: OffscreenCanvasRenderingContext2D) {
    ctx.fillStyle = colors[Colors.DARK_GREEN];
    ctx.fillRect(0, 0, Resolution.WIDTH, 51);
    ctx.fillStyle = colors[Colors.GREEN];
    ctx.fillRect(0, 51, Resolution.WIDTH, 60);
    ctx.fillStyle = colors[Colors.LIGHT_YELLOW];
    ctx.fillRect(0, 111, Resolution.WIDTH, 16);
    ctx.fillStyle = colors[Colors.DARK_YELLOW];
    ctx.fillRect(0, 127, Resolution.WIDTH, 15);
    ctx.fillRect(0, 174, Resolution.WIDTH, 6);

    gs.harry.render(ctx);
}