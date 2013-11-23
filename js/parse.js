
function trim(input)
{
	if (typeof(input) != 'string') { return ""; }

	return input.replace(/\s+$/, "").replace(/^\s+/, "");
}

function patToArray(input1)
{
	var i = 0;
	var output = [];
	var input = trim(input1);
	var last = 0;

	for (i = 0; i < input.length - 1; i++)
	{
		if (input.substr(i,2) == "AV" || input.substr(i,2) == "LV")
		{
			if (i != 0)
			{
				output.push(trim(input.substr(last, i - last)));
			}
			output.push(input.substr(i,2));
			last = i + 2;
			i++;
		}
	}

	if (last < input.length) { output.push(trim(input.substr(last, i-last+1))); }

	return output;
}

function testpta(input)
{
	return JSON.stringify(patToArray(input));
}


function quickParse(pat, input)
{
	var output = [];
	var i = 0;

	return output;
}

