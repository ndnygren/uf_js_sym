

var nn_nt_tok = 0;
var nn_nt_num = 1;
var nn_nt_inner = 2;

function FlexableNode()
{
	this.type = nn_nt_tok;
	this.data = "";
	this.sub = [];

	this.toTok = function() { this.type = nn_nt_tok; }
	this.toNum = function() { this.type = nn_nt_num; }
	this.toInner = function() { this.type = nn_nt_inner; }
	this.isTok = function() { return this.type == nn_nt_tok; }
	this.isNum = function() { return this.type == nn_nt_num; }
	this.isInner = function() { return this.type == nn_nt_inner; }


}



