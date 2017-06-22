import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { HttpModule } from '@angular/http';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

import 'rxjs/add/operator/toPromise';

import { Signal } from '../../server/signal';

@Injectable()
export class WebsocketService implements OnInit, OnDestroy {
  private socket: io.socket;

  constructor() {
    this.socket = io();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }

  sendSignal(signal: Signal) {
    this.socket.emit('signal', signal);
  }

  getSignals() {
    return new Observable(observer => {
      this.socket.on('signal', (data: Signal) => {
        observer.next(data);
      });
      return () => {
        // this.socket.disconnect();
      };
    })
  }
}
