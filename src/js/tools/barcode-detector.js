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
        results: {
            state: true,
            type: Array
        },
        scanning: {
            state: true,
            type: Boolean
        }
    };

    get video() {
        return (this._video ??= this.renderRoot?.querySelector('video') ?? null);
    }

    static styles = css`
       :host {
            display:block;
       }
       
      #wrapper {
            display : grid;
            max-width: 960px;
            position: relative;
            margin: 0 auto;
            grid-template-rows: 420px auto auto;
            grid-template-columns: 1fr;
        }

        #buttons {
          display: flex;
          justify-content: center;
          padding: 16px;
        }
        #video-wrapper {
           height: 100%;
           position: relative; /* magic sauce II */
        }
        #video {
              width: 100%;
              height: 100%;
              object-fit: cover;
              position: absolute;
        }

        #results {
            width: 100%;
        }

    `;
    constructor() {
        super();
        this.results = [];
        this.canvas = new OffscreenCanvas(1,1);
    }

    render() {
        return ("BarcodeDetector"in window) ? html`
                <div id="wrapper">
                    <div id="video-wrapper">
                      <video id="video"></video>
                    </div>
                    <div id="buttons">
                        ${!this.scanning ? html`<button @click="${this.scan}">⏺ Start Scanning</button>` : html`<button @click="${this.stop}">⛔ Stop </button>`}
                    </div>
                    <ul id="results">${this.results.map(result=>html`<li>${result}</li>`)}
                </div>
            ` : html`😭 Your browser doesn't support the barcode api`;
    }

    async scan() {
        this.scanning = true;
        // check supported types
        const formats = await BarcodeDetector.getSupportedFormats();
        const barcodeDetector = new BarcodeDetector({
            formats
        });

        this.stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {
                    ideal: 'environment'
                },
                width: {
                    min: 1024,
                    ideal: 1280,
                    max: 1920
                },
                height: {
                    min: 576,
                    ideal: 720,
                    max: 1080
                }

            },
            audio: false
        });

        const videoTrack = this.stream.getVideoTracks()[0];
        const {width, height} = videoTrack.getSettings();
        this.canvas.width = width;
        this.canvas.height = height;

        const trackProcessor = new MediaStreamTrackProcessor({
            track: videoTrack
        });
        const trackGenerator = new MediaStreamTrackGenerator({
            kind: "video"
        });
        const that = this;
        const transformer = new TransformStream({
            async transform(inputFrame, controller) {
                try {
                    const image = await createImageBitmap(inputFrame);
                    const barcodes = await barcodeDetector.detect(image);
                    let outputFrame;
                    if (barcodes.length) {
                        that.addResults(barcodes);
                        outputFrame = await that.highlightBarcodes(image, inputFrame.timestamp, barcodes);
                        inputFrame.close();
                    } else {
                        outputFrame = inputFrame;
                    }
                    controller.enqueue(outputFrame);
                } catch (e) {
                    alert(e.message)
                }
            },
            flush(controller) {
                controller.terminate();
            }
        });

        this.outputStream = new MediaStream();
        this.outputStream.addTrack(trackGenerator);
        // currentProcessedStream = processedStream;
        trackProcessor.readable.pipeThrough(transformer).pipeTo(trackGenerator.writable);
        this.video.addEventListener('loadedmetadata', ()=>{
                this.video.play()
            }
        )
        this.video.srcObject = this.outputStream;

    }

    addResults(results) {
        this.results.push(...results.map(result=>result.rawValue));
        this.results = [...new Set(this.results)];
        this.requestUpdate('results');
    }

    async highlightBarcodes(bitmap, timestamp, barcodes) {
        const ctx = this.canvas.getContext('2d');
        const floor = Math.floor;
        ctx.drawImage(bitmap, 0, 0, this.canvas.width, this.canvas.height);
        bitmap.close();
        barcodes.map(barcode=>{
                const {x, y, width, height} = barcode.boundingBox;
                ctx.strokeRect(floor(x), floor(y), floor(width), floor(height));
                const text = barcode.rawValue;
                const dimensions = ctx.measureText(text);
                ctx.fillText(text, floor(x + width / 2 - dimensions.width / 2), floor(y) + height + 20);
            }
        );
        const newBitmap = await createImageBitmap(this.canvas);
        return new VideoFrame(newBitmap,{
            timestamp
        });
    }

    stop() {
        this.stream.getVideoTracks().forEach(track=>track.stop());
        this.outputStream.getVideoTracks().forEach(track=>track.stop());
        this.scanning = false;
        this.video.stop();
    }

}

customElements.define('tc-barcode-detector', BarcodeDetectorElement);
