export class Graph{
    public graph: any;
    public size: any;

	constructor(){
		this.graph = new Map();
		this.size = 0;
	}

	print(){
		document.getElementById("graph").innerHTML = "";

		let output = "";
		let keys = this.graph.keys();
		for (var u of keys){
			output += u.toString() + ": "
			let connections = this.graph.get(u);
			for (var v of connections)
				output += v.toString()

			output += "<br>"
		}

		document.getElementById("graph").innerHTML += output;
	}

	/**
	@param {number} v - index of state as a new vertex to add to graph
	**/
	addVertex(v){
		this.graph.set(v, []);
		this.size ++;
	}

	/**
	create a new directed edge between two vertices

	@param {number} start
	@param {number} end
	**/
	addEdge(start, end){
		this.graph.get(start).push(end);
	}

	/**
	@param {number} v) - index of vertex to delete
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
}