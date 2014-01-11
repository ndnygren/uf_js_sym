

function asNode(input)
{
	this.name = input;
	this.data = null;
	this.neigh = null;
	this.depth = -1;
	this.prev = "";
}

function aStarGraph(rules)
{
	this.fringe = [];
	this.data = {};
	this.rs = rules;

	this.calcNeigh = function(input)
	{
		return this.rs.findMatches(input);
	}

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
			if (currentnode.depth < maxdepth && currentnode.neigh == null)
			{
				tempn = this.calcNeigh(currentnode.data);
				currentnode.neigh = [];
				for (i = 0; i < tempn.length; i++)
				{
					newname = tempn[i].toString();
					currentnode.neigh.push(newname);
					this.add(newname, tempn[i]);

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

	this.searchFrom = function(node, data, maxdepth)
	{
		this.add(node, data, 0);
		this.data[node].depth = 0;
		this.fillToDepth(maxdepth);

		return this.findPath(this.findMin());
	}
}

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


