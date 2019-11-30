
var Q = [];
var is_starting = true;
var prev = [];

function step(start_ = 0){

	if (is_starting){
		Q.push(nodes[start_]);
		is_starting = false;
	}else{
		for(u of prev){
			u.is_active = false;
		}
		prev = [];
	}

	if(Q.length == 0)
		return;

	connections = [];
	for(u of Q){

		u.is_active = true;
		prev.push(u);
		console.log(u.toString());
		connections = connections.concat(connections, graph.getConnections(u));

	}

	Q = connections;
}