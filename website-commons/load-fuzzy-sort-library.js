import {loadUmdScript} from "./load-umd-script.js";

export async function loadFuzzySortLibrary() {
    if (!this.fuzzySort) {
        this.fuzzySort = await loadUmdScript('/node_modules/fuzzysort/fuzzysort.js');
    }
    return this.fuzzySort;
}
