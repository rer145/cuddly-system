var dataCacheName = 'lrb-timer-v1.10';
var cacheName = 'lrb-timer-1.10';
var filesToCache = [
    '/',
    '/index.html',
    '/timer.html',
    '/scripts/app.js',
    '/scripts/timerApp.js',
    '/scripts/jquery-3.1.1.min.js',
    '/scripts/pouchdb-6.1.1.min.js',
    '/scripts/firebase-3.6.8.min.js',
    '/scripts/materialize.min.js',
    '/styles/inline.css',
    '/styles/clearfix.css',
    '/styles/materialize.min.css',
    '/images/ic_add_white_24px.svg',
    '/images/ic_mode_edit_black_24px.svg',
    '/images/ic_delete_black_24px.svg',
    '/images/ic_pause_white_24px.svg',
    '/images/ic_play_arrow_white_24px.svg',
    '/images/ic_stop_white_24px.svg',
    '/images/icons/icon-128x128.png',
    '/images/icons/icon-144x144.png',
    '/images/icons/icon-152x152.png',
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-256x256.png'
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key != cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    console.log('[ServiceWorker] Fetch', e.request.url);
    var dataUrl = 'http://ronshouse.com';
    if (e.request.url.indexOf(dataUrl) > -1) {
        //cache then network
        // checks cache first then goes out to the network
        e.respondWith(
            caches.open(dataCacheName).then(function(cache) {
                return fetch(e.request).then(function(response) {
                    cache.put(e.request.url, response.clone());
                    return response;
                });
            })
        );
    } else {
        //app shell files
        e.respondWith(
            caches.match(e.request).then(function(response) {
                return response || fetch(e.request);
            })
        );
    }
});