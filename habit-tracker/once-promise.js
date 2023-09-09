// Generate a Promise that listens only once for an event
export var oncePromise = (emitter, event) => {
    return new Promise(resolve => {
        var handler = (...args) => {
            emitter.removeEventListener(event, handler);
            resolve(...args);
        };
        emitter.addEventListener(event, handler);
    });
};
