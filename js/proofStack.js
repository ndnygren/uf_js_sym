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

// generates an HTML formatted table from a list of nodes
function nodeListToTable(list, cssclass)
{
        var i = 0;
        var output = "<table class='" + cssclass + "'>";

        for (i = 0; i < list.length; i++)
        {
                output += "<tr><td>" + list[i].toString() + "</td></tr>\n";
        }

        return output + "</table>\n";
}

function proofStack()
{
	// class for storing and manipulating a sequence of expressions, representing a proof
	this.stack = [];
	this.options = [];
	this.Apatterns = [];
	this.rs = new ruleSetHolder();
	this.outdiv = "";


	this.refresh = function()
	{
		// generate list of options
		if (this.stack.length > 0)
		{
			this.options = this.rs.findMatches(this.stack[this.stack.length-1]);
		}
		else
		{
			this.options = [];
		}
		// refresh user-facing display
		this.genOutputToDiv(this.outdiv);
	}

	// adds a new node to the sequence
	this.push = function(newnode)
	{
		// overloading accepts both strings, and parsed nodes
		if (typeof(newnode) == 'string')
		{
			this.stack.push(fullParse(newnode, this.Apatterns, this.Lpatterns));
		}
		else
		{
			this.stack.push(newnode);
		}
		this.refresh();
	}

	// removes a node from the stack (back-tracking)
	this.pop = function()
	{
		this.stack.pop();
		this.refresh();
	}

	// read pattern list
	this.LPatternList = function(input)
	{
		this.Lpatterns = buildPatternList(input);
		this.rs.Lpatterns = this.Lpatterns;
	}


	this.LPatternListFromDiv = function(divname)
	{
		this.LPatternList(document.getElementById(divname).innerHTML);
	}

	// read pattern list
	this.APatternList = function(input)
	{
		this.Apatterns = buildPatternList(input);
		this.rs.Apatterns = this.Apatterns;
	}


	this.APatternListFromDiv = function(divname)
	{
		this.APatternList(document.getElementById(divname).innerHTML);
	}

	// generates the proof as an HTML table formatted list, same for the optional steps
	this.genOutput = function()
	{
		var i;
		var output = "<div class='prooflist'>\n<h3>Proof</h3>\n"; 
		output +=  "<table class='output_table'>\n";
		for (i = 0; i < this.stack.length; i++)
		{
			// clicking a line in this back-tracks
			output += "<tr><td onclick='ps.pop();'>" + this.stack[i].toString() + "</td></tr>\n";
		}
		output += "</table>\n";
		output += "</div>\n";

		output += "<div class='optionslist'>\n<h3>A* search</h3>\n";
		output += "<table class='output_table'>\n";
		output += "<tr><td onclick='runSearch(ps)'>Minimize String Length</td></tr>\n";
		output += "</table>\n";
		output += "<h3>Associativity/Commutativity assumed</h3>\n";
		output += "<table class='output_table'>\n";
		output += "<tr><td onclick='sumOfProd(ps)'>Sum of Products</td></tr>\n";
		output += "<tr><td onclick='groupExponent(ps)'>Group Exponents by Base</td></tr>\n";
		output += "</table>\n";
		output += "<h3>Manual Options</h3>\n";
		output += "<table class='output_table'>\n";
		for (i = 0; i < this.options.length; i++)
		{
			// clicking on an option pushes to the proof sequence
			output += "<tr><td onclick='ps.pushByOptionId(" + i + ")'>" + this.options[i].toString() + "</td></tr>\n";
		}
		output += "</table>\n";
		output += "</div>\n";

		return output;
	}

	this.genOutputToDiv = function(divname)
	{
		document.getElementById(divname).innerHTML = this.genOutput();
	}

	// generates the HTML formatted details about patterns and the rule set, visible to the user
	this.ruleDetails = function()
	{
		var i;
		var output = "<h2>Rule Set Details</h2><a href=\"javascript:void(0)\" onclick='document.getElementById(\"details_out\").style.display=\"none\"'><h3>hide</h3></a><div class='detailsList'>\n";

		output += "<h3>LV patterns</h3><table class='output_table' >\n";
		for (i = 0; i < this.Lpatterns.length; i++)
		{
			output += "<tr><td>" + this.Lpatterns[i].toString() + "</td></tr>\n";
		}
		output += "</table>\n";

		output += "</div>\n<div class='detailsList'>\n";

		output += "<h3>AV patterns</h3><table class='output_table' >\n";
		for (i = 0; i < this.Apatterns.length; i++)
		{
			output += "<tr><td>" + this.Apatterns[i].toString() + "</td></tr>\n";
		}
		output += "</table>\n";

		output += "</div>\n<div class='detailsList'>\n";
		output += "<h3>Substitution Rules</h3><table class='output_table' >\n";
		for (i = 0; i < this.rs.list.length; i++)
		{
			output += "<tr><td>" + this.rs.list[i].l.toString();
			output += "</td><td>" + this.rs.list[i].r.toString();
			output += "</td></tr>\n";
		}
		output += "</table>\n";
		output += "</div>";

		return output;
	}

	this.ruleDetailsToDiv = function(divname)
	{
		document.getElementById(divname).innerHTML = this.ruleDetails();
	}


	// pushes one of the existing options, rather than a new node.
	this.pushByOptionId = function(idx)
	{
		if (idx >= 0 && idx < this.options.length)
		{
			this.push(this.options[idx]);
		}
	}

	// reads the rule set, using the rule set's own parser 
	this.RuleSet = function(input)
	{
		this.rs.readList(input);
		this.rs.Apatterns = this.Apatterns;
	}

	this.RuleSetFromDiv = function(divname)
	{
		this.RuleSet(document.getElementById(divname).innerHTML);
	}

}


