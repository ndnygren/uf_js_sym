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

// integer type codes for nodes
// type for token node
var nn_nt_tok = 0;
// type for number node
var nn_nt_num = 1;
// type for internal node
var nn_nt_inner = 2;
// type for unparsed node
var nn_nt_un = 3;

function FlexibleNode()
{
	// the class representing nodes in the parse tree
	this.type = nn_nt_tok;
	this.data = "";
	// child nodes are listed in the sub[] array
	this.sub = [];
	// the original pattern this node matches, stored in the pat[] array
	this.pat = [];


	// setting type
	this.toTok = function() { this.type = nn_nt_tok; }
	this.toNum = function() { this.type = nn_nt_num; }
	this.toInner = function() { this.type = nn_nt_inner; }
	this.toUn = function() { this.type = nn_nt_un; }
	//checking type
	this.isTok = function() { return this.type == nn_nt_tok; }
	this.isNum = function() { return this.type == nn_nt_num; }
	this.isInner = function() { return this.type == nn_nt_inner; }
	this.isUn = function() { return this.type == nn_nt_un; }

	// node-to-node equality test
	this.equalTo = function(node)
	{
		var i;
		// type nust match
		if (this.type != node.type) { return false; }
		// if a leaf node, then same data and same type are sufficient for equality
		else if (!this.isInner()) { return this.data == node.data; }
		else
		{
			// recurse into leaf nodes
			if (this.sub.length != node.sub.length) { return false; }
			for (i = 0; i < this.sub.length; i++)
			{
				if (!this.sub[i].equalTo(node.sub[i])) { return false; }
			}
		}

		return true;
	}


	// test for a successful parse, no templates and no unparsed strings
	this.templateFree = function()
	{
		var i;
		// reject unparsed node
		if (this.isUn()) { return false; }
		// not unparsed and leaf is success
		else if (!this.isInner()) { return true; }
		// interal node with no child nodes is failure
		else if (this.sub.length == 0) { return false; }
		// template is failure
		else if (this.sub[0].data == "TV_{") { return false; }
		else
		{
			// recurse into child node
			for (i = 0; i < this.sub.length; i++)
			{
				if (!this.sub[i].templateFree()) { return false; }
			}
			return true;
		}
	}

	// recursively copies the node
	this.copy = function()
	{
		var i;
		// allocate separate memory and copy basics
		var output = new FlexibleNode();
		output.type = this.type;
		output.data = this.data;

		for (i = 0; i < this.sub.length; i++)
		{
			// recurse
			output.sub.push(this.sub[i].copy());
		}

		return output;
	}

	// search for template variables by id number and replace them with some expression
	this.replace = function(idx, node)
	{
		var i;
		var output;

		// copy leaf nodes
		if (!this.isInner()) { return this.copy(); }

		output = this.copy();

		// if this is a template variable that matches, supply the node instead of copying
		if (output.sub[0].data == "TV_{" && parseInt(output.sub[1].data) == idx) { return node; }

		for (i = 0; i < output.sub.length; i++)
		{
			// recurse into leaf nodes
			output.sub[i] = output.sub[i].replace(idx, node);
		}

		return output;
	}

	// elimate redundant brackets
	this.clean = function()
	{
		var i, temp;

		// skip over leaf nodes
		if (!this.isInner()) { return this; }
		// leaf nodes with only one child are collapsed
		if (this.sub.length == 1) { return this.sub[0].clean(); }
		// identify brackets
		if (this.sub.length == 3 && this.sub[0].data == "(" && this.sub[2].data == ")")
		{
			return this.sub[1].clean();
		}

		temp = this.copy();

		for (i = 0; i < temp.sub.length; i++)
		{
			// recurse
			temp.sub[i] = temp.sub[i].clean();
		}

		return temp;
	}

	// add a child as queued to be parsed
	this.addUnParsed = function(input)
	{	var current;
		this.sub.push(new FlexibleNode());
		current = this.sub[this.sub.length - 1];
		current.data = trim(input);
		if (isNaN(current.data)) { current.toUn(); }
		// numbers to not need to be parsed
		else { current.toNum(); }
	}

	// add a child that does not need to be parsed
	this.addToken = function(input)
	{	var current;
		this.sub.push(new FlexibleNode());
		current = this.sub[this.sub.length - 1];
		current.data = trim(input);
		current.toTok();
	}

	// remove all child nodes
	this.clearSub = function()
	{
		this.sub = [];
	}

	// resursively render string output
	this.toString = function()
	{
		var i;
		var output = "";
		if (this.isInner())
		{
			for (i = 0; i < this.sub.length; i++)
			{
				if (!this.sub[i].isInner())
				{
					// no brackets around leaf nodes
					output += this.sub[i].toString();
				}
				else
				{
					// explicit brackets for sub trees
					output += "(" + this.sub[i].toString() + ")";
				}
			}
		}
		// quotes around unparsed nodes
		else if (this.isUn()) { return "\"" + this.data + "\""; }
		else { return this.data; }

		return output;
	}
}



