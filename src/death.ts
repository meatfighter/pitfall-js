let landscape = false;

export function enter() {
    window.addEventListener('resize', windowResized);
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    const mainElement = document.getElementById('main-content') as HTMLElement;
    mainElement.innerHTML = '<div id="death-div"><span id="fatal-error">&#x1F480;</span></div>';

    windowResized();
}

export function exit() {
    window.removeEventListener('resize', windowResized);
    window.removeEventListener('touchmove', onTouchMove);
}

function onTouchMove(e: TouchEvent) {
    e.preventDefault();
}

function windowResized() {
    const deathDiv = document.getElementById('death-div') as HTMLDivElement;

    deathDiv.style.top = deathDiv.style.left = deathDiv.style.transform = '';
    deathDiv.style.display = 'none';

    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    landscape = (innerWidth >= innerHeight);
    deathDiv.style.display = 'flex';

    if (landscape) {
        const rect = deathDiv.getBoundingClientRect();
        deathDiv.style.left = `${(innerWidth - rect.width) / 2}px`
        deathDiv.style.top = `${(innerHeight - rect.height) / 2}px`;
    } else {
        deathDiv.style.transform = 'rotate(-90deg)';
        const rect = deathDiv.getBoundingClientRect();
        deathDiv.style.left = `${(innerWidth - rect.height) / 2}px`
        deathDiv.style.top = `${(innerHeight - rect.width) / 2}px`;
    }
}