function onPlayButtonClicked() {
    window.location.href = 'app/app.html';
}

export function init() {
    (document.getElementById('play-button') as HTMLButtonElement).addEventListener('click', onPlayButtonClicked);
}

document.addEventListener('DOMContentLoaded', init);