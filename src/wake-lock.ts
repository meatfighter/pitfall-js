let wakeLock: WakeLockSentinel | null = null;
let acquiringWaitLock = false;

export function acquireWakeLock() {
    if (!acquiringWaitLock && wakeLock === null && 'wakeLock' in navigator) {
        acquiringWaitLock = true;
        navigator.wakeLock.request('screen')
            .then(w => {
                if (acquiringWaitLock) {
                    wakeLock = w;
                    wakeLock.addEventListener("release", () => {
                        if (!acquiringWaitLock) {
                            wakeLock = null;
                        }
                    });
                }
            }).catch(_ => {
        }).finally(() => acquiringWaitLock = false);
    }
}

export function releaseWakeLock() {
    if (wakeLock !== null && 'wakeLock' in navigator) {
        acquiringWaitLock = false;
        wakeLock.release()
            .then(() => {
                if (!acquiringWaitLock) {
                    wakeLock = null;
                }
            }).catch(_ => {
        });
    }
}