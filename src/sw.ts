declare const self: ServiceWorkerGlobalScope;

export const CACHE_NAME = 'pitfall-cache-2025-01-24';

const MAX_FETCH_RETRIES = 5;

async function fetchWithRetry(request: Request, options: RequestInit = {}) {

    for (let i = MAX_FETCH_RETRIES - 1; i >= 0; --i) {
        try {
            const response = await fetch(request, options);
            if (!response.ok) {
                continue;
            }

            const contentLengthStr = response.headers.get('Content-Length');
            const contentLength = contentLengthStr ? parseInt(contentLengthStr, 10) : 0;
            const postStatus = contentLength > 0 && request.url.includes('resources.zip');

            const body = response.body;
            if (body === null) {
                continue;
            }

            const reader = body.getReader();
            const chunks = [];
            let bytesReceived = 0;
            while (true) {
                const { done, value: chunk } = await reader.read();
                if (done) {
                    break;
                }
                chunks.push(chunk);
                bytesReceived += chunk.length;
                if (postStatus) {
                    self.clients.matchAll().then(clients => {
                        clients.forEach(client => {
                            client.postMessage(bytesReceived / contentLength);
                        });
                    });
                }
            }

            const uint8Array = new Uint8Array(bytesReceived);
            let position = 0;
            chunks.forEach(chunk => {
                uint8Array.set(chunk, position);
                position += chunk.length;
            });

            return new Response(uint8Array, {
                status: 200,
                statusText: 'OK',
                headers: response.headers
            });
        } catch (error) {
            if (i === 0) {
                throw error;
            }
        }
    }
    throw new Error("Failed to fetch.");
}

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                .map(cacheName => caches.delete(cacheName)));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {

    if (!e.request.url.startsWith('http')) {
        return;
    }

    e.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(e.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                const fetchOptions: RequestInit = (new URL(e.request.url).hostname !== self.location.hostname)
                        ? { mode: 'cors', credentials: 'omit' } : {};
                return fetchWithRetry(e.request, fetchOptions).then(fetchResponse => {
                    cache.put(e.request, fetchResponse.clone()).then(_ => {});
                    return fetchResponse;
                });
            });
        }).catch(() => new Response('Service Unavailable', { status: 503 }))
    );
});

self.addEventListener('install', () => self.skipWaiting());