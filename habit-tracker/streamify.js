// Turn any event emitter into a stream
import {oncePromise} from "./once-promise.js";

export var streamify = async function* (event, element) {
    while (true) {
        yield await oncePromise(element, event);
    }
};
