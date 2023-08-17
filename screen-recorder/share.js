/*
Copyright <YEAR> <COPYRIGHT HOLDER>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


import { LitElement, html, css } from 'lit';

let mediaRecorder;

const startRecord = async (videoElement, writableStream) => {
    const mimeType = 'video/webm;codecs=vp8,opus';

    if (!MediaRecorder.isTypeSupported(mimeType)) {
        alert('vp8/opus mime type is not supported');
        return;
    }

    const options = {
        audioBitsPerSecond: 128000,
        mimeType,
        videoBitsPerSecond: 2500000
    }

    const mediaStream = await startCapture({audio: {ideal : true}});
    const oneOfTheTrackEnded = Promise.race(mediaStream.getTracks().map(track => new Promise(res => track.onended = res)));
    videoElement.srcObject = mediaStream;
    videoElement.play();
    mediaRecorder = new MediaRecorder(mediaStream, options);

    const result = setListeners(writableStream);

    mediaRecorder.start(1000);

    return Promise.race([result, oneOfTheTrackEnded]);
};

const stopRecord = async () => {
    if (!mediaRecorder) return;

    mediaRecorder.stop();

};

const getLocalMediaStream = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = mediaStream;

    return mediaStream;
};

const setListeners = (writableStream) => {
    mediaRecorder.ondataavailable = (data)=>handleOnDataAvailable(data, writableStream);
    return new Promise((res, rej)=>{
        mediaRecorder.onstop = ()=> handleOnStop(res, writableStream);
    })

};

const handleOnStop = (res, writableStream) => {
    // saveFile(res);
    destroyListeners();
    mediaRecorder = undefined;
    writableStream.close();
};

const destroyListeners = () => {
    mediaRecorder.ondataavailable = undefined;
    mediaRecorder.onstop = undefined;
};

const handleOnDataAvailable = ({ data }, writableStream) => {
    console.log('Writing Received Chunk', data);
    if (data.size > 0) {
        writableStream.write(data);
    }
};

// const saveFile = (res) => {
//   console.log('creating blob')
//   const blob = new Blob(chunks, {type: "video/webm"});
//   res(blob);

//   // const link = document.createElement('a');

//   // link.style = 'display: none';
//   // link.href = blobUrl;
//   // link.download = 'recorded_file.webm';

//   // document.body.appendChild(link);
//   // link.click();
//   // document.body.removeChild(link);

//   // window.URL.revokeObjectURL(blobUrl);
//   chunks = [];
// };



async function startCapture(displayMediaOptions) {
    let captureStream;

    try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(
            displayMediaOptions
        );
    } catch (err) {
        console.error(`Error: ${err}`);
    }
    return captureStream;
}


let folderHandle;

async function selectFile(time) {
    if (!folderHandle){
        folderHandle = await window.showDirectoryPicker();
    }
    const fileHandle = await folderHandle.getFileHandle(`${time}_recording.webm`, {create: true});
    const writableStream = await fileHandle.createWritable();
    return {writableStream, fileHandle};
}


export class Share extends LitElement {
    static properties = {
        text: { state: true },
        recording: {state: true},
        files : {state: true}
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

        #video {
         -width: 100%;
        }

    `
    constructor(){
        super();
        this.files = [];
    }

    render() {
        return html`
            <div id="wrapper">
                <video id="video" controls muted></video>
                <div id="buttons">
                  <button ?disable=${this.recording} @click="${this.record}">⏺ Start Recording</button>
                </div>
            </div>
           
        `

        // <ul>${this.files.map(item => html`<li><a href=${item.url} download="${item.startTime} recording.webm">Save ${item.startTime} recording.webm</a></li>`)}</ul>
    }

    async record() {
        const time = Date.now();
        const {writableStream, fileHandle} = await selectFile(time);
        this.writableStream = writableStream;
        this.fileHandle = fileHandle;
        await startRecord(this.shadowRoot.querySelector('video'), writableStream);
        await this.closeFile();
    }

    async closeFile (){
        if (this.writableStream){
            await this.writableStream.close();
            console.log(folderHandle, this.fileHandle);
            alert(`File ${this.fileHandle.name} added to ${folderHandle.name}`)
        }
    }
}
customElements.define('tc-share', Share);
