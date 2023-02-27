let http = require('http');
require("dotenv").config();
let app = require('./config/app');

let server = http.createServer(app).listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io')(server);
// let IO = require('socket.io').listen(server);
// let socket = socketServer(IO);
var userCount = 0;
var socket = io.on('connection', function(client) {
    userCount++;
    client.emit('broad', { userCount: userCount });
    client.broadcast.emit('broad', { userCount: userCount });
    // socket.emit('request', /* */); // emit an event to the socket
    // io.emit('broadcast', { userCount: userCount }); // emit an event to all connected sockets
    // socket.on('reply', function(){ /* */ }); // listen to the event
    client.on('disconnect', function(discountClient) {
        userCount--;
        client.emit('broad', { userCount: userCount });
        client.broadcast.emit('broad', { userCount: userCount });
        // io.emit('broadcast', { userCount: userCount });
        // socket.emit('request', /* */); // emit an event to the socket
        // io.emit('broadcast', /* */); // emit an event to all connected sockets
        // socket.on('reply', function(){ /* */ }); // listen to the event
    });
});