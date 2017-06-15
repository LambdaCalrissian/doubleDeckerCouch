export class Signal {
    constructor(
        public type: 'play' | 'fullscreen' | 'skip' | 'sound',
        public data: string
    ) {}
}
