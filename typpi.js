/**********************
 *                    *
 *      typpi.js      *
 *                    *
 **********************/

var prefix = ['Bjúgna',
              'Pylsu',
              'Epla',
              'Eitur',
              'Typpa',
              'Fugla',
              'Vél',
              'Gúrku',
              'Tungl',
              'Þang',
              'Bjór'];

var postfix = ['maður',
               'sali',
               'mauk',
               'hrúga',
               'messa',
               'krækir',
               'bróðir',
               'systir',
               'bani',
               'land.is',
               'flaska']

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

// Store usernames in an object so we can easily remove on disconnect
var users = {};
var numUsers = 0;

app.get('/', function(req, res)
{
    res.render('typpi.jade');
});

server.listen(port);

// Connection
// =============================================================================
io.sockets.on('connection', function(socket)
{
    var loggedIn = false;

    socket.on('setUsername', function(username)
    {
        

        // Check if username already exists within user pool
        while (users[username])
        {
            username = prefix[Math.floor(Math.random() * prefix.length)] + 
                       postfix[Math.floor(Math.random() * postfix.length)];
        }
        socket.username = username;
        users[username] = username;
        ++numUsers;
        loggedIn = true;

        // Echo locally
        socket.emit('login', {
            numUsers: numUsers
        });
        // Echo globally
        socket.broadcast.emit('userJoined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    //socket.on('setUsername', function(data)
    //{
    //    socket.username = data;
    //});

    socket.on('sendMessage', function(message)
    {
        var data = {message: message,
            username: socket.username,
            datetime: new Date().toISOString()};
            socket.broadcast.emit('message', data);
            console.log(data.username + ": " + data.message);
        });
});