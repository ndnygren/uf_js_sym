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
			this.stack.push(fullParse(newnode, this.Apatterns));
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

	this.APatternList = function(input)
	{
		this.Apatterns = buildPatternList(input);
		this.rs.patterns = this.Apatterns;
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
		this.rs.patterns = this.Apatterns;
	}

	this.RuleSetFromDiv = function(divname)
	{
		this.RuleSet(document.getElementById(divname).innerHTML);
	}

}


