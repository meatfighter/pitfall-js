/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!*******************!*\
  !*** ./src/sw.ts ***!
  \*******************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CACHE_NAME: () => (/* binding */ CACHE_NAME)
/* harmony export */ });
const CACHE_NAME = 'pitfall-cache';
const MAX_FETCH_RETRIES = 5;
async function fetchWithRetry(request, options = {}) {
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
        }
        catch (error) {
            if (i === 0) {
                throw error;
            }
        }
    }
    throw new Error("Failed to fetch.");
}
self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName)));
    }).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
    if (!e.request.url.startsWith('http')) {
        return;
    }
    e.respondWith(caches.open(CACHE_NAME).then(cache => {
        return cache.match(e.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            const fetchOptions = (new URL(e.request.url).hostname !== self.location.hostname)
                ? { mode: 'cors', credentials: 'omit' } : {};
            return fetchWithRetry(e.request, fetchOptions).then(fetchResponse => {
                cache.put(e.request, fetchResponse.clone()).then(_ => { });
                return fetchResponse;
            });
        });
    }).catch(() => new Response('Service Unavailable', { status: 503 })));
});

/******/ })()
;
//# sourceMappingURL=sw.bundle.js.map