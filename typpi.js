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
var stylus = require('stylus');


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
app.use(stylus.middleware({
    src: __dirname + '/stylesheets',
    dest: __dirname + '/public',
    debug: true,
    force: true
}));

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
        // Check if username already exists within user pool
        while (users[username])
        {
            username = Name.random();
        }
        socket.username = username;
        users[username] = username;
        ++numUsers;
        loggedIn = true;

        // Echo locally
        socket.emit('login', {
            username: socket.username,
            users: users,
            numUsers: numUsers
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

    socket.on('sendMessage', function(message)
    {
        var date = new Date();
        var date = date.getHours() + ":" + Utils.pad(date.getMinutes(), 2);
        var data = {message: message,
            username: socket.username,
            datetime: date};
        socket.broadcast.emit('message', data);
        socket.broadcast.emit('stopTyping', {
            username: socket.username
        });
        console.log(data.username + ": " + data.message);
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

// TODO:
// Common script - should be wrapped in utils module, accessible by both front
// and back end.
var Utils = {
    pad     : function(number, length) {
   
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }
}

var Name = {
    prefix : ['Bjúgna',
              'Pylsu',
              'Epla',
              'Eitur',
              'Typpa',
              'Fugla',
              'Vél',
              'Gúrku',
              'Tungl',
              'Þang',
              'Stál',
              'Barna',
              'Salt',
              'Eðlu'],
    postfix : ['maður',
               'sali',
               'mauk',
               'hrúga',
               'messa',
               'krækir',
               'bróðir',
               'systir',
               'bani',
               'land.is',
               'flaska',
               'fótur',
               'grautur'],
    random : function()
    {
        return this.prefix[Math.floor(Math.random() * this.prefix.length)] + 
               this.postfix[Math.floor(Math.random() * this.postfix.length)];
    }
}
