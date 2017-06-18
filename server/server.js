"use strict";
exports.__esModule = true;
var http = require("http");
var express = require("express");
var range = require("express-range");
var sockets = require("socket.io");
var fs = require("fs");
var path = require("path");
var morgan = require("morgan");
var statCache = {};
var soundCache = [];
var signal_1 = require("./signal");
var app = express();
app.use(range());
app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, '../assets')));
console.log(__dirname);
function loadSounds() {
    fs.readdir(path.join(__dirname, '../assets/sounds'), function (err, files) {
        if (err) {
            return console.error(err);
        }
        soundCache = files;
    });
}
loadSounds();
app.get('/api/sounds', function (request, response) {
    response.json(soundCache);
});
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});
var port = '3000';
app.set('port', port);
var server = http.createServer(app);
server.listen(port, function () { return console.log("API running on localhost:" + port); });
var io = sockets(server);
var playState = 'paused';
var pingMap = new Map();
io.on('connection', function (socket) {
    // Every time someone connects, recheck everyone's ping
    console.log('connected:\n\t' + socket.id);
    // emitPing();
    socket.emit('signal', new signal_1.Signal('play', { state: playState }));
    socket.on('signal', function (signal) {
        console.log('socket received signal:\n\t' + JSON.stringify(signal));
        if (signal.type === 'play') {
            var time = signal.data;
            if (playState === 'paused') {
                playState = 'playing';
            }
            else {
                playState = 'paused';
            }
            signal.data = { state: playState, time: time };
        }
        else if (signal.type === 'pong') {
            var id = socket.id;
            console.log('ponged');
            var ping = Date.now() - signal.data;
            pingMap.set(id, ping);
            console.log('pingMap:');
            pingMap.forEach(function (item) {
                console.log('\n\t' + item);
            });
            console.log('pingMap.size:\n\t' + pingMap.size);
        }
        io.emit('signal', signal);
    });
    socket.on('disconnect', function () {
        console.log('Deleting socket:\n\t' + socket.id);
        pingMap["delete"](socket.id);
    });
});
var emitPing = function () {
    console.log('pinging');
    io.emit('signal', new signal_1.Signal('ping', Date.now()));
};
