

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


	this.equalTo = function(node)
	{
		var i;
		if (this.type != node.type) { return false; }
		else if (!this.isInner()) { return this.data == node.data; }
		else
		{
			if (this.sub.length != node.sub.length) { return false; }
			for (i = 0; i < this.sub.length; i++)
			{
				if (!this.sub[i].equalTo(node.sub[i])) { return false; }
			}
		}

		return true;
	}

	this.templateFree = function()
	{
		var i;
		if (this.isUn()) { return false; }
		else if (!this.isInner()) { return true; }
		else if (this.sub.length == 0) { return false; }
		else if (this.sub[0].data == "TV_{") { return false; }
		else 
		{
			for (i = 0; i < this.sub.length; i++)
			{
				if (!this.sub[i].templateFree()) { return false; }
			}
			return true;
		}
	}

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
		if (this.isInner())
		{
			for (i = 0; i < this.sub.length; i++)
			{
				if (!this.sub[i].isInner())
				{
					output += this.sub[i].toString();
				}
				else
				{
					output += "(" + this.sub[i].toString() + ")";
				}
			}
		}
		else if (this.isUn()) { return "\"" + this.data + "\""; }
		else { return this.data; }

		return output;
	}
}



