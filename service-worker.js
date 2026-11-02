const CACHE_NAME = "medo-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./features.css",
    "./script.js",
    "./features.js",
    "./study-tools.js",
    "./weekly-schedule.js",
    "./study-cloud.js",
    "./pro-membership.js",
    "./supabase.js",
    "./manifest.json",
    "./medo.png",
    "./logo.png.png",
    "./images/fc26.jpg",
"./images/ps4.jpg",
"./images/rdr2.jpg",
"./icons/icon-192.png",
"./icons/icon-512.png"
];


self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (
        request.method !== "GET" ||
        url.origin !== self.location.origin
    ) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            return cachedResponse ||
                fetch(request).catch(() => {
                    if (request.mode === "navigate") {
                        return caches.match("./index.html");
                    }
                });
        })
    );
});