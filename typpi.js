/**********************
 *                    *
 *      typpi.js      *
 *                    *
 **********************/

// Requirements
// =============================================================================
var http = require('http');
var express = require('express');
var jade = require('jade');



// Setup
// =============================================================================
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", {layout: false});

// Routing
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res)
{
    res.render('typpi.jade');
});

server.listen(port);


// Connection
// =============================================================================
io.sockets.on('connection', function(socket)
{    
    socket.on('setUsername', function(data)
    {
        socket.username = data;
    });

    socket.on('sendMessage', function(message)
    {
        var data = {message: message,
                    username : socket.username};
        socket.broadcast.emit('message', data);
        console.log(data.username + ": " + data.message);
    });
});