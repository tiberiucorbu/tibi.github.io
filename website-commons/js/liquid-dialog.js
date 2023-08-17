import { LitElement, html, css } from 'lit'

export class LiquidBackdrop extends LitElement {
    static styles = css`
      #background {
        display:grid;
        align-items:center;
        justify-content:center;
        min-height:100vh;
        background:white;
        filter: blur(10px) contrast(18); /* this is fucking genius 🤯 */
        mix-blend-mode: screen;
      }
      
      #a, #b {
       position : absolute;
       height : 100px;
       width : 100px;
       background: white;
       background-color:#100;
      }
      
      #a {
       top : 100px;
       left : 100px; 
      }
      
      #b {
        top : 120px;
        left : 150px;
        border-radius: 50%;
      }
    `

    constructor() {
        super()
    }

    handleSlotchange(e) {
        const childNodes = e.target.assignedNodes({ flatten: false });
        if (childNodes)
        // ... do something with childNodes ...
        this.allText = childNodes.map((node) => {
            return node.textContent ? node.textContent : ''
        }).join('');
        console.log(this.allText);
    }

    render() {
        return html`<div id=background></div><slot @slotchange=${this.handleSlotchange} slot>`
    }

}
customElements.define('tc-liquid-backdrop', LiquidBackdrop)