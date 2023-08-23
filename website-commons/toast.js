import {css, html, LitElement} from 'lit';

const TOAST_BROADCAST_CHANNEL =  new BroadcastChannel("toasts");
export class Timer {

    constructor(callback, delay) {
        this.timerId = null;
        this.start = null;
        this.remaining = delay;
        this.initial = delay;
        this.callback = callback;
        this.elapsed = 0;
        this.resume();
    }

    pause() {
        window.clearTimeout(this.timerId);
        this.timerId = null;
        let elapsed = Date.now() - this.start;

        this.remaining -= elapsed;

    };

    get percentageProgress() {
        let elapsed = (this.initial - this.remaining) / this.initial;
        return (this.paused ?
                elapsed :
                elapsed + -1 * (this.start - Date.now()) / this.initial)
            * 100;

    }


    get paused() {
        return !this.timerId
    }


    resume() {
        if (this.timerId) {
            return;
        }

        this.start = Date.now();
        this.timerId = window.setTimeout(() => {
            this.remaining = 0;
            this.callback();
        }, this.remaining);
    }
}

export class ToastManager extends LitElement {
    static properties = {
        value: {
            type: String
        }
    };

    static get styles() {
        return css`
        :host {
            display: grid;
            position: fixed;
            bottom: 0px;
            left: 50%;
            transform: translate(-50%, 0px);
            max-width: 480px;
            width: 100%;
            grid-gap: 6px;
        }
     `
    }

    async firstUpdated() {
       TOAST_BROADCAST_CHANNEL.addEventListener('message', (e) => {
            this.show(e.data.title, e.data.text);
        })

    }

    show(title, text) {
        let toast = document.createElement('tc-toast');
        toast.title = title;
        toast.text = text;
        this.shadowRoot.appendChild(toast);
    }

    render() {
        return html``
    }

}

export class Toast extends LitElement {
    static properties = {
        title: {
            type: String
        },
        details: {
            type: String
        }
    };

    static get styles() {
        return css`
        :host {
            --timer-percentage-progress: 0%;
            display: grid;
            position: relative;
            grid-template-areas: 
              "title"
              "text"
              "expire";
            background: black;
            width: 100%; 
            padding: 0 6px;
            color: white;
        }
        #close {
            grid-area: title;
            position: absolute;
            right: 3px;
            top: 3px;
            cursor: pointer;
        }
        
        #title {
            grid-area: title;
        }
        
        #text {
            grid-area: text;
        } 
       
        #timer {
            height: 1.5px;
            grid-area: expire;
            position: relative;
            background: orange;
            width: var(--timer-percentage-progress);
        }
        
        `
    }

    async firstUpdated() {
        this.timer = new Timer(() => {
            this.close();
        }, 5000);
        this.addEventListener('mouseover', () => {
            this.timer.pause();
        })

        this.addEventListener('mouseout', () => {
            this.timer.resume();
        })

        this.updateTimerUi();


    }

    render() {
        return html`
            <span id="close" @click="${this.close}">✖</span>
            <h3 id="title">${this.title}</h3>
            <span id="text">${this.text}</span>
            <span id="timer"></span>
        `
    }

    close() {
        this.parentNode.removeChild(this);
    }

    updateTimerUi() {
        requestAnimationFrame(() => {


            this.style.setProperty('--timer-percentage-progress', this.timer.percentageProgress + '%');

            if (this.timer.remaining > 0) {
                this.updateTimerUi();
            }
        })
    }
}

export class TimerBar extends LitElement {

}


customElements.define('tc-toast', Toast);
customElements.define('tc-toast-manager', ToastManager);
customElements.define('tc-timer-bar', TimerBar);
