// DOM node variables
// =============================================================================
var messageInput, usernameInput, setUsername, chatEntries, chatControls,
    typingMonitor;

// Setup
// =============================================================================
var socket = io.connect();
var loggedIn = false;
var typing = false;
$(function() {
	$('#chatControls').hide();
	$('#setUsername').on('click', function() {setName();});
	$('#submit').on('click', function() {sendMessage();});
});

var TYPING_TIMER = 3210;


// Functions
// =============================================================================
function renderMessage(msg, username, date)
{
	var message = date + ' | <span class="username">' + username + ' :</span> ' + msg;
	message = $('<p class="message">').append(message).css('color', getColor(username));
	log(message);
}

function numUsersMessage(data)
{
	numUsers.text('Notendur: ' + data.numUsers);
}

// Typing monitor
// =============================================================================
function startTyping(data)
{
	var msg = $('<p class="typing message"></p>')
				.text(data.username + ' er að skrifa')
				.data('username', data.username);
	typingMonitor.append(msg);
}

function stopTyping(data)
{
	getTypingMessage(data).remove();
}

function getTypingMessage(data)
{
	return $('.typing.message').filter(function (i)
	{
		return $(this).data('username') === data.username;
	});
}

var t;
function isTyping()
{
	if (loggedIn)
	{
		if (!typing)
		{
			typing = true;
			socket.emit('startTyping');
		}
		var last = (new Date()).getTime();

		// Check whether user is still typing
		clearTimeout(t);
		t = setTimeout(function()
		{
			var now = (new Date()).getTime();
			var delta = now - last;
			if (delta >= TYPING_TIMER && typing)
			{
				socket.emit('stopTyping');
				typing = false;
			}
		}, TYPING_TIMER);
	}
}

// Writes to the dom
function log(data)
{
	chatEntries.append(data);
}

function sendMessage()
{
	msg = sanitize(messageInput.val());
	if (msg != '') 
	{
		var date = new Date();
        var date = date.getHours() + ":" + date.getMinutes()
		socket.emit('sendMessage', msg);
		renderMessage(msg, 'Ég', date);
		messageInput.val('');
	}
}

function setName()
{
	name = sanitize(usernameInput.val());
	if (name != "")
	{
		socket.emit('setUsername', name);
		chatControls.show();
		usernameInput.hide();
		setUsername.hide();
		loggedIn = true;
	}
}

// Utilities
// =============================================================================
function sanitize(input)
{
	return $('<div/>').text(input).text();
}

var COLORS = [
'#91004B', '#00918A', '#DB4D00', '#008EDB', '#8C00FF',
'#8AA600', '#008AA6', '#7A6A9C', '#6E2323'
];

function getColor(str)
{
	var tally = 5;
	for (var i = 0; i < str.length; i++)
	{
		tally = str.charCodeAt(i) + (tally << 5) - tally;
	}

	var index = Math.abs(tally % COLORS.length);
	return COLORS[index];
}

// Connection
// =============================================================================
socket.on('message', function(data)
{
	renderMessage(data['message'], data['username'], data['datetime']);
});

socket.on('userJoined', function(data)
{
	log(data.username + ' sameinaðist alheimssálinni.');
	numUsersMessage(data);
});

socket.on('userLeft', function(data)
{
	log(data.username + ' yfirgaf hjörðina.');
	loggedIn = false;
	numUsersMessage(data);
	stopTyping(data);
});

socket.on('login', function(data)
{
	numUsersMessage(data);
	log($('<p class="announcement">Velkomin(n) á typpi.is</p>'));
})

socket.on('startTyping', function(data)
{
	startTyping(data);
});

socket.on('stopTyping', function(data)
{
	stopTyping(data);
});


// Sequential logic
// =============================================================================
$(document).ready(function()
{
	messageInput = $('#messageInput');
	usernameInput = $('#usernameInput');
	setUsername = $('#setUsername');
	chatEntries = $('#chatEntries');
	chatControls = $('#chatControls');
	typingMonitor = $('#typingMonitor');
	numUsers = $('#numUsers');

	messageInput.on('input', function()
	{
	    isTyping();
	});
});