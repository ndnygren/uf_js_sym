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
		this.stack.push(fullParse(newnode, this.Apatterns));
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
		var output = "<div class='prooflist'><h3>Proof</h3>\n"; 
		output += nodeListToTable(this.stack, 'output_table');
		output += "</div>\n<div class='optionslist'><h3>Options</h3>\n";
		output += nodeListToTable(this.options, 'output_table');
		output += "</div>";
		return output;
	}

	this.genOutputToDiv = function(divname)
	{
		document.getElementById(divname).innerHTML = this.genOutput();
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


