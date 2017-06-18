import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { Signal } from '../../../server/signal';

import { WebsocketService } from '../websocket.service';
import { SoundService } from '../sound.service';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.css']
})
export class WatchComponent implements OnInit, OnDestroy, Input {
  private _hideVideo: boolean;
  @Input()
  set hideVideo(hideVideo: boolean) {
    this._hideVideo = hideVideo;
  }
  get hideVideo(): boolean {
    return this._hideVideo;
  }

  connection;
  context: AudioContext;
  soundBuffers: AudioBuffer[];
  video: HTMLVideoElement;

  constructor(
    private websocketService: WebsocketService,
    private soundService: SoundService,
  ) { }

  ngOnInit() {
    // Establish websocket callback for incoming signals
    this.connection = this.websocketService.getSignals().subscribe((signal: Signal) => {
      this.handleSignal(signal);
    })

    // Load all sound files of server into array of audio buffers
    this.context = new AudioContext();
    this.soundService.getSounds().then((sounds) => {
      this.soundBuffers = new Array(sounds.length);
      sounds.forEach((sound, index) => {
        this.loadSound('/sounds/' + sound, this.context, (buffer) => {
          this.soundBuffers[index] = buffer;
        })
      })
    });

    // Grab the video element and set up callbacks for state change
    this.video = document.getElementById('video') as HTMLVideoElement;
  }

  loadSound(url: string, context: AudioContext, callback: (buffer: AudioBuffer) => void) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = () => {
      context.decodeAudioData(request.response, (buffer) => {
        return callback(buffer);
      })
    }
    request.send();
  }

  playSound(buffer: AudioBuffer, context: AudioContext) {
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  handleSignal(signal: Signal) {
    if (signal.type === 'play') {
      if (signal.data.state === 'playing') {
        this.video.play();
      } else {
        this.video.pause();
      }

      if (signal.data.time) {
        this.video.currentTime = signal.data.time;
      }

    } else if (signal.type === 'skip') {
      const paused = this.video.paused;
      if (signal.data === 'forward') {
        this.video.currentTime = this.video.currentTime + 30;
      } else if (signal.data === 'backward') {
        this.video.currentTime = this.video.currentTime - 10;
      }
      if (paused) {
        this.video.pause();
      }
    } else if (signal.type === 'sound') {
      this.playSound(this.soundBuffers[+signal.data], this.context);
    }
  }

  isMobile(): boolean {
    return (typeof window.orientation !== 'undefined');
  }
}
