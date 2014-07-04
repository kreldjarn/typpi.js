/**********************
 *                    *
 *      typpi.js      *
 *                    *
 **********************/
// Basic chat client with methods for rendering sent and received messages in
// the DOM


// DOM node variables
// =============================================================================
var messageInput, usernameInput, setUsername, chatEntries, chatControls,
    typingMonitor, userList, randomNameRequest;

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
var debugLayout = false;

// Functions
// =============================================================================
function renderMessage(msg, username, date)
{
	var name = $('<span class="username"></span>').text(username);
	var timestamp = $('<span class="timestamp"></span>').text(date);
	var body = $('<span class="message-body"></span>').append(escapeHTML(msg).autoLink());
	message = $('<p class="message hidden">').append(name).append(timestamp).append(body).css('color', getColor(username));

	setTimeout(function() {chatEntries.find(".message.hidden").removeClass("hidden");}, 100);

	log(message);
	updateNotifications();
}

function numUsersMessage(data)
{
	numUsers.text('Notendur: ' + data.numUsers);
}

function renderUserList(data)
{
	list = data.users;
	userList.empty();
	$.each(list, function(key, username)
	{
		var p = $('<div class="userListItem hidden"><div class="bubble"></div><p></p></div>').css('color', getColor(username));
		p.find(".bubble").css('background', getColor(username));
		p.find("p").html(username);
		userList.append(p);
	});
	setTimeout(function() {userList.find(".userListItem.hidden").removeClass("hidden");}, 100);
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
        var date = date.getHours() + ":" + pad(date.getMinutes(), 2);
		socket.emit('sendMessage', msg);
		renderMessage(msg, 'Ég', date);
		messageInput.val('');
	}
}

function setName()
{
	name = sanitize(usernameInput.val());
	// If no name is selected, a random name will be generated
	socket.emit('setUsername', name);
	chatControls.show();
	usernameInput.hide();
	setUsername.hide();
	randomNameRequest.hide();
	loggedIn = true;
}

function updateNotifications()
{
	// Check windowFocus variable from notify.js
	if (windowFocus) return;
	// notifications is declared in notify.js
	notifications++;
	document.title = '(' + notifications + ') typpi.js';
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

// Local timeout for typing, needs to be cleared before it's set again,
// so as not to trigger multiple callbacks.
var t;
var TYPING_TIMER = 2000;
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

		clearTimeout(t);
		// Check whether user is still typing
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

// Utilities
// =============================================================================
function sanitize(input)
{
	return $('<div>').text(input).text();
}

// Hack - uses the DOM, but is faster than chaining .replace()
function escapeHTML(string)
{
    var pre = document.createElement('pre');
    var text = document.createTextNode(string);
    pre.appendChild(text);
    return pre.innerHTML;
}

var COLORS = [
//	'#91004B', '#00918A', '#DB4D00', '#008EDB', '#8C00FF', '#51BBBD', '#D9B723',
//	'#8AA600', '#008AA6', '#7A6A9C', '#6E2323', '#9C064A', '#D9237E', 
	'#4BE8CB', '#F3F16D', '#E086E8', '#F87171', '#71CFF8'
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
	var msg = $('<p class="announcement"></p>').text(data.username + ' skráði sig inn á typpi.is');
	log(msg);
	numUsersMessage(data);
	renderUserList(data);
});

socket.on('userLeft', function(data)
{
	var msg = $('<p class="announcement"></p>').text(data.username + ' yfirgaf typpi.is');
	log(msg);
	loggedIn = false;
	numUsersMessage(data);
	renderUserList(data);
	stopTyping(data);
});

socket.on('login', function(data)
{
	numUsersMessage(data);
	renderUserList(data);
	log($('<p class="announcement"></p>').text('Velkomin(n) á typpi.is, þú heitir ' + data.username));
	messageInput.css('color', getColor(data.username));
	messageInput.focus();
})

socket.on('startTyping', function(data)
{
	startTyping(data);
});

socket.on('stopTyping', function(data)
{
	stopTyping(data);
});

// Response from RNG request
socket.on('serveNickname', function(data)
{
	usernameInput.val(data.username);
	usernameInput.focus();
});


pad = function(number, length)
{
	var str = '' + number;
	while (str.length < length)
	{
	    str = '0' + str;
	}
	return str;
}


// Sequential logic
// =============================================================================
$(document).ready(function()
{
	messageInput = $('#messageInput');
	usernameInput = $('#usernameInput');
	randomNameRequest = $('#randomNameRequest');
	setUsername = $('#setUsername');
	chatEntriesWrapper = $('#chatEntriesWrapper');
	chatEntries = $('#chatEntries');
	chatControls = $('#chatControls');
	typingMonitor = $('#typingMonitor');
	numUsers = $('#numUsers');
	userList = $('#userList');

	// When chatEntry DOM contents changes, we scroll to the 
	// bottom of the div
	chatEntries.bind("DOMSubtreeModified", function() {
		console.log("scroll to bottom");
		$(chatEntriesWrapper).scrollTop(chatEntries.height());
	});

	messageInput.on('input', function()
	{
	    isTyping();
	});

	randomNameRequest.on('click', function()
	{
		socket.emit('requestNickname');
	});

	messageInput.on('keydown', function(e)
	{
		if (e.keyCode == 13)
			sendMessage();
	});

	usernameInput.on('keydown', function(e)
	{
		if (e.keyCode == 13)
			setName();
	});

	usernameInput.focus();

	if(debugLayout)
	{
		usernameInput.val("Typpaprestur");
		setName();
		for(var i = 0; i < 1; i++)
		{
			messageInput.val("Blessaður í beinni");
			sendMessage();
		}
	}
});