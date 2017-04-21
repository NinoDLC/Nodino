const GAME_WIDTH = 800;
const SPAWNING_ZONE_MARGIN = 150;
const SERVER_TICK = 60;

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
    }).on('up', function (data) {
        onUpdate(socket.id, data);
    });
});

function onPlayerConnected(io, socket) {
    console.log("Client has connected! id = [" + socket.id + "]");

    // Randomize its X spawning position (on a scale from 0 to 800)
    var xSpawn = Math.floor(Math.min(Math.max(SPAWNING_ZONE_MARGIN, Math.random() * GAME_WIDTH), GAME_WIDTH - SPAWNING_ZONE_MARGIN));
    // Randomize its color
    var playerColor = consts.getPlayerColor();

    playerList.push({
        id: socket.id,
        xPos: xSpawn,
        yPos: SPAWNING_ZONE_MARGIN,
        xVelocity: 0,
        yVelocity: 0,
        rotation: 0,
        maxSpeed: 0,
        playerColor: playerColor
    });

    startServerTick();

    // socket.broadcast.emit = everyone but him
    // io.sockets.emit = everyone and him
    // socket.emit = just him
    io.sockets.emit('player_connected', socket.id);
}

function onUpdate(id, data) {
    for (var i = 0; i < playerList.length; i++) {
        var playerInfo = playerList[i];

        if (playerInfo.id === id) {
            playerInfo.xPos = data.xPos;
            playerInfo.yPos = data.yPos;
            playerInfo.xVelocity = data.xVelocity;
            playerInfo.yVelocity = data.yVelocity;
            playerInfo.rotation = data.rotation;
            playerInfo.maxSpeed = data.maxSpeed;
        }
    }
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
        stopServerTick();
    }
}

var serverTick;
var serverStarted;

function startServerTick() {
    if (!serverStarted) {
        serverStarted = true;

        serverTick = setInterval(onServerTick, 1000 / SERVER_TICK);
    }
}

function onServerTick() {
    io.sockets.emit('down', playerList);
}

function stopServerTick() {
    serverStarted = false;

    clearInterval(serverTick);
}
