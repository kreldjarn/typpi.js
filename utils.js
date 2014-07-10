
// Pads number to length with leading zeros
exports.pad = function(number, length)
{
	var str = '' + number;
	while (str.length < length)
	{
	    str = '0' + str;
	}
	return str;
}

// Grabs the *next* color from the color buffer
exports.getColor = function()
{
	var color = color_buffer[index];
	index = (index + 1) % max;
	return color;
}

var color_buffer = [
	'#45D6BB', '#E0D455', '#E086E8', '#F87171', '#6EC9F1', '#4E9BA4', '#9533A3',
	'#CF417A', '#5C8CC9'
];

var max = color_buffer.length;
var index = Math.floor(Math.random() * max);



