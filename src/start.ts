import { setVolume } from './sfx';
import { enter as enterGame } from './screen';
import { store, saveStore, Difficulty } from './store';

let landscape = false;

let dropdownToggleListener: () => void;
let dropdownCloseListener: (event: MouseEvent) => void;
const optionListners = new Array<() => void>(3);
let selectedDifficulty: number;

export function enter() {
    selectedDifficulty = store.difficulty;

    document.body.style.backgroundColor = '#0F0F0F';

    window.addEventListener('resize', windowResized);
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    const mainElement = document.getElementById('main-content') as HTMLElement;
    mainElement.innerHTML = `
            <div id="start-container">
                <div id="start-div">
                    <div id="high-score-div">High Score: ${store.highScores[selectedDifficulty]}</div>
                    <div class="volume-div">
                        <span class="left-volume-label material-icons" id="left-volume-span" 
                                lang="en">volume_mute</span>
                        <input type="range" id="volume-input" min="0" max="100" step="any" value="10">
                        <span class="right-volume-label" id="right-volume-span" lang="en">100</span>
                    </div>
                    <div class="difficulty-div">
                        <div id="dropdown-label">Difficulty:</div>
                        <div id="custom-dropdown" class="custom-dropdown">
                            <div class="dropdown-selected">${getDifficultyName()}</div>
                            <div class="dropdown-options">
                                <div class="dropdown-option" data-value="0">Easy</div>
                                <div class="dropdown-option" data-value="1">Normal</div>
                                <div class="dropdown-option" data-value="2">Hard</div>
                            </div>
                        </div>    
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

    const startButton = document.getElementById('start-button') as HTMLButtonElement;
    startButton.addEventListener('click', startButtonClicked);

    const dropdown = document.getElementById('custom-dropdown') as HTMLDivElement;
    const selected = dropdown.querySelector('.dropdown-selected') as HTMLDivElement;
    const optionItems = dropdown.querySelectorAll('.dropdown-option');

    // Toggle dropdown open/closed on click
    dropdownToggleListener = () => dropdown.classList.toggle('open');
    selected.addEventListener('click', dropdownToggleListener);

    // Close if clicked outside
    dropdownCloseListener = event => {
        if (!dropdown.contains(event.target as Node)) {
            dropdown.classList.remove('open');
        }
    };
    document.addEventListener('click', dropdownCloseListener);

    // Handle clicks on each option
    optionItems.forEach(option => {
        const difficulty = Number(option.getAttribute('data-value'));
        optionListners[difficulty] = () => {
            selectedDifficulty = difficulty;            
            selected.textContent = option.textContent; // Update the "selected" text            
            dropdown.classList.remove('open');         // Close dropdown
        };
        option.addEventListener('click', optionListners[difficulty]);
    });

    windowResized();
}

export function exit() {
    window.removeEventListener('resize', windowResized);
    window.removeEventListener('touchmove', onTouchMove);

    const volumeInput = document.getElementById('volume-input') as HTMLInputElement;
    volumeInput.removeEventListener('input', volumeChanged);

    const startButton = document.getElementById('start-button') as HTMLButtonElement;
    startButton.removeEventListener('click', startButtonClicked);

    const dropdown = document.getElementById('custom-dropdown') as HTMLDivElement;
    document.removeEventListener('click', dropdownCloseListener);
    
    const selected = dropdown.querySelector('.dropdown-selected') as HTMLDivElement;
    selected.removeEventListener('click', dropdownToggleListener);   

    const optionItems = dropdown.querySelectorAll('.dropdown-option');
    optionItems.forEach(option => option.removeEventListener('click', 
            optionListners[Number(option.getAttribute('data-value'))]));
    
    saveStore();
}

function getDifficultyName() {
    switch (store.difficulty) {
        case Difficulty.EASY:
            return "Easy";
        case Difficulty.NORMAL:
            return "Normal";
        default:
            return "Hard";
    }
}

function startButtonClicked() {
    setVolume(store.volume);

    store.difficulty = selectedDifficulty;
    
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