import {css, html, LitElement, render} from 'lit';
import {asyncAppend} from 'lit-html/directives/async-append';
import {until} from 'lit-html/directives/until';
import {loadData} from "/website-commons/load-data.js";
import {oncePromise} from "./once-promise.js";
import {DiaryStore} from "./diary-store.js";
import {mergeDeep} from "./merge-deep.js";
import {ActivitySelectItem} from "../website-commons/activate-item-button.js";

function debounce(listener, cooldownInterval) {

    let timerId = null;

    return (e) => {
        if (timerId) {
            window.clearTimeout(timerId);
        }
        timerId = window.setTimeout(() => {
            listener(e);
        }, cooldownInterval);
    }
}

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
        this.goals = this.loadGoals();
        this.summary = this.loadSummary();
    }

    render() {
        return html`
            ${this.renderSummary()}

            <form id="entry-form">

                <fieldset id="fieldset">
                    <tc-activity-selector>
                        <template slot="activity-item-template-slot">
                            <tc-activity-select-item type=checkbox name="dude"></tc-activity-select-item>
                        </template>
                    </tc-activity-selector>
                    <label for="wotd">Word of the day</label>
                    <input id="wotd" name="wotd"/>
                    <label for="motd">Message future self</label>
                    <input id="motd" name="motd">
                    <label for="lotd">Link of the day</label>
                    <input id="lotd" name="lotd">
                    <label for="search">Search goals</label>

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
        this.searchTerm = e.currentTarget.value;
    }

    async* loadGoals(searchTerm, start, count) {

        const activities = this.store.loadActivities(start, count, searchTerm);
        for await (const activity of activities) {
            if (!activity) {
                return;
            }
            this.start++;
            yield activity;
            await oncePromise(this.nextButton, 'click');

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

    // async* paginateGoals() {
    //     this.start = 0;
    //     this.count = 10;
    //     while (true) {
    //         const cursor = this.store.loadActivities(this.start, this.count);
    //         for await (const item of await cursor) {
    //             if (!item)
    //                 return;
    //             this.start++;
    //             yield item;
    //         }
    //         const ev = await oncePromise(this.nextButton, 'click');
    //         ev.preventDefault();
    //     }
    // }

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


export class ActivityList extends LitElement {


    constructor() {
        super();
        this.store = new DiaryStore();
    }

    static properties = {
        searchTerm: {type: String},
        goals: {state: true}
    };

    async firstUpdated() {
        await this.store.open();
        this.start = 0;
        this.count = 10;
        this.searchField = this.shadowRoot.getElementById('search');
        this.next = this.shadowRoot.getElementById('next');
        this.activityItemTemplateSlot = this.shadowRoot.getElementById('item-template-slot');
        this.goals = this.loadGoals();
        // this.summary = this.loadSummary();
    }

    update(changedProperties) {
        super.update(changedProperties);
        if (changedProperties.has('searchTerm')) {
            this.start = 0;
            this.goals = this.loadGoals();
        }
    }


    render() {
        render(html`${asyncAppend(this.goals, (v) => this.renderActivityItem(v))}`, this);

        return html`
            <input id="search" @keyup="${debounce(this.updateSearchTerm.bind(this), 750)}" placeholder="search"/>
            <slot id="item-template-slot" name="activity-item-template-slot"></slot>
            <slot></slot>
            <span id="next">Next</span>
        `;
    }

    renderActivityItem(item) {
        // const template = this.activityItemTemplateSlot.ass
        const template = this.activityItemTemplateSlot.assignedElements().pop();
        if (!template instanceof HTMLTemplateElement) {
            throw new Error(`Expected a template element on the item template slot but found ${template}`)
        }
        let fragment = template.content.cloneNode(true);
        if (fragment.firstElementChild) {
            // fragment.firstElementChild.setAttribute('activity', JSON.stringify(item));
            fragment.firstElementChild.activity = item;
        }
        return fragment;
        // console.log(item, this.activityItemTemplateSlot);
    }

    updateSearchTerm() {
        this.searchTerm = this.searchField.value;
    }

    async* loadGoals() {
        while (true) {
            const activities = this.store.loadActivities(this.start, this.count, this.searchTerm);
            for await (const activity of activities) {
                if (!activity) {
                    return;
                }
                this.start++;
                yield activity;
            }
            await oncePromise(this.next, 'click');
        }
    }

}

customElements.define('tc-activity-selector', ActivityList);



export class ActivityForm extends LitElement {
    render() {
        html`
            <form id="goal-form">
                <fieldset id="fieldset">
                    <label for="name">Name</label>
                    <input id="name" name="name"/>
                    <label for="description">Description</label>
                    <input id="description" name="description"/>
                </fieldset>
            </form>`
    }
}

customElements.define('tc-activity-form', ActivityForm);
