class Graph{

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

	addVertex(v){
		this.graph.set(v, []);
		this.size ++;
	}

	//add a directed connection from u to v
	addEdge(start, end){
		this.graph.get(start).push(end);
	}
}

if(typeof module !== 'undefined')
	module.exports = Graph;