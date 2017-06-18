import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { Signal } from '../../../server/signal';

import { WebsocketService } from '../websocket.service';
import { SoundService } from '../sound.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.css']
})
export class ControlComponent implements OnInit, OnDestroy {
  private _video: HTMLVideoElement;
  @Input()
  set video(video: HTMLVideoElement) {
    this._video = video;
  }
  get video(): HTMLVideoElement {
    return this._video;
  }

  connection;
  sounds: string[];
  playState = 'paused';

  constructor(
    private websocketService: WebsocketService,
    private soundService: SoundService
  ) {
  }

  ngOnInit() {
    this.connection = this.websocketService.getSignals().subscribe((signal: Signal) => {
      this.handleSignal(signal);
    })
    this.soundService.getSounds().then(sounds => this.sounds = sounds);
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  handleSignal(signal: Signal) {
    console.log('received signal:\n\t' + JSON.stringify(signal));
    if (signal.type === 'play') {
      this.playState = signal.data.state;
    } else if (signal.type === 'ping') {
      this.websocketService.sendSignal(new Signal('pong', signal.data));
    }
  }

  isMuted(): boolean {
    return this.video.muted;
  }

  onMuteToggle(): void {
    this.video.muted = !this.video.muted;
  }

  onClickPlay() {
    let time;
    if (this._video) {
      time = this._video.currentTime;
    }
    this.websocketService.sendSignal(new Signal('play', time));
  }

  onSelectSound(sound, index) {
    console.log(sound);
    this.websocketService.sendSignal(new Signal('sound', index.toString()));
  }

  onSkipForward() {
    this.websocketService.sendSignal(new Signal('skip', 'forward'));
  }

  onSkipBackward() {
    this.websocketService.sendSignal(new Signal('skip', 'backward'));
  }
}
