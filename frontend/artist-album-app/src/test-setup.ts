// Polyfill for SockJS and other libraries that expect Node.js global object
// This MUST be the first thing that runs
(window as any).global = window;
(window as any).process = { env: {} };
