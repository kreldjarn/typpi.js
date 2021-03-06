/**********************
 *                    *
 *      typpi.js      *
 *                    *
 **********************/
// Basic chat client with methods for rendering sent and received messages in
// the DOM


// DOM node variables
// =============================================================================
var messageInput, chatEntries, chatControls,
    typingMonitor, userList, randomNameRequest;

// Setup
// =============================================================================
//var socket = io.connect('https://typpi.herokuapp.com', {secure: true});
var socket = io.connect('', {secure: true});
var loggedIn = false;
var color;
var typing = false;
var debugLayout = false;


// Functions
// =============================================================================
function renderMessage(msg, username, date, color)
{
	var name = $('<span class="username"></span>').text(username);
	var timestamp = $('<span class="timestamp"></span>').text(date);
	var body = $('<span class="message-body"></span>').append(escapeHTML(msg).autoLink({target: "_blank", callback: function(url) {
			// Render images rather than link to them
    		return /\.(gif|png|jpe?g)$/i.test(url) ? '<img src="' + url + '">' : null;
  		}
  	}));
	message = $('<p class="message hidden">').append(name).append(timestamp).append(body).css('color', color);
	setTimeout(function() {$('#chatEntries').find(".message.hidden").removeClass("hidden");}, 100);

	log(message);
	updateNotifications();
}

function numUsersMessage(data)
{
	$('#numUsers').text('Notendur: ' + data.numUsers);
}

function renderUserList(data)
{
	var userList = $('#userList');
	list = data.users;
	userList.empty();
	$.each(list, function(key, value)
	{
		var p = $('<div class="userListItem hidden"><div class="bubble"></div><p></p></div>').css('color', value.color);
		p.find(".bubble").css('background', value.color);
		p.find("p").html(value.username);
		userList.append(p);
	});
	setTimeout(function() {userList.find(".userListItem.hidden").removeClass("hidden");}, 100);
}

// Writes to the dom
function log(data)
{
	$('#chatEntries').append(data);
}

function sendMessage()
{
	msg = sanitize($('#messageInput').val());
	if (msg != '') 
	{
		//var date = new Date();
        //var date = date.getHours() + ":" + pad(date.getMinutes(), 2);
		socket.emit('sendMessage', msg);
		//renderMessage(msg, 'Ég', date, color);
		$('#messageInput').val('');
	}
}

function setName()
{
	name = sanitize($('#usernameInput').val());
	// If no name is selected, a random name will be generated
	socket.emit('setUsername', name);
	renderMessageView();
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
	var typingMonitor = $('#typingMonitor');
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
	'#45D6BB', '#E0D455', '#E086E8', '#F87171', '#6EC9F1', '#4E9BA4', '#9533A3', '#CF417A', '#5C8CC9'];

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
	console.log(data)
	if (loggedIn)
		renderMessage(data.message, data.username, data.datetime, data.color);
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
	numUsersMessage(data);
	renderUserList(data);
	stopTyping(data);
});

socket.on('login', function(data)
{
	color = data.color;
	numUsersMessage(data);
	renderUserList(data);
	var history = data.history;
	for (var i = 0; i < history.length; i++)
	{
		if(history[i] == null) continue;
		renderMessage(history[i].message, history[i].username, history[i].datetime, history[i].color);
	}
	log($('<p class="announcement"></p>').text('Velkomin(n) á typpi.is, þú heitir ' + data.username));
	
	var messageInput = $('#messageInput');
	messageInput.css('color', data.color);
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
	var usernameInput = $('#usernameInput');
	usernameInput.val(data.username);
	usernameInput.focus();
});

socket.on('droppedConnection', function()
{
	renderLoginView();
});


function pad(number, length)
{
	var str = '' + number;
	while (str.length < length)
	{
	    str = '0' + str;
	}
	return str;
}

function renderLoginView()
{
	var c = $('.container');
	c.empty();
	var input = $('<input type="text" id="usernameInput" />');
	var button = $('<button id="randomNameRequest">Slembið nafn</button>');
	c.append(input);
	c.append(button);
}

function renderMessageView()
{
	var c = $('.container');
	c.empty();
	var userListDiv = $('<div></div>');
	var numUsers = $('<div id="numUsers"></div>');
	var userListWrapper = $('<div id="userListWrapper"></div>');
	var userList = $('<div id="userList"></div>');
	userListWrapper.append(userList);
	userListDiv.append(numUsers);
	userListDiv.append(userListWrapper);

	var wrapper = $('<div id="chatEntriesWrapper"></div>');
	var entries = $('<div id="chatEntries"></div>');
	var controls = $('<div id="chatControl"></div>');
	var input = $('<input type="text" id="messageInput" />');
	var monitor =$('<div id="typingMonitor"></div>');
	wrapper.append(entries);
	controls.append(input);
	c.append(userListDiv);
	c.append(wrapper);
	c.append(controls);
	c.append(monitor);
	input.focus();
}


// Sequential logic
// =============================================================================
$(document).ready(function()
{
	chatEntriesWrapper = $('#chatEntriesWrapper');
	chatEntries = $('#chatEntries');
	chatControls = $('#chatControls');
	typingMonitor = $('#typingMonitor');
	numUsers = $('#numUsers');
	userList = $('#userList');

	var container = $('.container');

	renderLoginView();

	$(window).resize(function(){
		$('#chatEntriesWrapper').scrollTop($('#chatEntries').height());});

	// When chatEntry DOM contents changes, we scroll to the 
	// bottom of the div
	container.on('DOMSubtreeModified', '#chatEntriesWrapper', function()
	{
		$(this).scrollTop($('#chatEntries').height());
	});

	container.on('input', '#messageInput', function()
	{
		isTyping();
	});

	container.on('click', '#randomNameRequest', function()
	{
		socket.emit('requestNickname');
	});

	container.on('keydown', '#messageInput', function(e)
	{
		if (e.keyCode == 13)
			sendMessage();
	});

	container.on('keydown', '#usernameInput', function(e)
	{
		if (e.keyCode == 13)
			setName();
	});


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