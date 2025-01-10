import { setVolume } from './sfx';
import { enter as enterGame } from './screen';
import { store, saveStore } from './store';

let landscape = false;

export function enter() {
    document.body.style.backgroundColor = '#0F0F0F';

    window.addEventListener('resize', windowResized);
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    const mainElement = document.getElementById('main-content') as HTMLElement;
    mainElement.innerHTML = `
            <div id="start-container">
                <div id="start-div">
                    <div id="high-score-div">High Score: ${store.highScores[store.difficulty]}</div>
                    <div class="volume-div">
                        <span class="left-volume-label material-icons" id="left-volume-span" 
                                lang="en">volume_mute</span>
                        <input type="range" id="volume-input" min="0" max="100" step="any" value="10">
                        <span class="right-volume-label" id="right-volume-span" lang="en">100</span>
                    </div>
                    <div class="difficulty-div">
                        <label for="difficulty-select">Difficulty:</label>
                        <select id="difficulty-select" name="difficulty-select">
                            <option value="0">Easy</option>
                            <option value="1">Normal</option>
                            <option value="2">Hard</option>
                        </select>
                    </div>
                    <div id="go-div">
                        <button id="start-button">${isNewGame() ? 'Start' : 'Continue'}</button>
                    </div>
                </div>
            </div>`;

    setVolume(store.volume);
    const volumeInput = document.getElementById('volume-input') as HTMLInputElement;
    volumeInput.addEventListener('input', volumeChanged);
    volumeInput.value = String(store.volume);

    const difficultySelect = document.getElementById('difficulty-select') as HTMLSelectElement;
    difficultySelect.value = store.difficulty.toString();

    const startButton = document.getElementById('start-button') as HTMLButtonElement;
    startButton.addEventListener('click', startButtonClicked);

    windowResized();
}

export function exit() {
    window.removeEventListener('resize', windowResized);
    window.removeEventListener('touchmove', onTouchMove);

    const volumeInput = document.getElementById('volume-input') as HTMLInputElement;
    volumeInput.removeEventListener('input', volumeChanged);

    const startButton = document.getElementById('start-button') as HTMLButtonElement;
    startButton.removeEventListener('click', startButtonClicked);

    const difficultySelect = document.getElementById('difficulty-select') as HTMLSelectElement;
    store.difficulty = Number(difficultySelect.value);
    
    saveStore();
}

function startButtonClicked() {
    setVolume(store.volume);

    const difficultySelect = document.getElementById('difficulty-select') as HTMLSelectElement;
    store.difficulty = Number(difficultySelect.value);
    
    exit();
    enterGame();
}

function onTouchMove(e: TouchEvent) {
    let target = e.target as HTMLElement | null;
    while (target !== null) {
        if (target.id === 'volume-input') {
            if (landscape) {
                return;
            }

            const volumeInput = target as HTMLInputElement;
            const max = parseFloat(volumeInput.max);
            const min = parseFloat(volumeInput.min);
            const rect = volumeInput.getBoundingClientRect();
            const value = (1 - ((e.touches[0].clientY - rect.top) / rect.height)) * (max - min) + min;
            volumeInput.value = value.toString();
            volumeInput.dispatchEvent(new Event('input'));
            return;
        }
        target = target.parentElement;
    }
    e.preventDefault();
}

function volumeChanged() {
    const leftVolumeSpan = document.getElementById('left-volume-span') as HTMLSpanElement;
    const volumeInput = document.getElementById('volume-input') as HTMLInputElement;
    const rightVolumeSpan = document.getElementById('right-volume-span') as HTMLSpanElement;

    store.volume = 100 * (+volumeInput.value - +volumeInput.min) / (+volumeInput.max - +volumeInput.min);
    volumeInput.style.setProperty('--thumb-position', `${store.volume}%`);

    if (store.volume === 0) {
        leftVolumeSpan.textContent = 'volume_off';
    } else if (store.volume < 33) {
        leftVolumeSpan.textContent = 'volume_mute';
    } else if (store.volume < 66) {
        leftVolumeSpan.textContent = 'volume_down';
    } else {
        leftVolumeSpan.textContent = 'volume_up';
    }

    rightVolumeSpan.textContent = String(Math.round(store.volume));
}

function windowResized() {
    const startContainer = document.getElementById('start-container') as HTMLDivElement;
    const startDiv = document.getElementById('start-div') as HTMLDivElement;
    const leftVolumeSpan = document.getElementById('left-volume-span') as HTMLSpanElement;
    const rightVolumeSpan = document.getElementById('right-volume-span') as HTMLSpanElement;

    startContainer.style.width = startContainer.style.height = '';
    startContainer.style.left = startContainer.style.top = '';
    startContainer.style.display = 'none';

    startDiv.style.left = startDiv.style.top = startDiv.style.transform = '';
    startDiv.style.display = 'none';

    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    landscape = (innerWidth >= innerHeight);

    startContainer.style.left = '0px';
    startContainer.style.top = '0px';
    startContainer.style.width = `${innerWidth}px`;
    startContainer.style.height = `${innerHeight}px`;
    startContainer.style.display = 'block';

    startDiv.style.display = 'flex';

    leftVolumeSpan.style.width = '';
    leftVolumeSpan.style.display = 'inline-block';
    leftVolumeSpan.style.textAlign = 'center';
    leftVolumeSpan.textContent = '\u{1F507}';
    leftVolumeSpan.style.transform = '';

    rightVolumeSpan.style.width = '';
    rightVolumeSpan.style.display = 'inline-block';
    rightVolumeSpan.style.textAlign = 'center';
    rightVolumeSpan.textContent = '100';

    if (landscape) {
        const leftVolumeSpanWidth = leftVolumeSpan.getBoundingClientRect().width;
        leftVolumeSpan.style.width = `${leftVolumeSpanWidth}px`;

        const rightVolumeSpanWidth = rightVolumeSpan.getBoundingClientRect().width;
        rightVolumeSpan.style.width = `${rightVolumeSpanWidth}px`;

        const rect = startDiv.getBoundingClientRect();
        startDiv.style.left = `${(innerWidth - rect.width) / 2}px`
        startDiv.style.top = `${(innerHeight - rect.height) / 2}px`;
    } else {
        const leftVolumeSpanHeight = leftVolumeSpan.getBoundingClientRect().height;
        leftVolumeSpan.style.width = `${leftVolumeSpanHeight}px`;

        const rightVolumeSpanHeight = rightVolumeSpan.getBoundingClientRect().height;
        rightVolumeSpan.style.width = `${rightVolumeSpanHeight}px`;

        startDiv.style.transform = 'rotate(-90deg)';
        const rect = startDiv.getBoundingClientRect();
        startDiv.style.left = `${(innerWidth - rect.height) / 2}px`
        startDiv.style.top = `${(innerHeight - rect.width) / 2}px`;
    }
    rightVolumeSpan.textContent = String(store.volume);

    volumeChanged();
}

function isNewGame() {
    return true; // TODO
}