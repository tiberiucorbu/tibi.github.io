import {html, LitElement} from 'lit';
const TOAST_BROADCAST_CHANNEL =  new BroadcastChannel("toasts");
export class ShareWrapper extends LitElement {
    static properties = {
        title: {
            title: String
        },
        text: {
            type: String
        },
        url: {
            type: String
        },
        shareFile: {
            type: Blob
        },
        canShare: {
            type: Boolean,
            state: true
        },
        shareData: {
            type: Object,
            state: true
        },


    };

    constructor() {
        super();
        this.shareFile = null;
        this.url = null;
        this.text = null;
        this.title = null;
        this.addEventListener('click', async () => {
            try {
                await navigator.share(this.shareData);
                this.dispatchEvent(new CustomEvent('✅ Blob shared', {bubbles: true}));
            } catch (error) {
                this.dispatchEvent(new CustomEvent('share-failed', {
                    bubbles: true,
                    detail: {error, shareData: this.shareData}
                }));
                TOAST_BROADCAST_CHANNEL.postMessage({title: '❌ unable to share',text: error});
            }
        });
    }

    willUpdate(changedProperties) {
        super.willUpdate(changedProperties);

        this.shareData = {
            files: this.shareFile ? [this.shareFile] : undefined,
            title: this.title,
            // text: this.text,
            url: this.url
        }
        this.canShare = false;
        try {
            this.canShare = navigator.canShare(this.shareData);
        } catch (e) {
            console.log(e);

        }
    }

    render() {

        return html`
            ${this.canShare ? html`
                <slot></slot>` : html``}
        `
    }

}

customElements.define('tc-share', ShareWrapper);
