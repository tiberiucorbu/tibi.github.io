import { LitElement, html, css } from 'lit';




let chunks = [];
let mediaRecorder;

const startRecord = async (videoElement) => {
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

  const mediaStream = await startCapture({});
  videoElement.srcObject = mediaStream;
  mediaRecorder = new MediaRecorder(mediaStream, options);

  setListeners();

  mediaRecorder.start(1000);
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

const setListeners = () => {
  mediaRecorder.ondataavailable = handleOnDataAvailable;
  mediaRecorder.onstop = handleOnStop;
};

const handleOnStop = () => {
  saveFile();

  destroyListeners();
  mediaRecorder = undefined;
};

const destroyListeners = () => {
  mediaRecorder.ondataavailable = undefined;
  mediaRecorder.onstop = undefined;
};

const handleOnDataAvailable = ({ data }) => {
  if (data.size > 0) {
    chunks.push(data);
  }
};

const saveFile = () => {
  const blob = new Blob(chunks);

  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.style = 'display: none';
  link.href = blobUrl;
  link.download = 'recorded_file.webm';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(blobUrl);
  chunks = [];
};



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




async function  selectFile() {
                const folderHandle = await window.showDirectoryPicker();
                const fileHandle = await folderHandle.getFileHandle(`video.webm`, {create: true});
                    
                const writableStream = await fileHandle.createWritable();

                    // write our file
                return writableStream;
       
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
     startRecord(this.shadowRoot.querySelector('video'));
   }
}
customElements.define('tc-share', Share);
