import { store, saveStore, Difficulty } from '@/store';
import { Harry } from './harry';
import { Scorpion } from './scorpion';
import { Vine } from './vine';
import { Pit } from './pit';
import { RollingLog } from './rolling-log';
import { StationaryLog } from './stationary-log';
import { Rattle } from './rattle';
import { CobraAndFire } from './cobra-and-fire';
import { Treasure } from './treasure';
import { Clock } from './clock';
import { map, TreasureType } from './map';
import { Colors } from '@/graphics';

export class SceneState {

    enteredLeft = true;
    treasure: TreasureType;

    constructor(sceneState: {
        enteredLeft: boolean;
        treasure: TreasureType;
    } = {
        enteredLeft: true,
        treasure: TreasureType.NONE,
    }) {
        this.enteredLeft = sceneState.enteredLeft;
        this.treasure = sceneState.treasure;
    }
}

export class GameState {

    sceneStates: SceneState[];
    harry: Harry;
    scorpion: Scorpion;
    vine: Vine;
    pit: Pit;
    rollingLog: RollingLog;
    stationaryLog: StationaryLog;
    rattle: Rattle;
    cobraAndFire: CobraAndFire;
    treasure: Treasure;
    clock: Clock;
    scrollX: number;
    lastScrollX: number;
    ox: number;
    lastOx: number;
    nextOx: number;
    nextScene: number;
    lastNextScene: number;
    lastHarryUnderground: boolean;
    sceneAlpha: number;
    score: number;
    extraLives: number;
    gameOver: boolean;
    gameOverDelay: number;
    newHighScore: boolean;
    scoreColor: number;
    treasureCount: number;
    treasureMapIndex: number;

    constructor(gameState: {
        sceneStates: SceneState[] | undefined;
        harry: Harry | undefined;
        scorpion: Scorpion | undefined;
        vine: Vine | undefined;
        pit: Pit | undefined;
        rollingLog: RollingLog | undefined;
        stationaryLog: StationaryLog | undefined;
        rattle: Rattle | undefined;
        cobraAndFire: CobraAndFire | undefined;
        treasure: Treasure | undefined;
        clock: Clock | undefined;
        scrollX: number;
        lastScrollX: number;
        ox: number;
        lastOx: number;
        nextOx: number;
        nextScene: number;
        lastNextScene: number;
        lastHarryUnderground: boolean;
        sceneAlpha: number;
        score: number;
        extraLives: number;
        gameOver: boolean;
        gameOverDelay: number;
        newHighScore: boolean;
        scoreColor: number;
        treasureCount: number;
        treasureMapIndex: number;
    } = {
        sceneStates: undefined,
        harry: undefined,
        scorpion: undefined,
        vine: undefined,
        pit: undefined,
        rollingLog: undefined,
        stationaryLog: undefined,
        rattle: undefined,
        cobraAndFire: undefined,
        treasure: undefined,
        clock: undefined,
        scrollX: 12,
        lastScrollX: 12,
        ox: 0,
        lastOx: 0,
        nextOx: 0,
        nextScene: 0,
        lastNextScene: 0,
        lastHarryUnderground: false,
        sceneAlpha: 1,
        score: 2000,
        extraLives: (store.difficulty === Difficulty.EASY) ? 4 : (store.difficulty === Difficulty.NORMAL) ? 3 : 2,
        gameOver: false,
        gameOverDelay: 180,
        newHighScore: false,
        scoreColor: Colors.OFF_WHITE,
        treasureCount: 0,
        treasureMapIndex: 0,
    }) {
        this.sceneStates = new Array<SceneState>(map.length);
        if (gameState.sceneStates?.length === map.length) {
            for (let i = map.length - 1; i >= 0; --i) {
                this.sceneStates[i] = new SceneState(gameState.sceneStates[i]);
            }
        } else {            
            for (let i = map.length - 1; i >= 0; --i) {
                this.sceneStates[i] = new SceneState({ enteredLeft: true, treasure: map[i].treasure, });
            }
        }

        this.harry = new Harry(gameState.harry);
        this.scorpion = new Scorpion(gameState.scorpion);
        this.vine = new Vine(gameState.vine);
        this.pit = new Pit(gameState.pit);
        this.rollingLog = new RollingLog(gameState.rollingLog);
        this.stationaryLog = new StationaryLog(gameState.stationaryLog);
        this.rattle = new Rattle(gameState.rattle);
        this.cobraAndFire = new CobraAndFire(gameState.cobraAndFire);
        this.treasure = new Treasure(gameState.treasure);
        this.clock = new Clock(gameState.clock);
        this.scrollX = gameState.scrollX;
        this.lastScrollX = gameState.lastScrollX;
        this.ox = gameState.ox;
        this.lastOx = gameState.lastOx;
        this.nextOx = gameState.nextOx;
        this.nextScene = gameState.nextScene;
        this.lastNextScene = gameState.lastNextScene;
        this.lastHarryUnderground = gameState.lastHarryUnderground;
        this.sceneAlpha = gameState.sceneAlpha;
        this.score = gameState.score;
        this.extraLives = gameState.extraLives;
        this.gameOver = gameState.gameOver;
        this.gameOverDelay = gameState.gameOverDelay;
        this.newHighScore = gameState.newHighScore;
        this.scoreColor = gameState.scoreColor;
        this.treasureCount = gameState.treasureCount;;
        this.treasureMapIndex = gameState.treasureMapIndex;
    }

    endGame() {
        this.gameOver = true;
        this.gameOverDelay = (this.treasureCount === 32) ? 600 : 180;
        store.gameState = undefined;
        if (this.score > store.highScores[store.difficulty]) {
            this.newHighScore = true;
            store.highScores[store.difficulty] = this.score;                        
        }        
    }
}