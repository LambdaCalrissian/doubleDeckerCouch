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
var clients = [];
var maxPing = 0;
io.on('connection', function (socket) {
    // Every time someone connects, recheck everyone's ping
    console.log('connected:\n\t' + socket.id);
    clients.push(socket);
    emitPing();
    // Pause everyone
    playState = 'paused';
    socket.emit('signal', new signal_1.Signal('play', { state: playState }));
    socket.broadcast.emit('signal', new signal_1.Signal('getTime', {}));
    socket.on('signal', function (signal) {
        console.log('socket received signal:\n\t');
        console.log("\t" + socket.id + "\t" + JSON.stringify(signal));
        var index = clients.findIndex(function (client) { return client.id === socket.id; });
        // if (signal.type === 'play') {
        switch (signal.type) {
            case 'play':
                var time_1 = signal.data;
                if (playState === 'paused') {
                    // Make sure everyone is fully buffered before telling everyone to play
                    if (clients.every(function (client) { return !client.watching || client.buffered; })) {
                        playState = 'playing';
                    }
                }
                else {
                    emitPing();
                    playState = 'paused';
                }
                clients.forEach(function (client) {
                    var delay = (maxPing - client.ping) / 2;
                    signal.data = { state: playState, time: time_1, delay: delay };
                    client.emit('signal', signal);
                });
                return;
            case 'pong':
                console.log('ponged');
                var ping = Date.now() - signal.data;
                clients[index].ping = ping;
                logClients();
                maxPing = clients.reduce(function (max, current) {
                    return max > current.ping ? max : current.ping;
                }, 0);
                console.log("maxPing:\n\t" + maxPing);
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
                io.emit('signal', new signal_1.Signal('play', { state: 'paused', time: signal.data }));
                return;
            case 'watching':
                if (signal.data) {
                    socket.broadcast.emit('signal', new signal_1.Signal('getTime', {}));
                }
                clients[index].watching = signal.data;
                return;
            case 'sound':
                io.emit('signal', signal);
                return;
        }
    });
    socket.on('disconnect', function () {
        var index = clients.findIndex(function (client) { return client.id === socket.id; });
        if (index !== -1) {
            console.log('Deleting socket:\n\t' + socket.id);
            clients.splice(index, 1);
        }
    });
});
var emitPing = function () {
    console.log('pinging');
    io.emit('signal', new signal_1.Signal('ping', Date.now()));
};
var logClients = function () {
    console.log('clients:');
    console.log('\tid\t\t\tping\tbuffered\twatching');
    clients.forEach(function (client) { return console.log("\t" + client.id + "\t" + client.ping + "\t" + client.buffered + "\t" + client.watching); });
};
var clearBufferTags = function () {
    clients.map(function (client) { return client.buffered = false; });
};
