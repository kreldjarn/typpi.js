// Setup
// =============================================================================
var socket = io.connect();
$(function()
{
    $("#chatControls").hide();
    $("#pseudoSet").click(function() {setPseudo();});
    $("#submit").click(function() {sendMessage();});
});


// Functions
// =============================================================================
function renderMessage(msg, username, date)
{
    $('#chatEntries').append('<div class="message"><p>' + date + ' | ' + username + ' : ' + msg + '</p></div>');
}

function sendMessage()
{
    if ($('#messageInput').val() != "") 
    {
        socket.emit('sendMessage', $('#messageInput').val());
        renderMessage($('#messageInput').val(), "Ég", new Date().toISOString());
        $('#messageInput').val('');
    }
}

function setPseudo()
{
    if ($('#usernameInput').val() != "")
    {
        socket.emit('setUsername', $('#usernameInput').val());
        $('#chatControls').show();
        $('#usernameInput').hide();
        $('#pseudoSet').hide();
    }
}

// Connection
// =============================================================================
socket.on('message', function(data)
{
    renderMessage(data['message'], data['username'], data['datetime']);
});