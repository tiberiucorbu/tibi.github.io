export function registerPerformanceConsoleLogger() {
    // Catch errors since some browsers throw when using the new `type` option.
    // https://bugs.webkit.org/show_bug.cgi?id=209216
    try {
        // Create the performance observer.
        const po = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                // Log the entry and all associated details.
                console.log(entry.toJSON());
            }
        });
        // Start listening for `measure` entries to be dispatched.
        po.observe({type: 'measure', buffered: true});
    } catch (e) {
        // Do nothing if the browser doesn't support this API.
    }

}
