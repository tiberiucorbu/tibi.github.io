import { LitElement, html, css } from 'lit';

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

function processStream(stream, mediaSource) {
    const mediaRecorder = new MediaRecorder(stream)
    const videoBuffer = mediaSource.addSourceBuffer('video/webm;codecs=vp8');

    mediaRecorder.ondataavailable = (data) => {
        let fileReader = new FileReader();
        let arrayBuffer;

        fileReader.onloadend = () => {
            arrayBuffer = fileReader.result;
            videoBuffer.appendBuffer(arrayBuffer)
        }
        fileReader.readAsArrayBuffer(data.data);


    }
    mediaRecorder.start()

    setInterval(() => {
        mediaRecorder.requestData()
    }, 1000)
}



export class Share extends LitElement {
    static properties = {
        text: { state: true },
        recording: {state: true}
    };
    static styles = css``

    render() {
        return html`
            <video></video>
            <button @click="${this.record}">Record Screen</button>
        `
    }
  
   async record() {
      const video = this.shadowRoot.querySelector('video');
      const mediaSource = new MediaSource();
      video.src = URL.createObjectURL(mediaSource);
      const stream = await startCapture({});
      processStream(stream. mediaSource);
   }
}
customElements.define('tc-share', Share);
