type MicrophoneManagerCallback = (data: string | ArrayBuffer) => void;

export class MicrophoneManager {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private isRecording: boolean = false;
  private isContinue: boolean = false;
  private readonly callback: MicrophoneManagerCallback;
  private readonly segmentTimeout: number;
  private reader: FileReader;

  constructor(callback: MicrophoneManagerCallback, segmentTimeout = 500) {
    this.callback = callback;
    this.segmentTimeout = segmentTimeout;
    this.reader = new FileReader();
  }

  async initialize() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm',
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.reader.readAsDataURL(event.data);
          this.reader.onloadend = () => {
            this.callback(this.reader.result);
          };
        }
      };

      this.mediaRecorder.onstop = () => {
        if (this.isContinue) {
          this.startRecordingSegment();
        } else {
          this.stopAllTracks();
        }
      };
    } catch (err) {
      console.error('Error initializing media recorder', err);
    }
  }

  private stopAllTracks() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
  }

  private startRecordingSegment() {
    if (this.mediaRecorder) {
      this.mediaRecorder.start();
      setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
      }, this.segmentTimeout);
    }
  }

  async startRecording() {
    await this.initialize();
    this.isRecording = true;
    this.isContinue = true;
    this.startRecordingSegment();
  }

  stopRecording() {
    this.isRecording = false;
    this.isContinue = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  destroy() {
    this.stopRecording();
    this.mediaRecorder = null;
    this.stopAllTracks();
    this.stream = null;
  }
}
