class Graph{

	constructor(){ 
		this.graph = new Map();
		this.size = 0;
	}

	/**
	print the graph for debugging, either to the DOM or the console

	@param {boolean} to_console
	**/
	print(to_console = false){
		document.getElementById("graph").innerHTML = "";

		let output = "";
		let keys = this.graph.keys();
		for (var u of keys){
			output += u.toString() + ": ";
			let connections = this.graph.get(u);
			for (var v of connections)
				output += v.toString()

			output +=  to_console ? "\n" : "<br>";
		}

		if(to_console)
			console.log(output);
		else
			document.getElementById("graph").innerHTML += output;
	}

	/**
	@param {Node} v - index of state as a new vertex to add to graph
	**/
	addVertex(v){
		this.graph.set(v, []);
		this.size ++;
	}

	/**
	create a new directed edge between two vertices

	@param {Node} start
	@param {Node} end
	**/
	addEdge(start, end){
		this.graph.get(start).push(end);
	}

	/**
	@param {Node} v) - node to delete
	**/
	deleteVertex(v_){
		this.graph.delete(v_);

		let keys = this.graph.keys();
		for (var u of keys){
			let connections = this.graph.get(u);
			let index = 0;
			for (var v of connections){
				if(v === v_)
					connections.splice(index, 1);

				index ++;
			}
		}

		this.size --;

	}

	/**
	given two nodes delete the edge between them if it exists

	@param {Node} u) - starting node of edge
	@param {Node} v) - ending node of edge 
	**/
	deleteEdge(u, v){
		let keys = this.graph.keys();
		let connections = this.graph.get(u);

		connections.remove(v);
	}

	getConnections(node){
		return this.graph.get(node);
	}
}

if(typeof module !== 'undefined')
	module.exports = Graph;
