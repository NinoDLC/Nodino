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

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log("Un client est connecté ! id = [" + socket.id + "]");

    // When this user emits, client side: socket.emit('otherevent',some data);
    socket.on('mouse',
        function (data) {
            // Data comes in as whatever was sent, including objects
            console.log("Received: 'mouse' " + data.x + " " + data.y);

            // Send it to all other clients
            socket.broadcast.emit('mouse', data);

            // This is a way to send to everyone including sender
            // io.sockets.emit('message', "this goes to everyone");

        }
    );
    socket.on('disconnect', function () {
        console.log("Client has disconnected! id = [" + socket.id + "]");
    })
});