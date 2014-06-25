
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




