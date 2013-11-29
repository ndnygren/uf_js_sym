
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
	if (input == null) { return null; }

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

function ruleSetHolder()
{
	this.list = [];
	this.Apatterns = [];
	this.Lpatterns = [];

	this.breakRule = function(input)
	{
		var m = input.match(/(.*)\\Rightarrow(.*)/);
		var node1;
		var node2;

		if (m.length != 3) { return null; }

		node1 = fullParse(m[1], this.Apatterns, this.Lpatterns);
		node2 = fullParse(m[2], this.Apatterns, this.Lpatterns);

		if (node1.isUn()) { alert ("failed to parse rule " + m[1]); return null;}
		if (node2.isUn()) { alert ("failed to parse rule " + m[2]); return null;}

		return {l: node1, r: node2 };
	}


	this.findMatches = function(node)
	{
		var i,j;
		var output = [];
		var temp;
		var newnode;

		for (i = 0; i < this.list.length; i++)
		{
			temp = cleanDefs(getDefs(node,this.list[i].l));
			if (temp != null)
			{
				newnode = this.list[i].r.copy();

				for (j = 0; j < temp.length; j++)
				{
					newnode = newnode.replace(temp[j].l, temp[j].r);
				}

				output.push(newnode);
			}
		}

		if (node.isInner())
		{
			for (i = 0; i < node.sub.length; i++)
			{
				temp = this.findMatches(node.sub[i]);

				if (temp != null)
				{
					for (j = 0; j < temp.length; j++)
					{
						newnode = node.copy();
						newnode.sub[i] = temp[j];
						output.push(newnode);
					}
				}
			}
		}

		return output;
	}

	this.readList = function(input)
	{
		var lines = breakOnDelim(input, '\n');
		var i;
		var temp;

		for (i = 0; i < lines.length; i++)
		{
			if (trim(lines[i]) != "")
			{
				temp = this.breakRule(lines[i]);
				if (temp != null)
				{
					this.list.push(temp);
				}
			}
		}
	}
}

function nodeListToString(list)
{
	var i = 0;
	var output = "";

	for (i = 0; i < list.length; i++)
	{
		output += i + ":\t" + list[i].toString() + "<br/>\n";
	}

	return output;
}

