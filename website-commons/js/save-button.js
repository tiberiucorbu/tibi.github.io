import {html, LitElement} from 'lit';

const TOAST_BROADCAST_CHANNEL = new BroadcastChannel("toasts");

export class SaveButton extends LitElement {
    static properties = {

        file: {
            type: File
        }
    };

    constructor() {
        super();
        this.addEventListener('click', async () => {
            const blobUrl = URL.createObjectURL(this.file);
            const link = document.createElement('a');
            link.style = 'display: none';
            link.href = blobUrl;
            link.download = this.file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    willUpdate(changedProperties) {
        super.willUpdate(changedProperties);
    }

    render() {
        return html`${this.file ? html`
            <slot></slot>` : html``}`
    }

}

customElements.define('tc-save', SaveButton);
