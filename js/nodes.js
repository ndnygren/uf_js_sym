

var nn_nt_tok = 0;
var nn_nt_num = 1;
var nn_nt_inner = 2;
var nn_nt_un = 3;

function FlexibleNode()
{
	this.type = nn_nt_tok;
	this.data = "";
	this.sub = [];
	this.pat = [];

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

	this.copy = function()
	{
		var i;
		var output = new FlexibleNode();
		output.type = this.type;
		output.data = this.data;

		for (i = 0; i < this.sub.length; i++)
		{
			output.sub.push(this.sub[i].copy());
		}

		return output;
	}

	this.replace = function(idx, node)
	{
		var i;
		var output;

		if (!this.isInner()) { return this.copy(); }

		output = this.copy();

		if (output.sub[0].data == "TV_{" && parseInt(output.sub[1].data) == idx) { return node; }

		for (i = 0; i < output.sub.length; i++)
		{
			output.sub[i] = output.sub[i].replace(idx, node);
		}

		return output;
	}

	this.clean = function()
	{
		var i, temp;

		if (!this.isInner()) { return this; }
		if (this.sub.length == 1) { return this.sub[0].clean(); }
		if (this.sub.length == 3 && this.sub[0].data == "(" && this.sub[2].data == ")")
		{
			return this.sub[1].clean();
		}

		temp = this.copy();

		for (i = 0; i < temp.sub.length; i++)
		{
			temp.sub[i] = temp.sub[i].clean();
		}

		return temp;
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



