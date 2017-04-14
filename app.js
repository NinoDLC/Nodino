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
    console.log("Client has connected! id = [" + socket.id + "]");

    // socket.broadcast.emit = everyone but him
    // io.sockets.emit = everyone and him
    io.sockets.emit('player_connected', socket.id);

    socket.on('disconnect', function () {
        onPlayerDisconnected(io, socket.id);
    }).on('player_moved', function (data) {
        onPlayerMoved(io, socket.id, data);
    });
});

function onPlayerDisconnected(io, socketId) {
    io.sockets.emit('player_disconnected', socketId);

    console.log("Client has disconnected! id = [" + socketId + "]");
}

function onPlayerMoved(io, socketId, data) {
    io.sockets.emit('player_moved', {id: socketId, key: data});
}