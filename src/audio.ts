import { JSZipObject } from "jszip";

const audioContext = new AudioContext();
audioContext.onstatechange = () => {
    if (audioContext.state === 'suspended') {
        stopAll();
    }
};

let docVisible = true;

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        docVisible = true;
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    } else if (document.visibilityState === 'hidden') {        
        docVisible = false;
        stopAll();
        if (audioContext.state === 'running') {
            audioContext.suspend();
        }
    }
});

const masterGain = audioContext.createGain();
masterGain.connect(audioContext.destination);
masterGain.gain.value = 0.1;

const promises: Promise<Map<string, AudioBuffer>>[] = [];

const audioBuffers = new Map<string, AudioBuffer>();

const activeSources = new Map<string, AudioBufferSourceNode>();

export function setVolume(volume: number) {
    if (audioContext.state === 'suspended') {
        if (docVisible) {
            audioContext.resume().then(() => setVolume(volume));
        }
        return;
    }
    masterGain.gain.value = volume / 100;
}

export function decodeAudioData(name: string, obj: JSZipObject) {
    promises.push(obj.async('arraybuffer')
        .then(data => audioContext.decodeAudioData(data))
        .then(buffer => audioBuffers.set(name, buffer)));
}

export async function waitForDecodes() {
    return Promise.all(promises).then(() => promises.length = 0);
}

export function play(name: string, loop = false) {
    if (audioContext.state === 'suspended') {
        if (docVisible) {
            audioContext.resume().then(() => play(name));
        }
        return;
    }

    if (loop) {
        if (activeSources.has(name)) {
            return;
        }
    } else {
        stop(name);
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers.get(name) as AudioBuffer;
    source.connect(masterGain);
    source.loop = loop;

    activeSources.set(name, source);
    source.onended = () => activeSources.delete(name);

    source.start();
}

export function stop(name: string) {
    const source = activeSources.get(name);
    if (source) {
        activeSources.delete(name);
        source.stop();
    }
}

export function stopAll() {
    for (const source of activeSources.values()) {
        source.stop();
    }
    activeSources.clear();
}