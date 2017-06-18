export class Signal {
    constructor(
        public type: 'play' | 'fullscreen' | 'skip' | 'sound' | 'ping' | 'pong',
        public data: any,
    ) {}
}
