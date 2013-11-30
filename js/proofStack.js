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
	this.stack = [];
	this.options = [];
	this.Apatterns = [];
	this.rs = new ruleSetHolder();
	this.outdiv = "";


	this.refresh = function()
	{
		if (this.stack.length > 0)
		{
			this.options = this.rs.findMatches(this.stack[this.stack.length-1]);
		}
		else
		{
			this.options = [];
		}
		this.genOutputToDiv(this.outdiv);
	}

	this.push = function(newnode)
	{
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

	this.pop = function()
	{
		this.stack.pop();
		this.refresh();
	}

	this.LPatternList = function(input)
	{
		this.Lpatterns = buildPatternList(input);
		this.rs.Lpatterns = this.Lpatterns;
	}


	this.LPatternListFromDiv = function(divname)
	{
		this.LPatternList(document.getElementById(divname).innerHTML);
	}

	this.APatternList = function(input)
	{
		this.Apatterns = buildPatternList(input);
		this.rs.Apatterns = this.Apatterns;
	}


	this.APatternListFromDiv = function(divname)
	{
		this.APatternList(document.getElementById(divname).innerHTML);
	}

	this.genOutput = function()
	{
		var i;
		var output = "<div class='prooflist'>\n<h3>Proof</h3>\n"; 
		output +=  "<table class='output_table'>\n";
		for (i = 0; i < this.stack.length; i++)
		{
			output += "<tr><td onclick='ps.pop();'>" + this.stack[i].toString() + "</td></tr>\n";
		}
		output += "</table>\n";
		output += "</div>\n";

		output += "<div class='optionslist'>\n<h3>Options</h3>\n";
		output += "<table class='output_table'>\n";
		for (i = 0; i < this.options.length; i++)
		{
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

	this.pushByOptionId = function(idx)
	{
		if (idx >= 0 && idx < this.options.length)
		{
			this.push(this.options[idx]);
		}
	}

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


