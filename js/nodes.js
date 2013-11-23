

var nn_nt_tok = 0;
var nn_nt_num = 1;
var nn_nt_inner = 2;
var nn_nt_un = 3;

function FlexibleNode()
{
	this.type = nn_nt_tok;
	this.data = "";
	this.sub = [];

	this.toTok = function() { this.type = nn_nt_tok; }
	this.toNum = function() { this.type = nn_nt_num; }
	this.toInner = function() { this.type = nn_nt_inner; }
	this.toUn = function() { this.type = nn_nt_un; }
	this.isTok = function() { return this.type == nn_nt_tok; }
	this.isNum = function() { return this.type == nn_nt_num; }
	this.isInner = function() { return this.type == nn_nt_inner; }
	this.isUn = function() { return this.type == nn_nt_un; }


	this.addUnParsed = function(input)
	{	var current;
		this.sub.push(new FlexibleNode());
		current = this.sub[this.sub.length - 1];
		current.data = trim(input);
		if (isNaN(current.data)) { current.toUn(); }
		else { current.toNum(); }
	}

	this.addToken = function(input)
	{	var current;
		this.sub.push(new FlexibleNode());
		current = this.sub[this.sub.length - 1];
		current.data = trim(input);
		current.toTok();
	}

	this.clearSub = function()
	{
		this.sub = [];
	}

	this.toString = function()
	{
		var i;
		var output = "";

		for (i = 0; i < this.sub.length; i++)
		{
			if (!this.sub[i].isInner())
			{
				output += "\"" + this.sub[i].data + "\", ";
			}
		}

		return output;
	}
}



