// Global polyfills for test environment
// This file is loaded before any test files

// Polyfill for Node.js global object (required by sockjs-client and other libs)
(window as any).global = window;

// Polyfill for Buffer (some libraries may need it)
(window as any).Buffer = (window as any).Buffer || {};

// Polyfill for process.env (some libraries expect this)
(window as any).process = (window as any).process || {};
(window as any).process.env = (window as any).process.env || {};
(window as any).process.nextTick = (window as any).process.nextTick || ((fn: Function) => setTimeout(fn, 0));
