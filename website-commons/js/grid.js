import { LitElement, html, css } from 'lit'

export class Grid extends LitElement {
    static properties = {
        columnWidth: { attribute: 'column-width' }
    };
    static styles = css`
        :host {
            margin-top: 0.9rem;
            display: grid;
            grid-gap: 1.8rem;
            width: 100%;
            justify-content: center;
        }
    `

    constructor() {
        super()
        this.columnWidth = '320px'
    }


    render() {
        return html`
        <style>
            :host {
                grid-template-columns: repeat(auto-fill, ${this.columnWidth});
                grid-auto-rows: ${this.columnWidth};
            }
        </style>
        <slot>`
    }

}
customElements.define('tc-grid', Grid)
