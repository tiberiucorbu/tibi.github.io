import { LitElement, html, css } from 'lit';

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

export class FileToBase64Blob extends LitElement {
    static properties = {

    };


    constructor() {
        super()

    }

    render() {
        return html`
            <input type=file @change=${this.computeBase64}>
            <input type=output value=${this.result}>
        `
    }

    async computeBase64(event) {
        const results  = await Promise.all([...event.target.files].map(file => toBase64(file)))
        console.log(results)
    }


}
customElements.define('tc-file-to-base64', FileToBase64Blob)
