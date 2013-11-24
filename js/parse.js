
function trim(input)
{
	if (typeof(input) != 'string') { return ""; }

	return input.replace(/\s+$/, "").replace(/^\s+/, "");
}

function breakOnDelim(input, delim)
{
	var i;
	var last = 0;
	var output = [];

	if (typeof(input) != 'string') { return []; }

	for (i = 0; i < input.length; i++)
	{
		if (input[i] == delim)
		{
			output.push(input.substr(last, i-last));
			last = i+1;
		}
	}
	output.push(input.substr(last, i-last));

	return output;
}

function buildPatternList(input)
{
	if (typeof(input) != 'string') { return []; }
	var temp = breakOnDelim(input, '\n');
	var output = [];
	var i;

	for (i = 0; i < temp.length; i++)
	{
		if (trim(temp[i]) != "")
		{
			output.push(patToArray(temp[i]));
		}
	}

	return output;
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

function testBracketBalance(input)
{
	var i;
	var stack = [];

	for (i = 0; i < input.length; i++)
	{
		if (input[i] == '(') { stack.push('('); }
		else if (input[i] == '{') { stack.push('{'); }
		else if (input[i] == ')')
		{
			if (stack.length == 0 || stack[stack.length - 1] != '(') { return false; }
			stack.pop();
		}
		else if (input[i] == '}')
		{
			if (stack.length == 0 || stack[stack.length - 1] != '{') { return false; }
			stack.pop();
		}
	}

	if (stack.length == 0) { return true; }
	return false;
}

function quickParse(pata, output)
{
	var input = trim(output.data);
	var i = 0, j = 0, last = 0;
	var candidate = "";

	while (i < input.length && j < pata.length)
	{
		if (pata[j] == "LV" || pata[j] == "AV")
		{
			j++;
		}
		else if (j == 0 && i != 0)
		{
			output.clearSub();
			output.toUn();
			return false;
		}
		else if (i + pata[j].length > input.length)
		{
			output.clearSub();
			output.toUn();
			return false;
		}
		else if (input.substr(i, pata[j].length) == pata[j])
		{
			if (j == 0)
			{
				output.addToken(pata[j]);
				i += pata[j].length;
				last = i;
				j++;
			}
			else if (pata[j-1] == "AV" || pata[j-1] == "LV")
			{
				candidate = input.substr(last, i - last);
				if (trim(candidate) != "" && testBracketBalance(candidate))
				{
					output.addUnParsed(candidate);
					output.addToken(pata[j]);
					i += pata[j].length;
					last = i;
					j++;
				}
				else
				{
					i++;
				}
			}
		}
		else
		{
			i++;
		}
	}

	//"i: " + i + "/" + input.length + "\nj: " + j + "/" + pata.length + "\n" + JSON.stringify(input) + "\n" + JSON.stringify(pata) + "\n"

	if (pata.length == j && pata[j-1] == "AV" || pata[j-1] == "LV")
	{
		candidate = input.substr(last);
		output.addUnParsed(candidate);
	}
	else if (j < pata.length || i < input.length)
	{
		output.clearSub();
		output.toUn();
		return false;
	}

	output.toInner();
	return true;
}

function fullParse(input, patterns)
{
	var node = new FlexibleNode(), current;
	var i = 0;
	var log = "";
	var stack = [];
	node.toUn();
	node.data = input;

	stack.push(node);

	while (stack.length != 0)
	{
		current = stack.pop();
		log += ("\"" + JSON.stringify(patterns) + "\" tesing for " + JSON.stringify(current));
		log += "<br/>\n";
		i = 0;

		while(i < patterns.length && !quickParse(patterns[i], current))
		{
			log += ("\"" + JSON.stringify(patterns[i]) + "\" failed for " + JSON.stringify(current));
			log += "<br/>\n";
			i++;
		}
		if (patterns.length > i) { log += ("\"" + JSON.stringify(patterns[i]) + "\" succeeded for " + JSON.stringify(current) + "<br/>\n"); }

		for (i = 0; i < current.sub.length; i++)
		{
			if (current.sub[i].isUn()) { stack.push(current.sub[i]); }
		}
	}

	return node;
}

function testpta(input1, input2, patterns)
{
	var node1 =  fullParse(input1, patterns); 
	var node2 =  fullParse(input2, patterns); 

	return node1.toString() + (node1.equalTo(node2) ? " == " : " != ") + node2.toString();
}

