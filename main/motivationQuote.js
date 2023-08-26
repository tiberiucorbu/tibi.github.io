import {css, html, LitElement} from 'lit';
import {shuffleArrayGenerator} from '../website-commons/shuffleArray.js'
import {loadData} from '../website-commons/load-data.js'

export class Motivation extends LitElement {
    static properties = {
        quote: {
            state: true
        }
    };

    static get styles() {
        return css`
            :host {
                display: grid;
                grid-template-areas: "quote quote quote"
                                      ". . author ";
                position: relative;             
                width: 100%;
      
            }
            #quote {
                font-size: 1rem;
                font-family: 'Orbitron-Regular', monospace;
                color: white;
                text-align: justify;
                text-justify: inter-word;     
                opacity: 0;
                filter: blur(3px);
                transition: opacity 1s, filter 1s;
                grid-area : quote;
            }
            
            
            
             /* to make the text streck 
             #quote:after {
                content:'';
                display: inline-block;
                width: 100%;
             } */
             
             @media (min-width: 960px) {
                #quote {
                    font-size: 1.5rem;
                }
  
            }
            #author {
                opacity: 0;
                color: #ffc107;
                filter: blur(3px);
                transition-delay: 1s;
                transition: opacity 1s, filter 1s;
                grid-area : author;
            }
            
            :host-context(.animate-in) #quote {
                opacity: 1;
                filter: blur(0px);
            }
             :host-context(.animate-in) #author {
                opacity: 1;
                filter: blur(0px);
            }
        `;
    }

    async firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);

        this.quotes = await this.loadQuotes();
        while (true) {
            await this.pickNext();
            await new Promise(res => setTimeout(res, 5000));
            await this.animateOut();
        }
    }

    async pickNext() {
        await this.nextQuote();
        await this.animateIn();
    }

    async nextQuote() {
        if (!this.quoteCursor) {
            this.quoteCursor = shuffleArrayGenerator(this.quotes)
        }
        this.quote = this.quoteCursor.next();
        if (this.quote.done) { // start over
            this.quoteCursor = null;
            await this.pickNext()
        }
    }

    render() {
        if (!this.quote)
            return html``;
        return html`
            <div id="quote"><span>“${this.quote.value.quote}“</span></div>
            <span id="author">― ${this.quote.value.author}</span>
            <!--<tc-button id="reload-button">🔄</tc-button>-->

        `
    }

    async animateIn() {
        const animationEndPromise = Promise.race([new Promise(res => this.ontransitionend = res), new Promise(res => setTimeout(res, 2000))])
        let replaced = this.classList.replace('animate-out', 'animate-in');

        if (!replaced) {
            this.classList.add('animate-in');
        }
        return animationEndPromise;

    }


    async animateOut() {
        const animationEndPromise = Promise.race([new Promise(res => this.ontransitionend = res), new Promise(res => setTimeout(res, 2000))])
        let replaced = this.classList.replace('animate-in', 'animate-out');
        if (!replaced) {
            this.classList.add('animate-out');
        }
        return animationEndPromise;
    }


    loadQuotes() {
        return loadData("/website-commons/media/motivations.json");
    }

}


customElements.define('tc-motivation', Motivation);
