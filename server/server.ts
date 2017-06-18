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

console.log(__dirname);

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
const pingMap = new Map();

io.on('connection', (socket) => {
    // Every time someone connects, recheck everyone's ping
    console.log('connected:\n\t' + socket.id);
    // emitPing();
    socket.emit('signal', new Signal('play', { state: playState }));

    socket.on('signal', (signal: Signal) => {
        console.log('socket received signal:\n\t' + JSON.stringify(signal));

        if (signal.type === 'play') {
            const time = signal.data;
            if (playState === 'paused') {
                playState = 'playing';
            } else {
                playState = 'paused';
            }
            signal.data = { state: playState, time: time };
        } else if (signal.type === 'pong') {
            const id = socket.id;
            console.log('ponged');
            const ping = Date.now() - signal.data;
            pingMap.set(id, ping);
            console.log('pingMap:');
            pingMap.forEach((item) => {
                console.log('\n\t' + item);
            });
            console.log('pingMap.size:\n\t' + pingMap.size);
        }
        io.emit('signal', signal);
    });
    socket.on('disconnect', () => {
        console.log('Deleting socket:\n\t' + socket.id);
        pingMap.delete(socket.id);
    });
});

const emitPing = () => {
    console.log('pinging');
    io.emit('signal', new Signal('ping', Date.now()));
}
