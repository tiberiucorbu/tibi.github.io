import {css, html, LitElement} from 'lit';
import {loadData} from "/website-commons/load-data.js";
import {registerServiceWorker} from "/website-commons/register-service-worker.js";

registerServiceWorker();


export class TextToEmoji extends LitElement {
    static get styles() {
        return css`
           #fieldset {
            display: grid;
            max-width: 480px;
           }
        `;
    }

    static properties = {
        result: {state: true}
    };

    async firstUpdated() {
        let emojisObject = await loadData('/website-commons/media/emoji-lib.json');
        this.emojis = Object.values(emojisObject);

    }

    render() {
        return html`
            <canvas></canvas>
            <input type="file">
            <tc-image-annotate-toolbox></tc-image-annotate-toolbox>
        `
    }

    async convertText(event) {
        performance.mark('find-emojis:start');
        const text = event.target.value;
        const shuffledEmojis = shuffle([...this.emojis]);
        this.result = text.split(" ").map((word) => {
            // const result = this.fuse.search(word, {limit: 1});
            // console.log(word, result);
            const emoji = shuffledEmojis.find(emojiEntry =>
                !!emojiEntry.keywords && !!~emojiEntry.keywords.indexOf(word));
            if (emoji) {
                return emoji.char;
            } else {
                return word;
            }

        }).join(' ');
        performance.mark('find-emojis:end');
        performance.measure('find-emojis', 'find-emojis:start', 'find-emojis:end');

    }
}

customElements.define('tc-text-to-emoji', TextToEmoji)
