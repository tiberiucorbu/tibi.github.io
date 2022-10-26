import { emojis } from './emojis.js'
import { LitElement, html, css } from 'lit';

export class Cookie extends LitElement {
    static properties = {
        // cookieName: { state: true },
        // dependenteCookieName: { state: true },
        text: { state: true }

    };
    static styles = css`
        :host {
            display : grid;
            grid-template-areas : "title     -     -" 
                                  "info info info"
                                  "cookie cookie cookie"
                                  "-       -    buttons"
        }

        h2 {
            grid-area: title;
        }

        p {
            grid-area : info;
        }


  
    `

    constructor() {
        super()
        this.cookieName = this.renderNextCookie(6)
        this.dependenteCookieName = this.renderNextCookie(6)
        this.text = html`Do you agree to write this <strong>${this.cookieName}</strong> cookie ?`
    }

    render() {
        return html`
            <h2><sup>USE</sup>LESS 🍪</h2>
            <p>This website doesn't use any cookie but as I want to statisfy even the ones that love cookies the website can write a special entropic emoji cookie for you</p>
            <p>${this.text}</p>
            <button @click=${this.setContinueState}> Okay, I agree </button>
            <button @click=${this.setNotOkayState}> No, please don't write any cookies </button>
        `
    }

    renderNextCookie(length) {
        let result = ''
        for (let i = 0; i < length; i++) {
            result += emojis[Math.trunc(Math.random() * emojis.length)].emoji
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
        // this.msgSpeak.text = this.teaser.innerText
        // speechSynthesis.speak(this.msgSpeak)
    }

}
customElements.define('tc-cookie', Cookie);