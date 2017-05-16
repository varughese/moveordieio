var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

var players = {};

var colors = ['blue', 'yellow', 'green', 'pink'];
var positions = [{
        x: 260,
        y: 100
    },
    {
        x: 1320,
        y: 100
    },
    {
        x: 1100,
        y: 650
    },
    {
        x: 525,
        y: 650
    }
];

io.on('connection', function (socket) {
    console.log('USER CONNECTED', socket.id);
    var clientCount = Object.keys(players).length;
    players[socket.id] = {
        id: socket.id,
        color: colors[clientCount],
        x: positions[clientCount].x,
        y: positions[clientCount].y
    };

    console.log(Object.keys(players).length + " PLAYERS!");
    io.emit("new_player", players);

    socket.on('disconnect', function () {
        console.log('USER DISCONNECTED', socket.id);
        delete players[socket.id];
        console.log(Object.keys(players).length + " PLAYERS!");
        io.emit("lost_player", socket.id);
    });

    socket.on("tile jawn", function (tile) {
        console.log("jawn", tile);
    });
});


server.listen(process.env.PORT || 8080, function () { // Listens to port 8081
    console.log('Listening on ' + server.address().port);
});