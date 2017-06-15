import { Component, OnInit, OnDestroy } from '@angular/core';
import * as io from 'socket.io-client';

import { Signal } from '../../../server/signal';

import { WebsocketService } from '../websocket.service';
import { SoundService } from '../sound.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.css']
})
export class ControlComponent implements OnInit, OnDestroy {
  connection;
  sounds: string[];
  playState;

  constructor(
    private websocketService: WebsocketService,
    private soundService: SoundService
  ) {
    this.playState = 'paused';
    this.sounds = [];
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
    console.log('received signal: ' + signal.type);
    if (signal.type === 'play') {
      this.playState = signal.data;
    }
  }

  onClickPlay() {
    this.websocketService.sendSignal(new Signal('play', ''));
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
