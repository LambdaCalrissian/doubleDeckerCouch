import http = require('http');
import express = require('express');
import range = require('express-range');
import sockets = require('socket.io')
import fs = require('fs');
import path = require('path');
import mime = require('mime');
import morgan = require('morgan');

const statCache: any = {};
let soundCache: String[] = [];

import { Signal } from './signal';

const app = express();

app.use(range());
app.use(morgan('tiny'));

app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, '../assets')));

function loadSounds() {
    fs.readdir(path.join(__dirname, '../assets/sounds'), (err, files) => {
        if (err) {
            return console.error(err);
        }
        soundCache = files;
    })
}
loadSounds();

app.get('/api/sounds', (request, response) => {
    response.json(soundCache);
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
})

const port = '3000';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => console.log(`API running on localhost:${port}`));

const io = sockets(server);

let playState = 'paused';
const clients = [];
let maxPing = 0;

io.on('connection', (socket) => {
    // Every time someone connects, recheck everyone's ping
    console.log('connected:\n\t' + socket.id);
    clients.push(socket);
    emitPing();

    // Pause everyone
    playState = 'paused';
    socket.emit('signal', new Signal('play', { state: playState }));
    socket.broadcast.emit('signal', new Signal('getTime', {}));

    socket.on('signal', (signal: Signal) => {
        console.log('socket received signal:\n\t')
        console.log(`\t${socket.id}\t${JSON.stringify(signal)}`);

        const index = clients.findIndex(client => client.id === socket.id);

        // if (signal.type === 'play') {
        switch (signal.type) {
            case 'play':
                const time = signal.data;
                if (playState === 'paused') {
                    // Make sure everyone is fully buffered before telling everyone to play
                    if (clients.every(client => !client.watching || client.buffered)) {
                        playState = 'playing';
                    }
                } else {
                    emitPing();
                    playState = 'paused';
                }
                clients.forEach((client) => {
                    const delay = (maxPing - client.ping) / 2;
                    signal.data = { state: playState, time: time, delay: delay };
                    client.emit('signal', signal);
                })
                return;
            case 'pong':
                console.log('ponged');
                const ping = Date.now() - signal.data;
                clients[index].ping = ping;
                logClients();
                maxPing = clients.reduce((max, current) => {
                    return max > current.ping ? max : current.ping;
                }, 0);
                console.log(`maxPing:\n\t${maxPing}`);
                return;
            case 'buffered':
                clients[index].buffered = true;
                logClients();
                return;
            case 'skip':
                clearBufferTags();
                io.emit('signal', signal);
                return;
            case 'getTime':
                io.emit('signal', new Signal('play', { state: 'paused', time: signal.data }));
                return;
            case 'watching':
                if (signal.data) {
                    socket.broadcast.emit('signal', new Signal('getTime', {}));
                }
                clients[index].watching = signal.data;
                return;
            case 'sound':
                io.emit('signal', signal);
                return;
        }

    });
    socket.on('disconnect', () => {
        const index = clients.findIndex(client => client.id === socket.id);
        if (index !== -1) {
            console.log('Deleting socket:\n\t' + socket.id);
            clients.splice(index, 1);
        }
    });
});

const emitPing = () => {
    console.log('pinging');
    io.emit('signal', new Signal('ping', Date.now()));
}

const logClients = () => {
    console.log('clients:');
    console.log('\tid\t\t\tping\tbuffered\twatching');
    clients.forEach(client => console.log(`\t${client.id}\t${client.ping}\t${client.buffered}\t${client.watching}`));
}

const clearBufferTags = () => {
    clients.map(client => client.buffered = false);
}
