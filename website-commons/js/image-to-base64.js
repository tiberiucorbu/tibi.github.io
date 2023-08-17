import {html, LitElement} from 'lit';

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({result: reader.result, file: file});
    reader.onerror = error => reject(error);
});

export class FileToBase64Blob extends LitElement {
    static properties = {
        results: {
            state: true,
            type: Array
        }
    };


    constructor() {
        super()
        this.results = [];
    }

    render() {
        return html`
            <input type=file @change=${this.computeBase64}>
            ${this.results.map(item => html`
                <div>
                    <span>${item.file.name}</span>
                    <input type=output value=${item.result}>
                </div>
            `)}
        `
    }

    async computeBase64(event) {
        this.results.push(...await Promise.all([...event.target.files].map(file => toBase64(file))))
        this.requestUpdate('results');
        console.log(this.results);
    }


}

customElements.define('tc-file-to-base64', FileToBase64Blob)
