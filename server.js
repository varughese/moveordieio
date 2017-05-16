var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));


io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
    

server.listen(process.env.PORT || 8080,function(){ // Listens to port 8081
    console.log('Listening on '+server.address().port);
});