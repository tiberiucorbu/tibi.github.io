import { LitElement, html, css } from 'lit';

export class Card extends LitElement {
    static properties = {
        text: {},
        action: {},
        image: {}
    };
    static styles = css`
        a {
            text-decoration: none;
        }
    `;

    constructor() {
        super();

    }

    render() {
        return html`
        <a href="${this.action}" style="background-image: url(${this.image})"> 
            <p>${this.text}</p>
        </a>`;
    }

}
customElements.define('tc-card', Card);
