
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


