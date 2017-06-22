export class Signal {
    constructor(
        public type: 'play' |
            'fullscreen' |
            'skip' |
            'sound' |
            'ping' |
            'pong' |
            'buffered' |
            'getTime' |
            'watching',
        public data: any,
    ) { }
}
