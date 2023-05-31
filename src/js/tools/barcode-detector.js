/*
Copyright 2023 Tiberiu CORBU

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


import {css, html, LitElement} from 'lit';

export class BarcodeDetectorElement extends LitElement {
    static properties = {
        // text: { state: true },
        results: {state: true, type: Array},
        scanning : {state: true, type: Boolean}
    };
    static styles = css`
       :host {
            display:block;
       }
       
      #wrapper {
            display : grid;
            max-width: 960px;
            position: relative;
            margin: 0 auto;
            grid-template-rows: 1fr auto;
            grid-template-columns: auto;
        }

        #buttons {
          display: flex;
          justify-content: center;
          padding: 16px;
        }

        #results {
          width: 100%;
        }

    `

    constructor() {
        super();
        this.results = [];
    }

    render() {
        return ("BarcodeDetector" in window) ?
            html`
                <div id="wrapper">
                    <div id="buttons">
                        ${!this.scanning?
                html`<button @click="${this.scan}">⏺ Start Scanning</button>`:
                html`<button @click="${this.stop}">⛔ Stop </button>`}
                    </div>
                    <ul id="results">${this.results.map(result => html`<li>${result.rawValue}</li>`)}
                </div>
            ` : html`😭 Your browser doesn't support the barcode api`;
    }

    async scan() {
        this.scanning = true;
        // check supported types
        const formats = await BarcodeDetector.getSupportedFormats();
        const barcodeDetector = new BarcodeDetector({formats});

        this.stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {
                    ideal: 'environment'
                }
            }, audio: false
        });

        const videoTrack = this.stream.getVideoTracks()[0];
        const trackProcessor = new MediaStreamTrackProcessor({track: videoTrack});
        // const trackGenerator = new MediaStreamTrackGenerator({kind: "video"});
        const that = this;
        const transformer = new TransformStream({
            async transform(videoFrame, controller) {
                try {
                    const image = await createImageBitmap(videoFrame);
                    const barcodes = await barcodeDetector.detect(image);
                    that.addResults(...barcodes);
                    // const newFrame = highlightBarcodes(videoFrame, barcodes);
                    videoFrame.close();
                    // controller.enqueue(newFrame);
                } catch (e) {
                    alert(e.message)
                }
            },
        });

        await trackProcessor.readable
            .pipeThrough(transformer);
        // .pipeTo(trackGenerator.writable);
    }

    addResults(results){
        this.results.push(...results);
        this.results = [...new Set(this.results)];
        // this.requestUpdate('results');
    }

    stop(){
        this.stream.getVideoTracks().forEach(track => track.stop());
        this.scanning = false;
    }

}

customElements.define('tc-barcode-detector', BarcodeDetectorElement);
