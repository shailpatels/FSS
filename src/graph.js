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
				output += v.toString() + " "

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

function printGraph(){
	graph.print();
}

function save(){
	data = [];
	for(u of graph.graph.keys() ){
		let connections = [];
		for(v of graph.getConnections(u)){
			connections.push( v.serialize() );
		}

		let tmp = {
			"node" : u.serialize(),
			"arrs" : serializeArrows(u.connected_arrows)
		};
		data.push(tmp);
	}

	let json = JSON.stringify(data);
	localStorage.setItem('data', json);
}


function rebuildNode(tmp_data){
	let tmp = new Node();

	tmp.connected_arrows = tmp_data.connected_arrows;
	tmp.is_active = tmp_data.is_active;
	tmp.label = tmp_data.label;
	tmp.pos = new Point(tmp_data.pos.X, tmp_data.pos.Y);

	return tmp;
}

function rebuildArrow(tmp_data){
	let tmp = new Arrow(new Node(),new Node(),false,0);


	tmp.start_pos = new Point(tmp_data.start_pos.X,tmp_data.start_pos.Y);
	tmp.end_pos = new Point(tmp_data.end_pos.X, tmp_data.end_pos.Y);
	tmp.t = 0.5;
	tmp.ctrl_pos = new Point(tmp_data.ctrl_pos.X,tmp_data.ctrl_pos.Y);
	tmp.mouse_over = tmp_data.mouse_over;
	//this.start_node = tmp_data.start_node;
	//this.end_node = end;
	tmp.is_self = tmp_data.is_self;
	tmp.angle_offset = tmp_data.angle_offset;
	tmp.is_active = tmp_data.is_active;

	return tmp;
}

function doesNodeExist(label){
	for(var i = 0; i < nodes.length; i++)
		if(nodes[i].label === label)
			return i;

	return -1;
}


function load(){
	let json = localStorage.getItem('data');

	if(json === null)
		return;

	resetCanvas();
	let data = JSON.parse(json);

	for (key of data){
		if(doesNodeExist (key.label) < 0 ){
			let node_data = key.node;
			let node = rebuildNode(node_data);

			addNewNode(node);
		}
	}

	for (key of data){
		let arrow_data = key.arrs;
		//we need to find the outgoing arrow

		for (arrow of arrow_data){
			if(arrow.end_node.label == key.node.label)
				continue;

			let arr = rebuildArrow(arrow);
			let start_index = doesNodeExist(key.node.label);
			let end_index = doesNodeExist(arrow.end_node.label);

			if(start_index < 0 || end_index < 0)
				continue;

			arr.start_node = nodes[start_index];

			nodes[start_index].connected_arrows.push(arr);
			nodes[end_index].connected_arrows.push(arr);

			placeNewArrow(arr);
		}

	}
}

if(typeof module !== 'undefined')
	module.exports = Graph;
