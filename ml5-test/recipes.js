import {html, LitElement} from 'lit';


import {loadUmdScript} from "/website-commons/load-umd-script.js";

export async function loadML5Library() {
    if (!this.ml5) {
        this.ml5 = await loadUmdScript('/node_modules/ml5/dist/ml5.min.js');
    }
    return this.ml5;
}

export async function loadP5Library() {
    if (!this.p5) {
        this.p5 = await loadUmdScript('/node_modules/p5/lib/p5.min.js');
    }
    return this.p5;
}

export class ML5Test extends LitElement {

    constructor() {
        super();

    }

    async firstUpdated(_changedProperties) {
        await Promise.all([loadP5Library.call(this), loadML5Library.call(this)]);
        this.sentiment = await new Promise((res) => {
            const sentiment = this.ml5.sentiment('movieReviews', () => res(sentiment));

        });
    }

    checkSentiment(e) {
        const text = e.target.value;
        this.result = this.sentiment.predict(text);
        console.log(this.result);
        this.requestUpdate();
    }

    render() {
        return html`
            Playing around with ML5

            <input @change="${this.checkSentiment}">
            <span>${this.result?.score}</span>
        `;
    }
}

customElements.define('tc-ml5-test', ML5Test);
