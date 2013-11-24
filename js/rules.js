
function arraySort(input, ord)
{
	var i,j,temp;

	for (j = input.length - 2; j >= 0; j--)
	{
		for (i = j; i < input.length - 1 && !ord(input[i], input[i+1]); i++)
		{
			temp = input[i+1];
			input[i+1] = input[i];
			input[i] = temp;
		}
	}
}

function concatArray(lhs, rhs)
{
	var i;

	for (i = 0; i < rhs.length; i++)
	{
		lhs.push(rhs[i]);
	}
}

function getDefs(node, rule)
{
	var i;
	var output = [];
	var temp;

	if (rule.isInner() && rule.sub.length > 1 && rule.sub[0].data == "TV_{")
	{
		return [{r: node, l: parseInt(rule.sub[1].data)}];
	}
	else if (rule.type != node.type) { return null; }
	else if (!node.isInner())
	{
		if (node.data == rule.data) { return []; }
		else { return null; }
	}
	else if (node.sub.length != rule.sub.length) { return null; }
	else
	{
		for (i = 0; i < node.sub.length; i++)
		{
			temp = getDefs(node.sub[i], rule.sub[i]);
			if (temp != null) { concatArray(output, temp); }
			else { return null; }
		}

		return output;
	}
}

function defToString(input)
{
	var output = "";
	var i;

	if (input == null) { return "No Match<br/>\n"; }

	for (i = 0; i < input.length; i++)
	{
		output += input[i].l + ":\t" + input[i].r + "<br/>\n";
	}

	return output;
}

function cleanDefs(input)
{
	var i;
	arraySort(input, function(lhs,rhs) { return lhs.l < rhs.l; } );

	for (i = 0; i < input.length -1; i++)
	{
		if (input[i].l == input[i+1].l && !input[i].r.equalTo(input[i+1].r))
		{
			return null;
		}
	}

	return input;
}

function testpta(input1, input2, patterns)
{
	var node1 =  fullParse(input1, patterns); 
	var node2 =  fullParse(input2, patterns); 

	return node1.toString() + (node1.equalTo(node2) ? " == " : " != ") + node2.toString() + "<br/>\n"
		+ defToString(cleanDefs(getDefs(node1,node2)));
}
