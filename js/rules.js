
/*
    uf_js_sym - generalized symbolic computation system (browser version of unfitsym)
    Copyright (C) 2013 Nick Nygren

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// insertion sort for arrays based on a provided order function
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

// adds all elements from the second array to the first
function concatArray(lhs, rhs)
{
	var i;

	for (i = 0; i < rhs.length; i++)
	{
		lhs.push(rhs[i]);
	}
}


// compares a node against a rule, performs matches and returns a mapping from TV int id's to sub-expressions
// returns null in the cas that the node does not match the rule
function getDefs(node, rule)
{
	var i;
	var output = [];
	var temp;

	// if rule is a single template variable, return the entire node as a match
	if (rule.isInner() && rule.sub.length > 1 && rule.sub[0].data == "TV_{")
	{
		return [{r: node, l: parseInt(rule.sub[1].data)}];
	}
	// otherwise fail if types don't match
	else if (rule.type != node.type) { return null; }
	// on leaf nodes
	else if (!node.isInner())
	{
		// if match, return empty match (null is fail)
		if (node.data == rule.data) { return []; }
		else { return null; }
	}
	// must have same number of child nodes
	else if (node.sub.length != rule.sub.length) { return null; }
	else
	{
		// recurse
		for (i = 0; i < node.sub.length; i++)
		{
			temp = getDefs(node.sub[i], rule.sub[i]);
			if (temp != null) { concatArray(output, temp); }
			else { return null; }
		}

		return output;
	}
}

// generates a HTML formatted list of definitions (for debugging)
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

// sort/check duplicates for output from getDefs
function cleanDefs(input)
{
	var i;
	if (input == null) { return null; }

	// sort output by template variable id
	arraySort(input, function(lhs,rhs) { return lhs.l < rhs.l; } );

	for (i = 0; i < input.length -1; i++)
	{
		// if matches are inconsistent the match should be considered a failure
		if (input[i].l == input[i+1].l && !input[i].r.equalTo(input[i+1].r))
		{
			return null;
		}
	}

	return input;
}

function ruleSetHolder()
{
	// class for storing patterns, making matches and generating subsequent lines in a proof
	// list[] is the rule set
	this.list = [];
	// the AV patterns
	this.Apatterns = [];
	// the LV patterns;
	this.Lpatterns = [];

	// parses a single line from the supplied rule set
	this.breakRule = function(input)
	{
		// regex places the 2 (.*) matches as elements of the match array parsed as node1, node2
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

	// applies getDefs with every rule to the given node and
	// for each match, creates a new node applying the found
	// definitions to the rule.
	this.findMatches = function(node)
	{
		var i,j;
		var output = [];
		var temp;
		var newnode;

		// do not try to match tokens or failed parses
		if (node.isTok() || node.isUn()) { return []; }

		// apply revery rule in the list
		for (i = 0; i < this.list.length; i++)
		{
			// get defs, skip failures
			temp = cleanDefs(getDefs(node,this.list[i].l));
			if (temp != null)
			{
				//start with right side of the rule
				newnode = this.list[i].r.copy();

				// apply each definition to the new node
				for (j = 0; j < temp.length; j++)
				{
					newnode = newnode.replace(temp[j].l, temp[j].r);
				}

				output.push(newnode);
			}
		}

		if (node.isInner())
		{
			// recurse
			for (i = 0; i < node.sub.length; i++)
			{
				temp = this.findMatches(node.sub[i]);

				if (temp != null)
				{
					// apply sub-matches to child nodes, createing new nodes
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

	// iterates over a line break delimited list of rules, parsing each
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


//creates an HTML formatted string from an array of nodes (for debugging)
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

