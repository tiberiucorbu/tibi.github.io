import {css, html, LitElement} from 'lit';
import './copy-button.js'
import './share-button.js'
import './save-button.js'
const toBase64 = (file, progressCallback) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onprogress = progressCallback
    reader.onerror = reject;
    reader.onload = () => resolve({result: reader.result, file: file});
});


export class FileToBase64Blob extends LitElement {
    static properties = {
        results: {
            state: true,
            type: Array
        }
    };

    static get styles() {
        return css`
        .item {
            display: grid;
            grid-columns: 1fr 1fr 64px 64px; 
        }`
    }


    constructor() {
        super()
        this.results = [];
        this.pasteListener = async (e) => {
            //  e.preventDefault();
            const clipboardItems = typeof navigator?.clipboard?.read === 'function' ? await navigator.clipboard.read() : e.clipboardData.files;

            for (const clipboardItem of clipboardItems) {
                let blob;
                if (clipboardItem.type?.startsWith('image/')) {
                    blob = clipboardItem
                    this.results.push(await toBase64(blob, (e) => {
                        console.log(e);
                    }))
                    this.requestUpdate('results')
                } else {
                    // For files from `navigator.clipboard.read()`.
                    const imageTypes = clipboardItem.types?.filter(type => type.startsWith('image/'))
                    for (const imageType of imageTypes) {
                        blob = await clipboardItem.getType(imageType);
                        this.results.push(await toBase64(blob, (e) => {
                            console.log(e);
                        }))
                        this.requestUpdate('results')
                    }
                }
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('paste', this.pasteListener);

    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('paste', this.pasteListener);

    }

    render() {
        return html`
            <p>Select a local file or simply paste from the clipboard</p>
            <input type=file @change=${this.computeBase64}>
            ${this.results.map(item => {
                let file = new File(
                        [new Blob([item.result])],
                        `base64.txt`,
                        {type: 'text/plain'});
                return html`
                <div class="item">
                    <span>${item.file.name}</span>
                    <span>${item.result.slice(0, 30)}…</span>
                    <div>
                        <tc-copy .value="${item.result}"
                                 .toastTitle="Copied ${item.file.name} as base64 text to clipboard">
                            <button hint="Copy to clipboard">✂ Copy</button>
                        </tc-copy>
                        <tc-share
                                .file="${file}" .title=${`${item.file.name} as base64 format in plain/text `}>
                            <button hint="Share">⬆ Share</button>
                        </tc-share>
                        <tc-save
                                .file="${file}"}>
                            <button hint="Download File">👇 Save File</button>
                        </tc-save>
                    </div>
                </div>
            `;
            })}
        `
    }

    async computeBase64(event) {
        this.results.push(...await Promise.all([...event.target.files].map(file => toBase64(file, (e) => {
            console.log(e)
        }))))
        this.requestUpdate('results');
    }


}

customElements.define('tc-file-to-base64', FileToBase64Blob)
