
/*
    uf_js_sym - generalized symbolic computation system (browser version of unfitsym)
    Copyright (C) 2014 Nick Nygren

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



// vertex in the graph, contains the list of neighbors and distance from the start node.
function asNode(input)
{
	// name: The original LaTeX formatted string
	this.name = input;

	// data: The parsed expression (FlexibleNode)
	this.data = null;

	// neigh: The array of neighbors used in the search
	this.neigh = null;

	// depth: distance from the start node
	this.depth = -1;

	// prev: shortest path predecessor
	this.prev = "";
}


// class for storing and manipulating the graph for the min string search
function aStarGraph(rules)
{
	// fringe: queue of vertices to be searched
	this.fringe = [];

	// data: list of all nodes, indexed by LaTeX string, stores asNode objects
	this.data = {};

	// rs: the user-facing ruleset used by the proof stack
	this.rs = rules;


	// returns a list of neighbors by applying the ruleset
	this.calcNeigh = function(input)
	{
		return this.rs.findMatches(input);
	}

	// adds a new node to the graph (preserving uniquness)
	this.add = function(node, data)
	{
		if (this.data[node] == undefined)
		{
			var temp = new asNode(node);
			temp.data = data;
			this.data[node] = temp;
			this.fringe.push(node);
		}

	}

	// traverses the graph, populating the asNode list. Stops at a given depth
	this.fillToDepth = function(maxdepth)
	{
		var i;
		var current;
		var tempn;
		var currentnode;
		var newname;

		while (this.fringe.length > 0)
		{
			current = this.fringe.pop();
			currentnode = this.data[current];
			// does not search any node more than once
			if (currentnode.depth < maxdepth && currentnode.neigh == null)
			{
				tempn = this.calcNeigh(currentnode.data);
				currentnode.neigh = [];

				// re-formats neighbors to be added back into the fringe
				for (i = 0; i < tempn.length; i++)
				{
					newname = tempn[i].toString();
					currentnode.neigh.push(newname);
					this.add(newname, tempn[i]);

					// keep track of "previous" node to retrieve shortest path to start later
					if (currentnode.depth + 1 < this.data[newname].depth 
						|| this.data[newname].depth == -1)
					{
						this.data[newname].depth = currentnode.depth + 1;
						this.data[newname].prev = current;
					}
				}
			}
		}
	}

	// locates the expression with the shortest string length
	this.findMin = function()
	{
		var key;
		var res;
		var minlength = 100000;
		var minnode = null;

		for (key in this.data)
		{
			res = this.data[key];
			if (res.name.length < minlength)
			{
				minnode = res.name;
				minlength = res.name.length
			}
		}

		return minnode;
	}


	// finds a path from the given node back to the start
	this.findPath = function(endnode)
	{
		var revarr = [];
		var output = [];
		var current = endnode;

		while (this.data[current])
		{
			revarr.push(this.data[current].data);
			current = this.data[current].prev;
		}

		while(revarr.length > 0)
		{
			output.push(revarr.pop());
		}

		return output;
	}

	// ties all together, adds node and initiates the search. 
	// returns path from the start node to minimum node.
	this.searchFrom = function(node, data, maxdepth)
	{
		this.add(node, data, 0);
		this.data[node].depth = 0;
		this.fillToDepth(maxdepth);

		return this.findPath(this.findMin());
	}
}

// interface accessible to the proof stack
function runSearch(ps)
{
	var i;
	var current = ps.stack[ps.stack.length - 1];
	var asearch = new aStarGraph(ps.rs);
	var path = asearch.searchFrom(current.toString(), current, 2);

	for (i = 1; i < path.length; i++)
	{
		ps.push(path[i]);
	}
}

function isExp(node)
{
        if (!node.isInner()) { return false; }
        else if (node.sub.length != 4) { return false; }
        else if (node.sub[1].data != "^{") { return false; }
        else if (node.sub[3].data != "}") { return false; }
        else { return true; }
}

function isProd(node)
{
	if (!node.isInner()) { return false; }
	else if (node.sub.length != 3) { return false; }
	else if (node.sub[1].data != "\\cdot") { return false; }
	else { return true; }
}

function isSum(node)
{
	if (!node.isInner()) { return false; }
	else if (node.sub.length != 3) { return false; }
	else if (node.sub[1].data != "+") { return false; }
	else { return true; }
}


// recursively distributes mulitplication against addition
function distProd(node)
{
	var n1, n2;

	if (isProd(node)) 
	{
		node.sub[0] = distProd(node.sub[0]);
		node.sub[2] = distProd(node.sub[2]);
		if (isSum(node.sub[0]))
		{
			n1 = node.copy();
			n2 = node.copy();
			node.sub[1] = node.sub[0].sub[1];
			n1.sub[0] = n1.sub[0].sub[0];
			n2.sub[0] = n2.sub[0].sub[2];
			node.sub[0] = n1;
			node.sub[2] = n2;
		}
		else if (isSum(node.sub[2]))
		{
			n1 = node.copy();
			n2 = node.copy();
			node.sub[1] = node.sub[2].sub[1];
			n1.sub[2] = n1.sub[2].sub[0];
			n2.sub[2] = n2.sub[2].sub[2];
			node.sub[0] = n1;
			node.sub[2] = n2;
		}
	}
	else if (isSum(node))
	{
		node.sub[0] = distProd(node.sub[0]);
		node.sub[2] = distProd(node.sub[2]);
	}
	return node;
}

// breaks an expression into an array of terms (on '+' or '\cdot' symbol)
function termList(node, test)
{
	var left, right, output = [];
	var i;

	if (!test(node)) { return [node]; }

	left = termList(node.sub[0], test);
	right = termList(node.sub[2], test);

	for (i = 0; i < left.length; i++) { output.push(left[i]); }
	for (i = 0; i < right.length; i++) { output.push(right[i]); }

	return output;
}

// searches an expression for additions and multiplications of numbers
function findNumbers(node)
{
	var n1, n2, temp;

	if (isSum(node))
	{
		n1 = findNumbers(node.sub[0]);
		n2 = findNumbers(node.sub[2]);
		if (n1.isNum() && n2.isNum())
		{
			temp = n1.copy();
			temp.data = (parseInt(n1.data) + parseInt(n2.data)).toString()
			return temp;
		}
		else if (n1.isNum() && n1.data == "0")
		{
			return n2;
		}
		else if (n2.isNum() && n2.data == "0")
		{
			return n1;
		}

		temp = node.copy();
		temp.sub[0] = n1;
		temp.sub[2] = n2;
		return temp;
	}

	if (isProd(node))
	{
		n1 = findNumbers(node.sub[0]);
		n2 = findNumbers(node.sub[2]);
		if (n1.isNum() && n2.isNum())
		{
			temp = n1.copy();
			temp.data = (parseInt(n1.data) * parseInt(n2.data)).toString()
			return temp;
		}
		else if (n1.isNum() && n1.data == "1")
		{
			return n2;
		}
		else if (n2.isNum() && n2.data == "1")
		{
			return n1;
		}

		temp = node.copy();
		temp.sub[0] = n1;
		temp.sub[2] = n2;
		return temp;
	}

	if (isExp(node))
	{
		n1 = findNumbers(node.sub[0]);
		n2 = findNumbers(node.sub[2]);
		
		temp = node.copy();
		temp.sub[0] = n1;
		temp.sub[2] = n2;
		return temp;
	}

	return node;
}


function fact2ToString(fact2)
{
	var i;
	var output = "";

	return JSON.stringify(fact2);

	for (i = 0; i < fact2.length; i++)
	{
		output += fact2.head.toString() + "\t" + fact2.comb.toString() + "\n";
	}

	return output;
}


// sorts and groups terms in a sum by their non-numeric factors and returns a hopefully simplified expression
// note: expecting numeric factors of each term to be "left-most" in the factor in the term
function toPoly(node)
{
	var terms = termList(node, isSum);
	var factors;
	var fact2 = [];
	var i,j,k;
	var oneNode = new FlexibleNode();
	var output = [];
	var current;

	oneNode.data = "1";
	oneNode.toNum();

	for (i = 0; i < terms.length; i++)
	{
		factors = termList(terms[i], isProd);
		if (factors[0].isNum())
		{
			fact2.push({head: factors[0], tail: [], comb: null});
			for (j = 1; j < factors.length; j++)
			{
				fact2[fact2.length - 1].tail.push(factors[j]);
			}
		}
		else
		{
			fact2.push({head: oneNode.copy(), tail: [], comb: null});
			for (j = 0; j < factors.length; j++)
			{
				fact2[fact2.length - 1].tail.push(factors[j]);
			}
		}
		fact2[fact2.length - 1].comb = reformArray(fact2[fact2.length - 1].tail, newProdNode);
		if (fact2[fact2.length - 1].comb == null) { fact2[fact2.length - 1].comb = oneNode.copy(); }
	}

	alert(fact2ToString(fact2));

	arraySort(fact2, function(a,b) {return a.comb.toString() < b.comb.toString(); } );


	k = fact2[0].head;
	current = fact2[0].comb;
	for (i = 1; i < fact2.length; i++)
	{
		if (fact2[i].comb.equalTo(current))
		{
			k = newSumNode(k, fact2[i].head);
		}
		else
		{
			output.push(newProdNode(k, current));
			k = fact2[i].head;
			current = fact2[i].comb;
		}
	}
	output.push(newProdNode(k, current));

	return reformArray(output, newSumNode);
}

function newSumNode(left, right)
{
	var output = new FlexibleNode();

	output.toInner();
	output.sub[1] = new FlexibleNode();
	output.sub[1].toTok();
	output.sub[1].data = "+";
	output.sub[0] = left;
	output.sub[2] = right;

	return output;
}

function newProdNode(left, right)
{
	var output = new FlexibleNode();

	output.toInner();
	output.sub[1] = new FlexibleNode();
	output.sub[1].toTok();
	output.sub[1].data = "\\cdot";
	output.sub[0] = left;
	output.sub[2] = right;

	return output;
}

function newExpNode(left, right)
{
	var output = new FlexibleNode();

	output.toInner();
	output.sub[1] = new FlexibleNode();
	output.sub[1].data = "^{";
	output.sub[1].toTok();
	output.sub[3] = new FlexibleNode();
	output.sub[3].data = "}";
	output.sub[3].toTok();
	output.sub[0] = left;
	output.sub[2] = right;

	return output;
}


// recombines a previsouly broken expression back together using a variable binary operator
function reformArray(terms, joiner)
{
	var i;
	var output;
	output = terms[0];

	for (i = 1; i < terms.length; i++)
	{
		output = joiner(output, terms[i]);
	}

	return output;
}

// converts a expression into an array (sums) of arrays (products) 
function breakDownFactors(node)
{
	var terms = termList(node, isSum);
	var current;
	var temp;
	var wtypes;
	var i, j, k;
	var oneNode = new FlexibleNode();

	oneNode.data = "1";
	oneNode.toNum();

	for (i = 0; i < terms.length; i++)
	{
		temp = termList(terms[i], isProd);
		if (temp.length > 0)
		{
			wtypes = [];
			for (j = 0; j < temp.length; j++)
			{
				wtypes.push({data: isExp(temp[j]) ? temp[j].sub[0] : temp[j], 
					count: isExp(temp[j]) ? temp[j].sub[2] : oneNode.copy()});
			}
			arraySort(wtypes, function(a,b) {return a.data.toString() < b.data.toString(); } );

			temp = [];
			k = wtypes[0].count;
			current = wtypes[0].data;
			for (j = 1; j < wtypes.length; j++)
			{
				if (wtypes[j].data.equalTo(current))
				{
					k = newSumNode(k, wtypes[j].count);
				}
				else
				{
					temp.push(oneNode.equalTo(k) ? current : newExpNode(current, k));
					k = wtypes[j].count;
					current = wtypes[j].data;
				}
			}
			temp.push(oneNode.equalTo(k) ? current : newExpNode(current, k));
			terms[i] = reformArray(temp, newProdNode);
		}
	}

	return reformArray(terms, newSumNode);
}

// converts the expression at the top of the stack into a more polynomial form, with terms somewhat simplified
// similar factors in each term will be grouped into exponents
function groupExponent(ps)
{
	var current = ps.stack[ps.stack.length - 1];
	var newnode = breakDownFactors(current.copy());
	
	if (!newnode.equalTo(current))
	{
		ps.push(newnode);
	}
}

// converts the expression at the top of the stack into a sum of products (applying distributivity)
function sumOfProd(ps)
{
	var current = ps.stack[ps.stack.length - 1];
	var newnode = distProd(current.copy());

	if (!newnode.equalTo(current))
	{
		ps.push(newnode);
	}
}

// performs additions and multiplications, simplifying numeric expressions
function numericSimp(ps)
{
	var current = ps.stack[ps.stack.length - 1];
	var newnode = findNumbers(current.copy());

	if (!newnode.equalTo(current))
	{
		ps.push(newnode);
	}
}

// converts an expression into simplified polynomial type expression.
function termsAsPoly(ps)
{
	var current = ps.stack[ps.stack.length - 1];
	var newnode = toPoly(current.copy());

	if (!newnode.equalTo(current))
	{
		ps.push(newnode);
	}
}

