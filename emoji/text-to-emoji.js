import {css, html, LitElement} from 'lit';
import {loadData} from "/website-commons/load-data.js";
import {registerServiceWorker} from "/website-commons/register-service-worker.js";

registerServiceWorker();

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

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
            <form>
                <fieldset id=fieldset>
                    <legend>Find an emoji within the text:</legend>
                    <label for=input>Text :</label>
                    <input id=input @change=${this.convertText}>
                    <br/>
                    <label for=output>Result :</label>
                    <input id=output type=output value=${this.result}>
                </fieldset>
            </form>

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
