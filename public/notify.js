/**********************
 *                    *
 *      typpi.js      *
 *                    *
 **********************/
// Sets global variable windowFocus to true when tab has focus, else to false

var hidden, visibilityChange; 
if (typeof document.hidden !== "undefined")
{
    hidden = "hidden";
    visibilityChange = "visibilitychange";
}
else if (typeof document.webkitHidden !== "undefined")
{
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
}
else if (typeof document.mozHidden !== "undefined")
{
    hidden = "mozHidden";
    visibilityChange = "mozvisibilitychange";
}
else if (typeof document.msHidden !== "undefined") // We don't want these people
{
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
}

var notifications = 0;
var windowFocus = true;
function handleVisibilityChange()
{
    if (document[hidden])
    {
        windowFocus = false;
    }
    else
    {
        notifications = 0;
        document.title = 'typpi.js';
        windowFocus = true;
    }
}

if (typeof document.addEventListener === "undefined" || 
    typeof hidden === "undefined")
{
    window.location.href = 'http//chrome.google.com';
}
else
{
    document.addEventListener(visibilityChange, handleVisibilityChange, false);
}