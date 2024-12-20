function init() {
    const mainElement = document.getElementById('main-content') as HTMLElement;
    mainElement.innerHTML = '<div id="loading-div" class="loading-container">...</div>';
    const loadingDiv = document.getElementById('loading-div') as HTMLDivElement;
    const intervalId = window.setInterval(() => {
        loadingDiv.textContent = (loadingDiv.textContent === '...')
            ? '' 
            : loadingDiv.textContent + '.';
    }, 400);
    setTimeout(() => registerServiceWorker(intervalId), 10);
}

function registerServiceWorker(intervalId: number) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.bundle.js').then(() => importApp(intervalId));
    } else {
        importApp(intervalId);
    }
}

function importApp(intervalId: number) {
    import(/* webpackChunkName: "app" */ './app').then(module => {
        clearInterval(intervalId);
        module.init();
    });
}

document.addEventListener('DOMContentLoaded', init);