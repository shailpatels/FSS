
var Q = [];
var is_starting = true;

function step(start_ = 0){

	if (is_starting){
		Q.push(start_);
		is_starting = false;
	}

	if(Q.length == 0)
		return;

	let starting_node = nodes[Q.shift()];
	starting_node.is_active = true;

	let connections = graph.getConnections(starting_node);

	console.log(starting_node.toString());
	for (v of connections){
		Q.push(v);
	}
}