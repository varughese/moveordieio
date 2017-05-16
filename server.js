var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

var players = [];

var colors = ['blue', 'yellow', 'green', 'pink'];

io.on('connection', function(socket){
  console.log('USER CONNECTED', socket.id);
  players[players.length] = { id: socket.id, color: colors[players.length] };

  console.log(players.length + " PLAYERS!");
  io.emit("new_player", players[players.length-1]);
  socket.on('disconnect', function(){
    console.log('USER DISCONNECTED', socket.id);
    var ndx = 0;
    for(var i=0; i<players.length; i++) {
        if(players[i].id == socket.id) {
            ndx = i;
            break;
        }
    }
    players.splice(ndx, 1);
      console.log(players.length + " PLAYERS!");
  });

  socket.on("tile jawn", function(tile) {
    console.log("jawn", tile);
  });
});
    

server.listen(process.env.PORT || 8080,function(){ // Listens to port 8081
    console.log('Listening on '+server.address().port);
});