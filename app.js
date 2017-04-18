var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// Socket.io stuff
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Consts file
var consts = require('./const');

// Store all players
var playerList = [];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

module.exports = app;

server.listen(8080);

// New player connected !
io.sockets.on('connection', function (socket) {
    onPlayerConnected(io, socket);

    socket.on('disconnect', function () {
        onPlayerDisconnected(io, socket.id);
    }).on('player_moved', function (data) {
        onPlayerMoved(io, socket.id, data);
    });
});

function onPlayerConnected(io, socket) {
    console.log("Client has connected! id = [" + socket.id + "]");

    startServer();

    // Randomize its X appearing position (on a scale from 0 to 1)
    var xSpawn = Math.random();
    // Randomize its color
    var playerColor = consts.getPlayerColor();

    playerList.push(getPlayerObject(socket.id, xSpawn, null, playerColor));

    // socket.broadcast.emit = everyone but him
    // io.sockets.emit = everyone and him
    // socket.emit = just him
    io.sockets.emit('player_connected', socket.id);

    socket.emit('refresh', playerList);
}

function getPlayerObject(id, xPos, yPos, playerColor) {
    return {id: id, xPos: xPos, yPos: yPos, playerColor: playerColor};
}

function onPlayerDisconnected(io, socketId) {
    console.log("Client has disconnected! id = [" + socketId + "]");

    for (var i = 0; i < playerList.length; i++) {
        if (playerList[i].id === socketId) {
            playerList.splice(i, 1);
            break;
        }
    }

    io.sockets.emit('player_disconnected', socketId);

    if (playerList.length === 0) {
        stopServer();
    }
}

function onPlayerMoved(io, socketId, data) {
    io.sockets.emit('player_moved', {id: socketId, key: data});
}

var serverTick;
var serverStarted;

function startServer() {
    if (!serverStarted) {
        serverStarted = true;

        serverTick = setInterval(onServerTick, 100);
    }
}

function onServerTick() {
    io.sockets.emit('refresh', playerList);
}

function stopServer() {
    serverStarted = false;

    clearInterval(serverTick);
}