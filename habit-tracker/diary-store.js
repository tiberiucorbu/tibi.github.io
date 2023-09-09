import {streamify} from "./streamify.js";

export class DiaryStore {

    async open() {
        this.request = indexedDB.open('habit-tracker-diary', 3);

        this.request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.onerror = (e) => {
                console.log('upgrade failed', e);
            }
            if (!db.objectStoreNames.contains('diary')) {
                const diaryStore = db.createObjectStore('diary', {keyPath: 'timestamp'});
                diaryStore.createIndex('wotd', 'wotd', {unique: false});
            }
            if (!db.objectStoreNames.contains('activity')) {
                const habitStore = db.createObjectStore('activity', {keyPath: 'name'});
                habitStore.createIndex('name', 'name', {unique: true});
            }
        }
        this.db = await new Promise((res, rej) => {
            this.request.onsuccess = (e) => {
                res(e.target.result)
            };
            this.request.onerror = (e) => rej(e);
        });
    }

    async saveActivityGoal(goal) {
        const tx = this.db.transaction('activity', 'readwrite');
        const store = tx.objectStore('activity');
        store.add({...goal});
        const p = new Promise((res, rej) => {
            tx.onsuccess = res;
            tx.onerror = rej;
        });
        await tx.commit();
        return p;
    }

    async* loadDiaryPeriode(start, end) {
        const objectStore = this.db
            .transaction(['diary'], 'readonly')
            .objectStore('diary');

        const boundKeyRange = IDBKeyRange.bound(start, end, true, false);
        const cursorRequest = objectStore.openCursor(boundKeyRange);
        let successEvents = streamify('success', cursorRequest);
        // let successEvents = await this.advanceCursorAt(cursorRequest, start);
        let itemCount = 0;
        for await (const successEvent of successEvents) {
            const cursor = (await successEvent).target.result;
            if (cursor) {
                itemCount++;
                yield cursor.value;
                cursor.continue();
            } else {
                return;
            }
        }
    }

    async* loadActivities(start, count) {
        const objectStore = this.db
            .transaction(['activity'], 'readonly')
            .objectStore('activity');
        const cursorRequest = objectStore.openCursor();
        const successEvents = await this.advanceCursorAt(cursorRequest, start);
        let itemCount = 0;
        for await (const successEvent of successEvents) {
            const cursor = (await successEvent).target.result;
            if (cursor) {
                itemCount++;
                yield cursor.value;
                cursor.continue();
            } else {
                return;
            }
            if (itemCount === count) {
                return;
            }
        }
    }

    async advanceCursorAt(cursorRequest, start) {
        let successEvents = streamify('success', cursorRequest);
        if (start > 0) {
            const item = await successEvents.next(); // get first event;
            const cursor = item.value.target.result;
            cursor.advance(start);
        }
        return successEvents;
    }

    async save(entry) {
        const tx = this.db.transaction('diary', 'readwrite');
        const store = tx.objectStore('diary');
        store.add({timestamp: Date.now(), ...entry});
        const p = new Promise((res, rej) => {
            tx.onsuccess = res;
            tx.onerror = rej;
        });
        await tx.commit();
        return p;
    }


}
