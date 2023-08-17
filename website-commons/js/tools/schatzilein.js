import {PeerConnectionCoordinator} from './peerConnectionCoordinator.js'

function generateRandomId() {
    const buffer = new Uint8Array(32);
    self.crypto.getRandomValues(buffer);
    const decoder = new TextDecoder('utf8');
    return btoa(encodeURIComponent(decoder.decode(buffer)));
}

const signalingEndpoint = 'http://signal.tibi.rocks';

export class PeerChat extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    setDataChannel(dataChannel) {
        this.dataChannel = dataChannel;
        console.log(this.dataChannel);
        // this.dataChannel.addEventListener('')
    }


}

customElements.define('tc-peer-chat', PeerChat);

customElements.define('tc-schatzilein', class extends HTMLElement {

    constructor() {
        super();
        const currentPage = new URL(window.location)

        const remotePeerId = currentPage.searchParams.get('remotePeerId');
        this.localPeerId = generateRandomId();
        const answerer = !!remotePeerId;
        currentPage.searchParams.set('localPeerId', this.localPeerId);
        if (!answerer) {
            currentPage.searchParams.set('initiator', 'true');
        }
        const state = {
            remotePeerId, localPeerId: this.localPeerId, initiator: !answerer
        };
        history.pushState(state, "", currentPage.toString());

        this.peerConnection = new PeerConnectionCoordinator({
            signalingEndpoint: signalingEndpoint,
            progressCallback: (progress) => {
                this.progressOutput.value = progress;
            },
            answerer: answerer
        });
        if (answerer) {
            this.localPeerId = generateRandomId();
            this.peerConnection.start(this.localPeerId, remotePeerId).then(dataChannel => {
                this.renderChat(dataChannel);
            });
        }

        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
            <style>
            :host {
               font-family:  "Open Sans", sans-serif;
               display: grid;
               grid-template-columns: 350px  auto   350px    auto;
               grid-template-rows: 45px auto 40px;
               grid-template-areas:
                "header  progress   progress    progress"
                "form  main main    main"
                "footnote   .   save-all    .";
                grid-gap: 8px;
                height: 95%;
                overflow: hidden;
                align-content: stretch;
                column-gap: 30px;
                row-gap: 20px;
                padding: 5px;
                margin: 5px;
            }
            
            img {
                width: 100%;
            }
            
            h1 {
                color: white;
                grid-area: header;
                margin: auto;
                padding: 8px;
                background: #0046AA;
                font-family:  paybackLightFont;
                font-size: 1.65rem;
                text-align: center;
                width: 370px;
            }
            
            form {
                grid-area: form;
                display: grid;
                grid-template-columns: auto  auto;
                grid-template-rows: 30px  30px  auto  1fr  40px;
                grid-template-areas:
                "sessionToken  sessionTokenField"
                "portalUrl  portalUrlField"
                "coupons    ."
                "couponsField  couponsField"
                "submit  submit";
                grid-gap: 5px; 
                height: 100%;
                align-content: stretch;
                column-gap: 10px;
                row-gap: 10px;
                width: 100%;
                padding: 1px;
                margin: 1px;
            }
            
            .sessionToken{
                grid-area: sessionToken;
                color: #0046AA;
            }
            
            #sessionToken, #portalBaseUrl, #couponIds{
                height: auto;
                border: 1px solid #0046AA;
                font-family: "Open Sans",Arial,sans-serif;
                font-weight: normal;
                font-size: 0.9rem;
                color: #313133;
                border-radius: 5px;
                width: auto;
                flex: auto;
            }
            
            #sessionToken{
                grid-area: sessionTokenField;
            }
            
            .portalUrl{
                grid-area: portalUrl;
                color: #0046AA;
            }
            
            #portalBaseUrl{
                grid-area: portalUrlField;
            }
            
            .coupons{
                grid-area: coupons;
                color: #0046AA;
            }
            
            #couponIds{
                grid-area: couponsField;
            }
            
            .submit, #save-all{
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                color: white;
                font-family: paybackLightFont, "Open Sans", sans-serif;
                font-size: 1.4rem;
                border: 0px;
                border-radius: 5px;
                width: 100%;
                height: auto;
                background: #0046AA;
                box-shadow: rgb(0 0 0 / 15%) 0px 3px 6px, rgb(0 0 0 / 12%) 0px 0px 2px;
                transition: margin 0.3s ease 0s, width 0.3s ease 0s, border-radius 0.3s ease 0s, color 0.3s ease 0s;
            }
            
            .submit{
                grid-area: submit;
            }
            
            .submit:hover, #save-all:hover {
                  background-color: #002E79;
                  color: white;
            }
            
            #save-all {
                grid-area: save-all;
            }
            
            #screenshots {
              grid-area: main;
              display: grid;
              overflow-y: auto;
              height: 100%;
              grid-gap: 8px;
              grid-template-columns: repeat(auto-fill, 200px);
              justify-content: center;
            }
            
            #progress-container {
                grid-area: progress;
                background: #0046AA;
                width: 100%;
                color: white;
            }
            
            #footnote {
                grid-area: footnote;
                font-size: 8px;
                width:auto;
            }
            
            </style>
            <h1>Peer</h1>
            <form>
                <button class="submit"></button>
            </form>
            <div id="progress-container">
            <progress style="display: none" ></progress>
            <output id="progress-output" type="output" style="display: none"></output>
            </div>
            <div id="chat">  
                
            </div>
            <button id="save-all">Save on disk</button>
            <p id="footnote"></p>
        `;
        this.form = this.shadowRoot.querySelector('form');
        if (sessionStorage.getItem('form-data')) {
            try {
                const values = JSON.parse(sessionStorage.getItem('form-data'));
                Object.keys(values).forEach((field, index) => {
                    this.form[index].value = values[field];
                });
            } catch (e) {
                console.log('session storage is malformed, removing', e);
                sessionStorage.removeItem('form-data');
            }
        }
        this.form.addEventListener('change', () => {
            const form = new FormData(this.form);
            const value = Object.fromEntries(form.entries());
            sessionStorage.setItem('form-data', JSON.stringify(value));
        })
        this.buttonSubmit = this.shadowRoot.querySelector('button.submit');
        this.buttonSave = this.shadowRoot.getElementById('save-all');
        this.portalBaseUrl = this.shadowRoot.getElementById('portalBaseUrl');

        this.progress = this.shadowRoot.querySelector('progress');
        this.progressOutput = this.shadowRoot.getElementById('progress-output');
        this.screenshots = this.shadowRoot.getElementById('screenshots');
        this.footnote = this.shadowRoot.getElementById('footnote');
        this.buttonSubmit.addEventListener('click', async (event) => {
            this.buttonSubmit.setAttribute('disabled', 'disabled');
            event.preventDefault();
            const partnerUrl = new URL(window.location);
            partnerUrl.searchParams.set('remotePeerId', this.localPeerId); //   change to some crypto signing
            partnerUrl.searchParams.delete('localPeerId');
            try {
                await navigator.share({title: 'Open this url on your second device', url: partnerUrl.toString()});
            } catch (err) {
                console.error('Unable to share the link', err);
            }

            const dataChannel = await this.peerConnection.start(this.localPeerId);
            this.renderChat(dataChannel);
            this.progress.value = 0;
            this.progress.style.display = 'block';
            this.progressOutput.style.display = 'block';
        })

        this.renderConfig();
    }


    renderChat(dataChannel) {
        const peerChat = new PeerChat();
        peerChat.setDataChannel(dataChannel);
        this.shadowRoot.getElementById('chat').appendChild(peerChat);
    }

    renderConfig() {
        // fetch('/config').then(res => res.json()).then(res => {
        //     this.footnote.innerText = `With ❤ by Web Team \n\n V: ${res.version}, playwright version ${res.playwrightVersion} on the portal : ${res.portalBaseUrl}`
        //     this.portalBaseUrl.placeholder = res.portalBaseUrl;
        // });

    }
});
