/**********************
 *                    *
 *      typpi.js      *
 *                    *
 **********************/
// Basic chat server

// Requirements
// =============================================================================
var http = require('http');
var express = require('express');
var jade = require('jade');
var utils = require('./utils');
var name = require('./name_generator');
var sass = require('node-sass');

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
app.use(sass.middleware({
    src: __dirname + '/public/sass',
    dest: __dirname + '/public',
    debug: true,
    outputStyle: 'compressed'
}));
app.use(express.static(__dirname + '/public'));

// Store usernames in an object so we can easily remove on disconnect
var users = {};
var numUsers = 0;
// Store messages sent in a circular buffer
var messages = [];
var latestMessage = 0;
var MAX_MSG = 50;

app.get('/', function(req, res)
{
    res.render('typpi.jade');
});

app.get('/rng', function(req, res) {
    res.type('text/json');
    res.send(JSON.stringify(name.random()));
});

app.get('/rng/:name_count', function(req, res) {
    var number = req.param('name_count');
    if (number <= 1337 && number >= 0)
    {
        var names = [];
        for(var i = 0; i < number; i++)
        {
            names.push(name.random());
        }
        res.type('text/json');
        res.send(JSON.stringify(names));
    }
    else
    {
        res.type('text/json');
        res.send(JSON.stringify('Ekki töff.'));
    }
});

server.listen(port);

// Connection
// =============================================================================

io.sockets.on('connection', function(socket)
{
    var loggedIn = false;

    socket.on('setUsername', function(username)
    {
        // If user is changing their name
        if (loggedIn)
        {
            delete users[socket.username];
            --numUsers;
            socket.broadcast.emit('userLeft', {
                username: socket.username,
                numUsers: numUsers
            });
        }
        if (username === '') username = name.random();
        // Check if username already exists within user pool
        while (users[username])
        {
            username = name.random();
        }
        socket.username = username;
        users[username] = username;
        ++numUsers;
        loggedIn = true;

        // Create a shifted message history where newest message starts at 0
        var history = [];
        for (var i = 0; i < MAX_MSG; i++)
        {
            history[i] = messages[(latestMessage + i) % MAX_MSG];
        }
        // Echo locally
        socket.emit('login', {
            username: socket.username,
            users: users,
            numUsers: numUsers,
            history: history
        });
        // Echo globally
        socket.broadcast.emit('userJoined', {
            username: socket.username,
            users: users,
            numUsers: numUsers
        });
    });

    // Broadcast when user starts typing
    socket.on('startTyping', function ()
    {
        if isConnectionDropped(socket) return;
        socket.broadcast.emit('startTyping', {
            username: socket.username
        });
    });
    
    // Broadcast when user stops typing
    socket.on('stopTyping', function ()
    {
        socket.broadcast.emit('stopTyping', {
            username: socket.username
        });
    });

    socket.on('requestNickname', function()
    {
        socket.emit('serveNickname', {username: name.random()});
    });

    socket.on('sendMessage', function(message)
    {
        if isConnectionDropped(socket) return;
        var date = new Date();
        date = date.getHours() + ":" + utils.pad(date.getMinutes(), 2);

        messages[latestMessage] = {message: message,
                                   datetime: date,
                                   username: socket.username};
        socket.broadcast.emit('message', messages[latestMessage]);
        latestMessage = (latestMessage + 1) % MAX_MSG;
        socket.broadcast.emit('stopTyping', {
            username: socket.username
        });
        console.log(socket.username + ": " + message);
    });

    socket.on('disconnect', function ()
    {
        // Remove the username from global usernames list
        if (loggedIn)
        {
            delete users[socket.username];
            --numUsers;
    
            socket.broadcast.emit('userLeft', {
                username: socket.username,
                users: users,
                numUsers: numUsers
            });
        }
    });
});

function isConnectionDropped(socket)
{
    if (socket.username === undefined)
    {
        socket.emit('droppedConnection')
        return true;
    }
    return false;
}