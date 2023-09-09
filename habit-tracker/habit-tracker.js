import {css, html, LitElement} from 'lit';
import {asyncAppend} from 'lit-html/directives/async-append';
import {until} from 'lit-html/directives/until';
import {loadData} from "/website-commons/load-data.js";
import {oncePromise} from "./once-promise.js";
import {DiaryStore} from "./diary-store.js";
import {mergeDeep} from "./merge-deep.js";
import {loadUmdScript} from "./load-umd-script.js";

export class HabitTracker extends LitElement {
    static get styles() {
        return css`
           #fieldset {
            display: grid;
            max-width: 480px;
           }
        `;
    }

    constructor() {
        super();
        this.store = new DiaryStore();
    }

    static properties = {
        result: {state: true},
        goals: {state: true},
        summary: {state: true}
    };

    async firstUpdated() {
        let emojisObject = await loadData('/website-commons/media/emoji-lib.json');
        this.emojis = Object.values(emojisObject);
        await this.store.open();
        this.entryForm = this.shadowRoot.getElementById('entry-form');
        this.goalForm = this.shadowRoot.getElementById('goal-form');
        this.nextButton = this.shadowRoot.getElementById('next-button');
        this.goals = this.paginateGoals();
        this.summary = this.loadSummary();
    }

    render() {
        return html`
            ${this.renderSummary()}

            <form id="entry-form">
                <fieldset id="fieldset">
                    <label for="wotd">Word of the day</label>
                    <input id="wotd" name="wotd"/>
                    <label for="motd">Message future self</label>
                    <input id="motd" name="motd">
                    <label for="lotd">Link of the day</label>
                    <input id="lotd" name="lotd">
                    <label for="search">Search goals</label>
                    <input @change="${this.setActivityGoalSearchTerm}" id="search">
                    ${this.renderActivities()}

                    <button @click="${this.addEntry}">➕</button>
                </fieldset>
            </form>
            <button id="next-button">Next</button>
            <form id="goal-form">
                <fieldset id="fieldset">
                    <label for="name">Name</label>
                    <input id="name" name="name"/>
                    <label for="description">Description</label>
                    <input id="description" name="description"/>
                    <button @click="${this.addGoal}">➕</button>
                </fieldset>
            </form>
        `
    }

    async addEntry(e) {
        e.preventDefault();
        const entry = this.collectEntry();
        await this.store.save(entry);
    }

    async setActivityGoalSearchTerm(e) {
        console.log(e)
        const goals = this.searchGoals(e.currentTarget.value);
        for await (const goal of goals) {
            console.log(goal);
        }
    }

    async* searchGoals(searchTerm) {
        if (!this.fuzzySort) {
            this.fuzzySort = await loadUmdScript('/node_modules/fuzzysort/fuzzysort.js');
        }
        const activities = this.store.loadActivities();
        for await (const activity of activities) {
            if (activity) {
                let result = this.fuzzySort.single(searchTerm, activity.name);
                let result1 = this.fuzzySort.single(searchTerm, activity.description);
                if (result || result1)
                    yield activity;
            }
        }
    }

    async addGoal(e) {
        e.preventDefault();
        const entry = this.collectGoal();
        await this.store.saveActivityGoal(entry);

    }

    renderActivities() {
        return html`
            <ul>${asyncAppend(this.goals, (v) => html`
                <li><input name="activity" type="checkbox" value="${v.name}"/> ${v.name}</li>`)}
            </ul>`;
    }

    renderSummary() {
        html`${until(this.loadSummaryTemplate(), html`<span>Loading...</span>`)}`
    }

    async loadSummaryTemplate() {
        const summary = await this.summary;
        return html`${summary ? html`
            <div>
                <p>Word of the day ${summary.wotd}</p>
            </div>` : html``}`;
    }

    async* paginateGoals() {
        let start = 0;
        const count = 10;
        while (true) {
            const cursor = this.store.loadActivities(start, count);
            for await (const item of await cursor) {
                if (!item)
                    return;
                start++;
                yield item;
            }
            const ev = await oncePromise(this.nextButton, 'click');
            ev.preventDefault();
        }
    }

    collectEntry() {
        console.log(this.entryForm.value);
        const data = new FormData(this.entryForm);
        let result = Object.fromEntries(data.entries());
        // For multiple selection we need to call getAll;
        result.activity = data.getAll('activity');
        return result;
    }

    collectGoal() {
        const data = new FormData(this.goalForm);
        return Object.fromEntries(data.entries());
    }

    async* loadSummary() {
        let end = Date.now();
        let start = end - 8.64e+7;
        while (true) {
            const entries = this.store.loadDiaryPeriode(start, end);
            let summary = {};
            let empty = true;
            for await (const entry of entries) {
                empty = false;
                summary = mergeDeep(summary, entry);
            }
            console.log(summary);
            yield empty ? null : summary;
            [start, end] = await this.summaryRangeChanged();
        }
    }

    async summaryRangeChanged() {
        return new Promise(); // TODO : implement
    }
}

customElements.define('tc-habit-tracker', HabitTracker);
