import { GameState } from './game-state';
import { charSprites, harrySprites, goldSprites, colors, Colors, Resolution, leavesSprites, branchesSprite } 
    from '@/graphics';
import { map } from './map';
import { mod } from '@/math';

const TRUNKS = [
    [ 8, 40, 100, 132 ],
    [ 16, 48, 92, 124 ],
    [ 24, 56, 84, 116 ],
    [ 28, 60, 80, 112 ],
];

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

function renderBackground(ctx: OffscreenCanvasRenderingContext2D, camSceneIndex: number, camSceneOffset: number) {
    const { trees, ladder } = map[camSceneIndex];
    const trunks = TRUNKS[trees];
    ctx.fillStyle = colors[Colors.DARK_BROWN];
    for (let i = 3; i >= 0; --i) {
        ctx.drawImage(branchesSprite, trunks[i] - 2 - camSceneOffset, 51);
        ctx.fillRect(trunks[i] - camSceneOffset, 59, 4, 52);
    }

    if (ladder) {
        ctx.fillStyle = colors[Colors.BLACK];
        ctx.fillRect(68 - camSceneOffset, 116, 8, 6);
        ctx.fillRect(68 - camSceneOffset, 127, 8, 15);
        ctx.fillStyle = colors[Colors.DARK_YELLOW];
        for (let i = 10, y = 130; i >= 0; --i, y += 4) {
            ctx.fillRect(70 - camSceneOffset, y, 4, 2);
        }
    }
}

function renderLeaves(ctx: OffscreenCanvasRenderingContext2D, camSceneIndex: number, camSceneOffset: number) {
    const { trees } = map[camSceneIndex];
    ctx.fillStyle = colors[Colors.DARK_GREEN];
    ctx.fillRect(0, 0, Resolution.WIDTH, 51);
    ctx.drawImage(leavesSprites[1][trees], 6, 0, 2, 4, -camSceneOffset, 51, 8, 8);    
    for (let i = 1; i < 5; ++i) {
        ctx.drawImage(leavesSprites[(i & 1) ^ 1][trees], (i << 5) - camSceneOffset - 24, 51, 32, 8);
    }
    ctx.drawImage(leavesSprites[0][trees], 0, 0, 4, 4, 136 - camSceneOffset, 51, 16, 8);
}

export function renderScreen(ctx: OffscreenCanvasRenderingContext2D) {
    ctx.fillStyle = colors[Colors.GREEN];
    ctx.fillRect(0, 51, Resolution.WIDTH, 60);
    ctx.fillStyle = colors[Colors.LIGHT_YELLOW];
    ctx.fillRect(0, 111, Resolution.WIDTH, 16);
    ctx.fillStyle = colors[Colors.DARK_YELLOW];
    ctx.fillRect(0, 127, Resolution.WIDTH, 15);
    ctx.fillRect(0, 174, Resolution.WIDTH, 6);
    ctx.fillStyle = colors[Colors.BLACK];
    ctx.fillRect(0, 142, Resolution.WIDTH, 32);

    const camSceneInd = Math.floor(gs.camX / Resolution.WIDTH);
    const camSceneIndex = mod(camSceneInd, 255);
    const camSceneOffset = gs.camX - Resolution.WIDTH * camSceneInd;
    const camNextSceneIndex = (camSceneIndex + 1) % 255;
    const camNextSceneOffset = camSceneOffset - Resolution.WIDTH;
            
    renderBackground(ctx, camSceneIndex, camSceneOffset);
    renderBackground(ctx, camNextSceneIndex, camNextSceneOffset);

    gs.harry.render(gs, ctx);
    
    renderLeaves(ctx, camSceneIndex, camSceneOffset);
    renderLeaves(ctx, camNextSceneIndex, camNextSceneOffset);
}