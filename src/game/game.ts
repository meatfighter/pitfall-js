import { map, WallType, PitType, ObsticleType } from './map';
import { GameState } from './game-state';
import { colors, Colors, Resolution, leavesSprites, branchesSprite, wallSprite } from '@/graphics';
import { clamp } from '@/math';
import { updateInput } from '@/input';

const SCENE_ALPHA_DELTA = 1 / 30;

const MIN_SCROLL_DELTA = .5;
const SCROLL_MARGIN = 4;

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

function updateScene(scene: number) {
    const { scorpion } = gs.sceneStates[scene];
    if (scorpion) {
        scorpion.update(gs);
    }
}

export function update() {
    updateInput();

    gs.harry.teleported = false;

    const scene0 = gs.harry.scene;
    const scene1 = gs.nextScene;

    if (!gs.harry.isInjured()) {
        gs.vine.update(gs);
        gs.pit.update(gs);
        gs.rollingLog.update(gs);
        updateScene(gs.harry.scene);
        updateScene(gs.nextScene);
        if (gs.sceneAlpha < 1) {
            gs.sceneAlpha += SCENE_ALPHA_DELTA;
            if (gs.sceneAlpha > 1) {
                gs.sceneAlpha = 1;
            }
            updateScene(gs.lastNextScene);
        }
    } 
   
    gs.harry.update(gs);

    const underground = gs.harry.isUnderground();
    if (gs.lastHarryUnderground !== underground) {
        gs.lastHarryUnderground = underground;
        gs.lastNextScene = gs.nextScene;
        gs.sceneAlpha = clamp(1 - gs.sceneAlpha, 0, 1);
    }

    const targetScrollX = Math.floor(gs.harry.absoluteX);
    gs.roundBias = 0;
    if (targetScrollX < gs.scrollX - SCROLL_MARGIN) {
        if (gs.lastScrollX === targetScrollX || gs.harry.teleported) {
            gs.scrollX -= MIN_SCROLL_DELTA;
        } else {
            gs.scrollX -= Math.max(MIN_SCROLL_DELTA, gs.lastScrollX - targetScrollX);
            gs.roundBias = -.5;
        }
    } else if (targetScrollX > gs.scrollX + SCROLL_MARGIN) {
        if (gs.lastScrollX === targetScrollX || gs.harry.teleported) {
            gs.scrollX += MIN_SCROLL_DELTA;
        } else {
            gs.scrollX += Math.max(MIN_SCROLL_DELTA, targetScrollX - gs.lastScrollX);
            gs.roundBias = .5;
        }
    }
    gs.lastScrollX = targetScrollX;
    gs.ox = Math.floor(gs.harry.x) - 76 + Math.floor(gs.scrollX) - targetScrollX;    

    if (gs.ox < 0) {
        gs.nextOx = gs.ox + Resolution.WIDTH;        
        gs.nextScene = gs.harry.scene - (underground ? 3 : 1);
        if (gs.nextScene < 0) {
            gs.nextScene += map.length;
        }
        if (gs.nextScene !== scene0 && gs.nextScene !== scene1) {
            gs.sceneStates[gs.nextScene].enteredLeft = false;
        }
    } else {
        gs.nextOx = gs.ox - Resolution.WIDTH;
        gs.nextScene = gs.harry.scene + (underground ? 3 : 1);
        if (gs.nextScene >= map.length) {
            gs.nextScene -= map.length;
        }
        if (gs.nextScene !== scene0 && gs.nextScene !== scene1) {
            gs.sceneStates[gs.nextScene].enteredLeft = true;
        }
    }
}

function renderStrips(ctx: OffscreenCanvasRenderingContext2D) {
    ctx.fillStyle = colors[Colors.GREEN];
    ctx.fillRect(0, 51, Resolution.WIDTH, 60);
    ctx.fillStyle = colors[Colors.LIGHT_YELLOW];
    ctx.fillRect(0, 111, Resolution.WIDTH, 16);
    ctx.fillStyle = colors[Colors.DARK_YELLOW];
    ctx.fillRect(0, 127, Resolution.WIDTH, 15);
    ctx.fillRect(0, 174, Resolution.WIDTH, 6);
    ctx.fillStyle = colors[Colors.BLACK];
    ctx.fillRect(0, 142, Resolution.WIDTH, 32);
}

function renderBackground(ctx: OffscreenCanvasRenderingContext2D, scene: number, ox: number) {
    const { trees, ladder, holes, wall, vine, pit, obsticles } = map[scene];
    const { scorpion } = gs.sceneStates[scene];
    const trunks = TRUNKS[trees];
    ctx.fillStyle = colors[Colors.DARK_BROWN];
    for (let i = 3; i >= 0; --i) {
        ctx.drawImage(branchesSprite, trunks[i] - 2 - ox, 51);
        ctx.fillRect(trunks[i] - ox, 59, 4, 52);
    }

    if (ladder) {
        ctx.fillStyle = colors[Colors.BLACK];
        ctx.fillRect(68 - ox, 116, 8, 6);
        ctx.fillRect(68 - ox, 127, 8, 15);
        ctx.fillStyle = colors[Colors.DARK_YELLOW];
        for (let i = 10, y = 130; i >= 0; --i, y += 4) {
            ctx.fillRect(70 - ox, y, 4, 2);
        }
    }

    if (holes) {
        ctx.fillStyle = colors[Colors.BLACK];
        ctx.fillRect(40 - ox, 116, 12, 6);
        ctx.fillRect(40 - ox, 127, 12, 15);
        ctx.fillRect(92 - ox, 116, 12, 6);
        ctx.fillRect(92 - ox, 127, 12, 15);
    }

    switch(wall) {
        case WallType.LEFT:
            ctx.drawImage(wallSprite, 10 - ox, 142);
            ctx.drawImage(wallSprite, 10 - ox, 158);
            break;
        case WallType.RIGHT:
            ctx.drawImage(wallSprite, 128 - ox, 142);
            ctx.drawImage(wallSprite, 128 - ox, 158);
            break;
    }

    if (scorpion) {
        scorpion.render(gs, ctx, ox);
    }

    if (vine) {
        gs.vine.render(gs, ctx, ox);
    }

    if (pit !== PitType.NONE) {
        gs.pit.render(gs, ctx, scene, ox);
    }

    // switch (obsticles) {
    //     case ObsticleType.ONE_ROLLING_LOG:
    //     case ObsticleType.TWO_ROLLING_LOGS_CLOSE:    
    //     case ObsticleType.TWO_ROLLING_LOGS_FAR:  
    //     case ObsticleType.THREE_ROLLING_LOGS:
            gs.rollingLog.render(gs, ctx, scene, ox);
    //         break;  
    // }
}

function renderLeaves(ctx: OffscreenCanvasRenderingContext2D, scene: number, ox: number) {
    const { trees } = map[scene];
    ctx.fillStyle = colors[Colors.DARK_GREEN];
    ctx.fillRect(0, 0, Resolution.WIDTH, 51);
    ctx.drawImage(leavesSprites[1][trees], 6, 0, 2, 4, -ox, 51, 8, 8);
    for (let i = 1; i < 5; ++i) {
        ctx.drawImage(leavesSprites[(i & 1) ^ 1][trees], (i << 5) - ox - 24, 51, 32, 8);
    }
    ctx.drawImage(leavesSprites[0][trees], 0, 0, 4, 4, 136 - ox, 51, 16, 8);
}

export function renderScreen(ctx: OffscreenCanvasRenderingContext2D) {
    
    renderStrips(ctx);

    renderBackground(ctx, gs.harry.scene, gs.ox);
    if (gs.sceneAlpha === 1) {
        renderBackground(ctx, gs.nextScene, gs.nextOx);
    } else {
        ctx.globalAlpha = 1 - gs.sceneAlpha;
        renderBackground(ctx, gs.lastNextScene, gs.nextOx);
        ctx.globalAlpha = gs.sceneAlpha;
        renderBackground(ctx, gs.nextScene, gs.nextOx);
        ctx.globalAlpha = 1;
    }

    gs.harry.render(gs, ctx, gs.ox);

    renderLeaves(ctx, gs.harry.scene, gs.ox);
    if (gs.sceneAlpha === 1) {
        renderLeaves(ctx, gs.nextScene, gs.nextOx);
    } else {
        ctx.globalAlpha = 1 - gs.sceneAlpha;
        renderLeaves(ctx, gs.lastNextScene, gs.nextOx);
        ctx.globalAlpha = gs.sceneAlpha;
        renderLeaves(ctx, gs.nextScene, gs.nextOx);
        ctx.globalAlpha = 1;
    }
}