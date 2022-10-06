import { LitElement, html, css } from 'lit'

export class Grid extends LitElement {
    static properties = {
        columnWidth: { attribute: 'column-width' }
    };
    static styles = css`
        :host {
            margin-top: 2rem;
            display: grid;
            grid-gap: 1.9rem;

            grid-auto-rows: 200px;
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
            }
        </style>
        <slot>`
    }

}
customElements.define('tc-grid', Grid)
