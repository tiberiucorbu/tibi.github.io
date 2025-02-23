import {css, html, LitElement} from 'lit';

const badges = {
    experimental: {
        icon: '🧪',
        apiKeyword: 'experimental'
    },
    serverless: {
        icon: '🔌'
    },
    chill: {
        icon: '✨'
    },
    'coming-soon': {
        icon: 'α'
    },
    'unstyled': {
        icon: '💀'
    },

}

export class ToolItem extends LitElement {
    static properties = {
        text: {state: true},
        action: {},
        badges: {type: Array},
        image: {},
        color: {}
    };

    static styles = css`
        :host {
            position: relative;
            display : grid;
            color: white;
            grid-template-areas: "title   title   title"
                                  "info   info    info"
                                  "cookie cookie cookie"
                                  "footer footer footer";
                                  grid-gap: 16px;
                                  padding: 16px;
            background-color: var(--item-background-color);
            background-image: var(--item-background-image);
            background-position: center bottom;
            background-repeat: no-repeat;
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
        
        a {
            text-decoration: none;
            color: white;
            text-shadow: 0px 0px 7px black;
        }
        
        #badges {
            position: absolute;
            top: 6px;
            left: 6px;
        }

  
    `

    async update(changedProperties) {
        if (changedProperties.has('color'))
            this.style.setProperty('--item-background-color', this.color);
        if (changedProperties.has('image'))
            this.style.setProperty('--item-background-image', `url(${this.image})`);
        super.update(changedProperties);
    }

    render() {
        return html`
            <a href="${this.action}">
                <div id="badges">
                    ${(this.renderBadges())}
                </div>
                <h2>${this.title}</h2>
                <div>
                    <slot></slot>
                </div>
            </a>
        `
    }


    renderBadges() {
        if (!this.badges) {
            return html``
        }
        return this.badges.map(badge => {
            if (!badge || !badges[badge.keyword]) {
                return html``
            }
            return html`
                <span title="${badge.info}">${badges[badge.keyword].icon}</span>
            `
        });
    }
}

customElements.define('tc-tool-item', ToolItem);
