import {css, html, LitElement} from "lit";

export class ActivitySelectItem extends LitElement {
    static properties = {
        activity: {type: Object}
    };

    static get styles() {
        return css`
            .form-control {
                display: block;
            }
        `
    }

    render() {
        return html`
            <label class="form-control">
                <input type="checkbox" value="${this.activity.name}">
                <h4>${this.activity.name}</h4>
                <p>${this.activity.description}</p>
            </label>
        `
    }

    createRenderRoot() {
        return this;
    }
}

customElements.define('tc-activity-select-item', ActivitySelectItem);

