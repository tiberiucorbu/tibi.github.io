/*
Copyright 2023 Tiberiu CORBU

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import {css, html, LitElement} from 'lit';
import '/website-commons/js/share-button.js'
import '/website-commons/js/copy-button.js'

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
        },
        videoTrack: {
            state: true
        },
        selectedCameraId: {
            state: true
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

    async willUpdate(changedProperties) {
        super.update(changedProperties);
        if (changedProperties.has('selectedCameraId')) {
            if (this.scanning) {
                await this.stop();
                await this.scan();
            }
        }
    }

    constructor() {
        super();
        this.results = [];
        this.canvas = new OffscreenCanvas(1, 1);
        this.addEventListener('camera-selected', (e) => {
                console.log(e);
                this.selectedCameraId = e.detail.deviceId;
            }
        )
    }

    render() {
        return /* ("BarcodeDetector" in window)  ? */ html`
            <div id="wrapper">
                <div id="video-wrapper">
                    <video id="video"></video>

                </div>
                <tc-video-track-settings .track=${this.videoTrack}></tc-video-track-settings>

                <tc-camera-selector
                        selected-camera-id="${this.videoTrack?.getSettings()?.deviceId}"></tc-camera-selector>
                <div id="buttons">
                    ${!this.scanning ? html`
                        <button @click="${this.scan}">⏺ Start Scanning</button>` : html`
                        <button @click="${this.stop}">⛔ Stop</button>`}
                </div>
                <ul id="results">${(this.renderResults())}</ul>
            </div>
        ` /*: html`😭 Your browser doesn't support the barcode api`*/;
    }

    renderResults() {
        return this.results.map(result => this.renterResultItem(result));
    }

    renterResultItem(result) {
        let url = null;
        try {
            url = new URL(result);
        } catch (e) {
            console.warn(`${result} is not an url ${e}`)
        }

        return html`
            <li>
                ${url ? `<a href=${url.toString()}>result</a>` : result}
                <tc-copy .value="${result}"
                         .toastTitle="Copied ${result} to clipboard">
                    <button hint="Copy to clipboard">✂ Copy</button>
                </tc-copy>
                <tc-share
                        .text=${result} .url=${url?.toString()} .title=${`Share ${result} to ... `}>
                    <button hint="Share">⬆ Share</button>
                </tc-share>
            </li>
        `;
    }

    getVideoQuery() {
        if (this.selectedCameraId) {
            return {
                deviceId: this.selectedCameraId
            }
        } else {
            return {
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

            }
        }
    }

    async scan() {
        this.scanning = true;
        // check supported types
        let barcodeDetector
        if (typeof window.BarcodeDetector !== 'undefined') {

            const formats = await BarcodeDetector.getSupportedFormats();
            let barcodeDetector = new BarcodeDetector({
                formats
            });
        } else {
            const wasmModule = await WebAssembly.instantiateStreaming(fetch('/.wasm'),
                go.importObject);
            const go = new Go();


            WebAssembly.instantiateStreaming(fetch('add.wasm'),
                go.importObject).then((result) => {
                go.run(result.instance);
                console.log("Result:", add(2, 3)); // call the 'add' function defined in the Go program
            });
        }
        if (!barcodeDetector) {
            throw new Error('No barcode detector can be loaded');
        }
        this.stream = await navigator.mediaDevices.getUserMedia({
            video: this.getVideoQuery(),
            audio: false
        });
        console.log(this.stream);

        this.videoTrack = this.stream.getVideoTracks()[0];
        const {width, height} = this.videoTrack.getSettings();
        this.canvas.width = width;
        this.canvas.height = height;

        const trackProcessor = new MediaStreamTrackProcessor({
            track: this.videoTrack
        });
        const trackGenerator = new MediaStreamTrackGenerator({
            kind: "video"
        });
        const that = this;
        const transformer = new TransformStream({
            async transform(inputFrame, controller) {
                let outputFrame = inputFrame;
                try {
                    const image = await createImageBitmap(inputFrame);
                    const barcodes = await barcodeDetector.detect(image);
                    if (barcodes.length) {
                        that.addResults(barcodes);
                        outputFrame = await that.highlightBarcodes(image, inputFrame.timestamp, barcodes);
                        inputFrame.close();
                    }
                } catch (e) {
                    alert(`Detection failed because the following reason : ` + e.message)
                    // reset detetector
                    barcodeDetector = new BarcodeDetector({
                        formats
                    });
                    //this.stop();
                    //this.requestUpdate();
                } finally {
                    controller.enqueue(outputFrame);
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
        this.video.addEventListener('loadedmetadata', () => {
                this.video.play()
            }
        )
        this.video.srcObject = this.outputStream;

    }

    addResults(results) {
        this.results.push(...results.map(result => result.rawValue));
        this.results = [...new Set(this.results)];
        this.requestUpdate('results');
    }

    async highlightBarcodes(bitmap, timestamp, barcodes) {
        const ctx = this.canvas.getContext('2d');
        const floor = Math.floor;
        ctx.drawImage(bitmap, 0, 0, this.canvas.width, this.canvas.height);
        bitmap.close();
        barcodes.map(barcode => {
                const {x, y, width, height} = barcode.boundingBox;
                ctx.strokeRect(floor(x), floor(y), floor(width), floor(height));
                const text = barcode.rawValue;
                const dimensions = ctx.measureText(text);
                ctx.fillText(text, floor(x + width / 2 - dimensions.width / 2), floor(y) + height + 20);
            }
        );
        const newBitmap = await createImageBitmap(this.canvas);
        return new VideoFrame(newBitmap, {
            timestamp
        });
    }

    stop() {
        this.stream.getVideoTracks().forEach(track => track.stop());
        this.outputStream.getVideoTracks().forEach(track => track.stop());
        this.scanning = false;
        this.stream = null;
        this.videoTrack = null;
        try {
            this.video.stop();
        } catch (e) {

        }
    }

}

customElements.define('tc-barcode-detector', BarcodeDetectorElement);

export class VideoTrackSettings extends LitElement {
    static properties = {
        // text: { state: true },
        track: {
            attribute: false,
            type: Object
        }
    };

    static styles = css`
      

    `;

    willUpdate(changedProperties) {
        if (changedProperties.has('track') && this.track) {
            this.settings = this.track.getSettings();
            this.capabilities = this.track.getCapabilities();
            console.log(this.settings, this.capabilities);
        }
    }

    render() {
        return this.track ? html`
            ${this.capabilities.torch ? html`<label for="torch"><input @change="${this.setTorchState}" id="torch"
                                                                       type="checkbox"/>🔦</label> ` : html``}
        ` : html``;

    }

    async setTorchState(e) {
        this.settings.torch = e.currentTarget.checked
        await this.track.applyConstraints({torch: this.settings.torch})
    }

}

customElements.define('tc-video-track-settings', VideoTrackSettings);

export class CameraSelector extends LitElement {
    static properties = {
        // text: { state: true },
        track: {
            attribute: false,
            type: Object
        },
        devices: {
            state: true
        },
        selectedCameraId: {
            type: String,
            attribute: 'selected-camera-id'
        }
    };

    static styles = css`
      

    `;

    async firstUpdated(_changedProperties) {
        this.devices = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === "videoinput");
    }

    render() {
        return html`
            <select @change="${this.selectVideoInput}">
                <option disabled ?selected=${!this.selectedCameraId} value> Pick One...</option>
                ${this.devices ? this.devices.map((mediaDeviceInfo) => this.renderDeviceSelector(mediaDeviceInfo)) : html``}
            </select>
        `
    }

    renderDeviceSelector(mediaDeviceInfo) {
        return html`
            <option ?selected=${this.selectedCameraId === mediaDeviceInfo.deviceId} value="${mediaDeviceInfo.deviceId}">
                🎦 ${mediaDeviceInfo.label}</span>`
    }

    selectVideoInput(changeEvent) {
        const deviceId = changeEvent.currentTarget.value;
        const mediaDeviceInfo = this.devices.find(device => device.deviceId === deviceId)
        const event = new CustomEvent('camera-selected', {
            composed: true,
            bubbles: true,
            detail: mediaDeviceInfo
        });
        this.dispatchEvent(event);

    }
}

customElements.define('tc-camera-selector', CameraSelector);
