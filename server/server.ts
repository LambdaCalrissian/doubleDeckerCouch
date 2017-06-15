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

io.on('connection', (socket) => {
    socket.emit('signal', new Signal('play', playState));
    socket.on('signal', (ev: Signal) => {
        console.log('socket received signal: ' + ev.type);

        if (ev.type === 'play') {
            if (playState === 'paused') {
                playState = 'playing';
            } else {
                playState = 'paused';
            }
            ev.data = playState;
        }
        io.emit('signal', ev);
    });
});

// function serveStatic(response: http.ServerResponse, cache: any, absPath: string) {
//     if (cache[absPath]) {
//         sendFile(response, absPath, cache[absPath]);
//     } else {
//         fs.exists(absPath, function (exists) {
//             if (exists) {
//                 fs.readFile(absPath, function (err, data) {
//                     if (err) {
//                         send404(response);
//                     } else {
//                         cache[absPath] = data;
//                         sendFile(response, absPath, data);
//                     }
//                 });
//             } else {
//                 send404(response);
//             }
//         });
//     }
// }

// function initServer(request: http.IncomingMessage, response: http.ServerResponse) {
//     console.log(request.url);
//     let filePath = '';

//     if (request.url === '/api/getSounds') {
//         response.writeHead(200, { 'Content-Type': 'application/json' });
//         response.write(JSON.stringify(soundCache));
//         response.end();
//         return;
//     } else if (request.url === '/') {
//         filePath = './dist/index.html';
//     } else {
//         filePath = './dist/index.html';
//     }
//     const absPath = filePath;
//     console.log(absPath);

//     fs.exists(absPath, function (exists) {
//         if (exists) {
//             let stat;
//             if (statCache[absPath]) {
//                 stat = statCache[absPath];
//             } else {
//                 stat = fs.statSync(absPath);
//                 statCache[absPath] = stat;
//             }
//             const total = stat.size;

//             if (request.headers['range']) {
//                 const range = request.headers.range;
//                 const parts = range.replace(/bytes=/, '').split('-');
//                 const partialstart = parts[0];
//                 const partialend = parts[1];

//                 const start = parseInt(partialstart, 10);
//                 const end = partialend ? parseInt(partialend, 10) : total - 1;
//                 const chunksize = (end - start) + 1;
//                 console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

//                 const file = fs.createReadStream(absPath, { start: start, end: end });
//                 response.writeHead(206, {
//                     'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
//                     'Accept-Ranges': 'bytes',
//                     'Content-Length': chunksize,
//                     'Content-Type': 'video/mp4'
//                 });
//                 file.pipe(response);
//             } else {

//                 fs.readFile(absPath, function (err, data) {
//                     if (err) {
//                         send404(response);
//                     } else {
//                         sendFile(response, absPath, data);
//                     }
//                 });
//             }
//         } else {
//             send404(response);
//         }
//     });
// };

// server.listen(7777, () => {
//     console.log('Server is listening on port 7777');
// });

