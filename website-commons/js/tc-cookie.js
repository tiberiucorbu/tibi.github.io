import { LitElement, html, css } from 'lit';
import {loadData} from "../load-data.js";
import './button.js';
export class Cookie extends LitElement {
    static properties = {
        text: { state: true }

    };
    static styles = css`
        :host {
            display : grid;
            background: black;
            color: white;
            grid-template-areas: "title   title   title"
                                    "info     info     info"
                                    "cookie     cookie     cookie"
                                    "footer   footer   footer";
                                    grid-gap: 16px;
                                    padding: 16px;
        }

        h2 {
            grid-area: title;
        }

        #info {
            grid-area : info;
        }
        
        #cookie {
            grid-area : cookie;
        }

        #buttons {
            grid-area : footer;
        }

  
    `
    async firstUpdated() {

        let emojisObject = await loadData('/website-commons/media/emoji-lib.json');
        this.emojis = Object.keys(emojisObject);
        this.cookieName = this.renderNextCookie(6)
        this.dependenteCookieName = this.renderNextCookie(6)
        this.text = html`Do you agree to write this <strong>${this.cookieName}</strong> cookie ?`

    }
    render() {
        return html`
            <h2><sup>USE</sup>LESS 🍪</h2>
            <p id="info">This website doesn't use any cookie but as I want to statisfy even the ones that love cookies the website can write a special entropic emoji cookie for you</p>
            <p id="cookie">${this.text}</p>
            <div id="buttons">
                <tc-button @click=${this.setContinueState}> 👍, I agree </tc-button>
                <tc-button @click=${this.setNotOkayState}> No, please don't write any cookies </tc-button>
            </div>
        `
    }

    renderNextCookie(length) {
        let result = ''
        for (let i = 0; i < length; i++) {
            result += this.emojis[Math.trunc(Math.random() * this.emojis.length)]
        }
        return result
    }

    setNotOkayState() {
        this.text = html`Okay`

    }


    setContinueState() {
        this.cookieName = this.dependenteCookieName
        this.dependenteCookieName = this.renderNextCookie(6)
        this.text = html`Great, but in order to write ${this.cookieName} Cookie, you need to agree on writing this other cookie ${this.dependenteCookieName}`
    }

}
customElements.define('tc-cookie', Cookie);
