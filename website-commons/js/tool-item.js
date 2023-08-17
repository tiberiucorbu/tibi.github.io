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
    'comming-soon': {
        icon: '🔜'
    }
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
                                    "info     info     info"
                                    "cookie     cookie     cookie"
                                    "footer   footer   footer";
                                    grid-gap: 16px;
                                    padding: 16px;
            background: var(--item-background-color);
            background-image: url(var(--item-background-image));
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
            this.style.setProperty('--item-background-image', this.image);
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
