import {css, html, LitElement} from "lit";
const scale = 1;
const buttonStyle = css`
  
.neonText {
  --scale: 2;
  color: #fff;
  text-shadow:
    0 0 calc(7px * var(--scale)) #fff,
    0 0  calc(10px * var(--scale))  #fff,
    0 0  calc(21px * var(--scale)) #fff,
    0 0  calc(42px * var(--scale))  #bc13fe,
    0 0  calc(82px * var(--scale))  #bc13fe,
    0 0  calc(92px * var(--scale))  #bc13fe,
    0 0  calc(102px * var(--scale))  #bc13fe,
    0 0  calc(151px * var(--scale))  #bc13fe;
}

.button {
  font-size: 6.2rem;
  animation: pulsate 1.5s infinite alternate;  
  border: 0.2rem solid #fff;
  border-radius: 1rem;
  padding: 0.4em;
  background: transparent;
  box-shadow: 0 0 calc(0.2rem  * var(--scale)) #fff,
            0 0 calc(0.2rem  * var(--scale)) #fff,
            0 0 calc(2rem  * var(--scale)) #bc13fe,
            0 0 calc(0.8rem  * var(--scale)) 0.8rem #bc13fe,
            0 0 calc(2.8rem  * var(--scale))2.8rem #bc13fe,
            inset 0 0 calc(1.3rem  * var(--scale)) #bc13fe; 
}


@keyframes pulsate {
    
    100% {

        text-shadow:
        0 0 4px #fff,
        0 0 11px #fff,
        0 0 19px #fff,
        0 0 40px #bc13fe,
        0 0 80px #bc13fe,
        0 0 90px #bc13fe,
        0 0 100px #bc13fe,
        0 0 150px #bc13fe;

    }
  
    0% {

      text-shadow:
      0 0 2px #fff,
      0 0 4px #fff,
      0 0 6px #fff,
      0 0 10px #bc13fe,
      0 0 45px #bc13fe,
      0 0 55px #bc13fe,
      0 0 70px #bc13fe,
      0 0 80px #bc13fe;

  }
}


.neonText:active {
  filter: url(#displacementFilter)
  
}
`;

export class CustomButton extends LitElement {
    static get styles() {
        return buttonStyle;
    }

    render() {
        return html`
            <svg style="display: none"
                    xmlns="http://www.w3.org/2000/svg">
                <filter id="displacementFilter">
                    <feTurbulence
                            type="turbulence"
                            baseFrequency="0.04"
                            numOctaves="2"
                            result="turbulence" />
                    <feDisplacementMap
                            in2="turbulence"
                            in="SourceGraphic"
                            scale="5"
                            xChannelSelector="R"
                            yChannelSelector="G" />
                </filter>


            </svg>
            <button class="button neonText">
                <slot></slot>
            </button>
        `
    }
}

customElements.define('tc-button', CustomButton);
