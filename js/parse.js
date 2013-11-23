
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

function quickParse(pat, input)
{
	var output = new FlexibleNode();
	var i = 0, j = 0, last = 0;
	var candidate = "";
	var pata = patToArray(pat);

	while (i < input.length && j < pata.length)
	{
		if (pata[j] == "LV" || pata[j] == "AV")
		{
			j++;
		}
		else if (i + pata[j].length > input.length)
		{
			output.clearSub();
			output.toUn();
			return output;
		}
		else if (input.substr(i, pata[j].length) == pata[j])
		{
			if (j == 0)
			{
				output.addToken(pata[j]);
				i += pata[j].length;
				j++;
			}
			else if (pata[j-1] == "AV" || pata[j-1] == "LV")
			{
				candidate = input.substr(last, i - last);
				output.addUnParsed(candidate);
				output.addToken(pata[j]);
				i += pata[j].length;
				last = i;
				j++;
			}
			i++;
		}
		else
		{
			i++;
		}
	}

	if (pata.length == j && pata[j-1] == "AV" || pata[j-1] == "LV")
	{
		candidate = input.substr(last);
		output.addUnParsed(candidate);
	}
	else if (j < pata.length)
	{
		output.clearSub();
		output.toUn();
	}

	output.toInner();
	return output;
}

function testpta(pat, input)
{
	return quickParse(pat, input).toString();
}

