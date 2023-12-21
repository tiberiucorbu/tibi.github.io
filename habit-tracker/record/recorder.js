import {css, html, LitElement, render} from 'lit';

import {loadData} from "/website-commons/load-data.js";
import {DiaryStore} from "../diary-store.js";


export class ActivityRecorder extends LitElement {
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

    static properties = {};

    async firstUpdated() {
        let emojisObject = await loadData('/website-commons/media/emoji-lib.json');
        this.emojis = Object.values(emojisObject);
        await this.store.open();
        // this.entryForm = this.shadowRoot.getElementById('entry-form');
        // this.goalForm = this.shadowRoot.getElementById('goal-form');
        // this.nextButton = this.shadowRoot.getElementById('next-button');
        // this.goals = this.loadGoals();
        // this.summary = this.loadSummary();
    }

    render() {
        return html`
            <span @click="${this.showOptions}">⚙ Options </span>
            <button> record</button>
        `
    }

    async showOptions() {
        const htmlDialogElement = document.createElement('dialog');
        await render(html`
            <tc-dialog-content .dialog="${htmlDialogElement}">
                <h2 slot="title">Recorder Options</h2>
                <tc-activity-recorder-options
                        @recorder-options-changed="${(e) => this.applyOptions(e.detail)}"></tc-activity-recorder-options>
            </tc-dialog-content>
        `, htmlDialogElement);
        document.body.appendChild(htmlDialogElement);
        htmlDialogElement.show();
    }

    applyOptions(options) {
        console.log(options);
    }
}

customElements.define('tc-activity-recorder', ActivityRecorder);


export class ActivityRecorderOptions extends LitElement {

    static get styles() {
        return css`
           #fieldset {
            display: grid;
            max-width: 480px;
           }
        `;
    }

    set data(val) {
        let oldVal = this._data;
        this._data = val;
        this.requestUpdate('prop', oldVal);
    }

    get prop() {
        return this._data;
    }

    constructor() {
        super();
        this.store = new DiaryStore();
    }

    static properties = {data: {type: FormData}};

    async firstUpdated() {
        let emojisObject = await loadData('/website-commons/media/emoji-lib.json');
        this.emojis = Object.values(emojisObject);
        await this.store.open();
        // this.entryForm = this.shadowRoot.getElementById('entry-form');
        // this.goalForm = this.shadowRoot.getElementById('goal-form');
        // this.nextButton = this.shadowRoot.getElementById('next-button');
        // this.goals = this.loadGoals();
        // this.summary = this.loadSummary();
    }

    handleFormChange() {
        const formData = new FormData(this.form);
        const eventOptions = {detail: formData, composed: true, bubbles: true};
        this.data = formData;
        const event = new CustomEvent('recorder-options-changed', eventOptions);
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <form @change="${this.handleFormChange}">
                <fieldset>
                    <label for="include_gps">Include GPS data</label>
                    <input id="include_gps"  ?checked="${this.data?.has('include_gps')}" type="checkbox" name="include_gps"/>
                    <label for="include_motion_sensors">Include Motion Data</label>
                    <input id="include_gps" type="checkbox" name="include_gps"/>
                    <label for="save_location">Save to </label>
                    <select id="save_location" name="save_location">
                        <option value="local_storage">Browser IndexDB Storage</option>
                        <option value="folder">File System</option>
                        <option value="memory">Volatile Memory</option>
                    </select>
                </fieldset>
            </form>

            <button> record</button>
        `
    }
}

customElements.define('tc-activity-recorder-options', ActivityRecorderOptions);


export class Dialog extends LitElement {
    static get styles() {
        return css`
           :host {
                display: grid;
                grid-template-areas: "header actions" "content content";
                grid-template-rows : 30px auto;
                max-width: 900px;
                max-height: 100%;
                grid-gap: 16px;
           }
           
           #content {
             overflow: scroll;
             grid-area: content;
           }
           #header {
             
             grid-area: header;
           }
           
           #actions {
            
             grid-area:actions;
           }
        `;
    }

    constructor() {
        super();
        this.store = new DiaryStore();
    }

    static properties = {
        dialog: {
            type: HTMLDialogElement
        }
    };

    render() {
        return html`
            <header id="header">
                <slot name="title"></slot>
            </header>
            <nav id="actions">${this.renderActions()}</nav>
            <div id="content">
                <slot></slot>
            </div>

        `
    }

    renderActions(){
        return html`<label @click="${()=>{this.dialog.close()}}">❌</label>`
    }
}

customElements.define('tc-dialog-content', Dialog);
