'use  strict';

function createSignalingService(localPeerId, coordinator, config) {
    return new EventStreamSignalingService(localPeerId, coordinator, config);
}


export class EventStreamSignalingService {

    constructor(localPeerId, coordinator, config) {
        this.config = config;
        this.coordinator = coordinator;
        this.localPeerId = localPeerId;
    }

    async connect() {
        this.eventSource = new EventSource(`${this.config.signalingEndpoint}/signaling-events/${this.localPeerId}`);
        const result = new Promise(res => {
            this.eventSource.onopen = () => res()
        });
        this.eventSource.addEventListener('peer-joined', (event) => {
            this.coordinator.initiatePeerConnection(JSON.parse(event.data).peerId);
        });

        this.eventSource.addEventListener('answer', (event) => {
            this.coordinator.handleAnswer(JSON.parse(event.data));
        });

        this.eventSource.addEventListener('offer', (event) => {
            this.coordinator.handleOffer(JSON.parse(event.data));
        });


        this.eventSource.addEventListener('candidate', (event) => {
            this.coordinator.handleCandidate(JSON.parse(event.data));
        });
        return result;
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
        }
    }

    async signal(remotePeerId, data) {
        const url = `${this.config.signalingEndpoint}/signal/${remotePeerId}`;
        await fetch(url, {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        })
    }
}


export class PeerConnectionCoordinator {

    constructor(config) {
        this.config = config;
        this.pc = null;
    }

    async start(localPeerId, remotePeerId) {
        this.localPeerId = localPeerId;
        this.signalingService = createSignalingService(localPeerId, this, this.config);
        await this.signalingService.connect();
        if (remotePeerId) {
            this.remotePeerId = remotePeerId;
            await this.signalingService.signal(remotePeerId, {type: 'peer-joined', data: {peerId: localPeerId}});
        }
        return new Promise((res) => {
            this.resolveDataChannel = res;
        });
    }

    async hangup(remotePeerId) {
        if (this.pc) {
            this.pc.close();
            this.pc = null;
        }
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
        await this.signalingService.signal(this.remotePeerId, {type: 'bye'});
        // startButton.disabled = false;
        // hangupButton.disabled = true;
    }

    createPeerConnection() {
        this.pc = new RTCPeerConnection();
        this.pc.onicecandidate = async e => {
            const message = {
                type: 'candidate',
                candidate: null,
            };
            if (e.candidate) {
                message.candidate = e.candidate.candidate;
                message.sdpMid = e.candidate.sdpMid;
                message.sdpMLineIndex = e.candidate.sdpMLineIndex;
            }
            await this.signalingService.signal(this.remotePeerId, {type: 'candidate', data: message});
            this.pc.addEventListener("connectionstatechange", (event) => {
                if (this.pc.connectionState === 'connected') {
                    this.signalingService.disconnect();
                }
            });
        };


        // this.pc.ontrack = e => remoteVideo.srcObject = e.streams[0];
        // localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    // async peerConnected() {
    //     return new Promise((res) => {
    //         this.pc.addEventListener("connectionstatechange", (event) => {
    //             if (this.pc.connectionState === 'connected') {
    //                 res();
    //             }
    //         });
    //     })
    // }

    async initiatePeerConnection(remotePeerId) {
        this.remotePeerId = remotePeerId;
        await this.createPeerConnection(remotePeerId);
        this.dataChannel = this.pc.createDataChannel("data");
        this.dataChannel.onopen = () => {
            this.resolveDataChannel(this.dataChannel)
        }
        const offer = await this.pc.createOffer();
        await this.signalingService.signal(this.remotePeerId, {type: 'offer', data: offer});
        await this.pc.setLocalDescription(offer);
    }


    async handleOffer(offer) {
        if (this.pc) {
            console.error('existing peerconnection');
            return;
        }
        if (!this.remotePeerId) {
            console.error('unable to make offer remote peer is not yet set')
            return;
        }
        await this.createPeerConnection(this.remotePeerId);
        this.pc.addEventListener("datachannel", (event) => {
            this.resolveDataChannel(event.channel)
        });
        await this.pc.setRemoteDescription(offer);

        const answer = await this.pc.createAnswer();
        await this.signalingService.signal(this.remotePeerId, {type: 'answer', data: answer});

        await this.pc.setLocalDescription(answer);
    }

    async handleAnswer(answer) {
        if (!this.pc) {
            console.error('no peerconnection');
            return;
        }
        await this.pc.setRemoteDescription(answer);
    }

    async handleCandidate(candidate) {
        if (!this.pc) {
            console.error('no peerconnection');
            return;
        }
        if (!candidate.candidate) {
            await this.pc.addIceCandidate(null);
        } else {
            await this.pc.addIceCandidate(candidate);
        }
    }

}
