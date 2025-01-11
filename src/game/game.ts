import { map, WallType, PitType, ObsticleType, TreasureType } from './map';
import { GameState } from './game-state';
import { colors, Colors, Resolution, leavesSprites, branchesSprite, wallSprite, printNumber, charSprites, arrowSprites } 
    from '@/graphics';
import { clamp } from '@/math';
import { updateInput, upJustPressed, downJustPressed, leftJustPressed, rightJustPressed, jumpJustPressed } 
    from '@/input';
import { Tier, treasureCells, updateTreasureMapIndex, Direction } from './treasure-map';
import { store, Difficulty } from '@/store';    

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
    updateTreasureMapIndex(gs);
}

export function saveGame() {
    gs.save();    
}

export function update() {
    updateInput();

    if (gs.gameOver) {
        if (gs.gameOverDelay > 0) {
            --gs.gameOverDelay;
            return;
        }
        if (upJustPressed || downJustPressed || leftJustPressed || rightJustPressed || jumpJustPressed) {
            resetGame();
        }
    }

    gs.harry.teleported = false;

    const scene0 = gs.harry.scene;
    const scene1 = gs.nextScene;

    if (!gs.harry.isInjured()) {
        gs.clock.update();
        gs.rattle.update();
        gs.cobraAndFire.update(gs);
        gs.treasure.update(gs);
        gs.scorpion.update(gs);
        gs.vine.update(gs);
        gs.pit.update(gs);
        gs.rollingLog.update(gs);
        gs.stationaryLog.update(gs);
        if (gs.sceneAlpha < 1) {
            gs.sceneAlpha += SCENE_ALPHA_DELTA;
            if (gs.sceneAlpha > 1) {
                gs.sceneAlpha = 1;
            }
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
    if (targetScrollX < gs.scrollX - SCROLL_MARGIN) {
        if (gs.lastScrollX === targetScrollX || gs.harry.teleported) {
            gs.scrollX -= MIN_SCROLL_DELTA;
        } else {            
            gs.scrollX -= Math.max(MIN_SCROLL_DELTA, gs.lastScrollX - targetScrollX);
        }
    } else if (targetScrollX > gs.scrollX + SCROLL_MARGIN) {
        if (gs.lastScrollX === targetScrollX || gs.harry.teleported) {
            gs.scrollX += MIN_SCROLL_DELTA;
        } else {
            gs.scrollX += Math.max(MIN_SCROLL_DELTA, targetScrollX - gs.lastScrollX);
        }
    }    
    gs.lastScrollX = targetScrollX;
    gs.ox = Math.floor(gs.harry.x) - 76 + Math.floor(gs.scrollX) - targetScrollX;

    if (gs.lastOx !== gs.ox) {
        gs.rollingLog.sync();
        gs.lastOx = gs.ox;
    }

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
    const { trees, ladder, holes, wall, vine, pit, obsticles, scorpion } = map[scene];
    const trunks = TRUNKS[trees];

    if (store.difficulty === Difficulty.EASY) {
        const cells = treasureCells[gs.treasureMapIndex][scene];
        ctx.drawImage(arrowSprites[Tier.UPPER][cells[Tier.UPPER].direction], 68 - ox, 75);
        const lowerDirection = cells[Tier.LOWER].direction;
        let lowerOffset: number;
        switch (wall) {
            case WallType.LEFT:
                lowerOffset = (lowerDirection === Direction.RIGHT || lowerDirection === Direction.LEFT) ? 60 : 61;
                break;
            case WallType.RIGHT:
                lowerOffset = 76;
                break;    
            default:
                lowerOffset = 68;
                break;
        }
        ctx.drawImage(arrowSprites[Tier.LOWER][cells[Tier.LOWER].direction], lowerOffset - ox, 150);
    }
    
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
        gs.scorpion.render(gs, ctx, ox);
    }

    if (vine) {
        gs.vine.render(gs, ctx, ox);
    }

    if (pit !== PitType.NONE) {
        gs.pit.render(gs, ctx, scene, ox);
    }

    if (gs.sceneStates[scene].treasure !== TreasureType.NONE) {
        gs.treasure.render(gs, ctx, scene, ox);
    }

    switch (obsticles) {
        case ObsticleType.ONE_ROLLING_LOG:
        case ObsticleType.TWO_ROLLING_LOGS_NEAR:
        case ObsticleType.TWO_ROLLING_LOGS_FAR:
        case ObsticleType.THREE_ROLLING_LOGS:
            gs.rollingLog.render(gs, ctx, scene, ox);
            break;
            
        case ObsticleType.ONE_STATIONARY_LOG:
        case ObsticleType.THREE_STATIONARY_LOGS:
            gs.stationaryLog.render(gs, ctx, scene, ox);
            break;        

        case ObsticleType.COBRA:
        case ObsticleType.FIRE:
            gs.cobraAndFire.render(gs, ctx, scene, ox);
            break;    
    }
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

function renderHUD(ctx: OffscreenCanvasRenderingContext2D) {
    printNumber(ctx, gs.score, 53, 3, Colors.OFF_WHITE);
    gs.clock.render(ctx);
    ctx.fillStyle = colors[Colors.OFF_WHITE];
    for (let i = gs.extraLives - 1, x = 13; i >= 0; --i, x += 2) {
        ctx.fillRect(x, 16, 1, 8);
    }

    if (store.difficulty !== Difficulty.HARD) {
        printNumber(ctx, gs.harry.scene + 1, 124, 3, Colors.OFF_WHITE);
        printNumber(ctx, gs.treasureCount, 100, 16, Colors.OFF_WHITE);
        const sprites = charSprites[Colors.OFF_WHITE];
        ctx.drawImage(sprites[10], 108, 16);
        ctx.drawImage(sprites[3], 116, 16);
        ctx.drawImage(sprites[2], 124, 16);
    }
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

    renderHUD(ctx);
}