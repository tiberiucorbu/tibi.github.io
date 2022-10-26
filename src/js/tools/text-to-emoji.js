import { LitElement, html, css } from 'lit';
import {emojis} from './emojis.js'

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

export class TextToEmoji extends LitElement {
    static properties = {

    };

    constructor() {
        super()
    }

    render() {
        return html`
            <input @change=${this.convertText}>
            <input type=output value=${this.result}>
        `
    }

    async convertText(event) {
         const text = event.target.value;
         text.split(" ")
            .map(word => emojis
                            .find(emojiEntry => !~emojiEntry.searchTerm.indexOf(word)) 
                        );

    }


}
customElements.define('tc-text-to-emoji', TextToEmoji)
