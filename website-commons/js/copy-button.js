import {html, LitElement} from 'lit';
 const TOAST_BROADCAST_CHANNEL =  new BroadcastChannel("toasts");
export class CopyButton extends LitElement {
    static properties = {
        value: {
            type: String
        }
    };

    constructor() {
        super();
        this.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(this.value)
                TOAST_BROADCAST_CHANNEL.postMessage({title: '✔ copied'});
                this.dispatchEvent(new CustomEvent('copied', {bubbles: true}));
            } catch (e) {
                this.dispatchEvent(new CustomEvent('copy-failed', {bubbles: true, detail: e}));
                TOAST_BROADCAST_CHANNEL.postMessage({title: '❌ unable to copy to clipboard'});
            }
        })
    }

    render() {
        return html`
            ${navigator.clipboard?.writeText ? html`<slot></slot>` : html``}
        `
    }

}

customElements.define('tc-copy', CopyButton);
