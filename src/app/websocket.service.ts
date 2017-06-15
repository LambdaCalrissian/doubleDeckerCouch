import { Injectable } from '@angular/core';
import { HttpModule } from '@angular/http';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

import 'rxjs/add/operator/toPromise';

import { Signal } from '../../server/signal';

@Injectable()
export class WebsocketService {
  private socket;

  constructor() {
  }

  sendSignal(signal: Signal) {
    this.socket.emit('signal', signal);
  }

  getSignals() {
    return new Observable(observer => {
      this.socket = io.connect();
      this.socket.on('signal', (data: Signal) => {
        observer.next(data);
      })
      return () => {
        this.socket.disconnect();
      };
    })
  }
}
