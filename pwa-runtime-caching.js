const runtimeCaching = [
  {
    urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "image-cache",
      expiration: {
        maxEntries: 128,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      },
    },
  },
  {
    // Signed result URLs expire quickly; never cache them in SW or gallery images go stale/broken.
    urlPattern: /^https:\/\/.*\/storage\/v1\/object\/sign\/results\//i,
    handler: "NetworkOnly",
    options: { cacheName: "no-cache-result-previews" },
  },
  {
    urlPattern: /^\/api\/stripe\/.*$/i,
    handler: "NetworkOnly",
    options: { cacheName: "no-cache-stripe" },
  },
  {
    urlPattern: /^\/api\/auth\/.*$/i,
    handler: "NetworkOnly",
    options: { cacheName: "no-cache-auth" },
  },
  {
    urlPattern: /^\/api\/(generate|upload-url).*$/i,
    handler: "NetworkOnly",
    options: { cacheName: "no-cache-generate-upload" },
  },
  {
    urlPattern: /^\/success(?:\/.*)?$/i,
    handler: "NetworkOnly",
    options: { cacheName: "no-cache-success" },
  },
  {
    urlPattern: /\/app(?:\/.*)?$/i,
    handler: "NetworkFirst",
    options: {
      cacheName: "app-pages",
      networkTimeoutSeconds: 3,
      expiration: {
        maxEntries: 24,
        maxAgeSeconds: 60 * 60 * 24,
      },
    },
  },
];

module.exports = runtimeCaching;
