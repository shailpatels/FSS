
var Q = [],
	is_starting = true,
	prev = [],
	outbuff = "",
	inbuff = "",
	index = 0,
	table = document.getElementById("io_table"),
	tds = document.getElementsByTagName("td");

function resetSim(){
	Q = [];
	is_starting = true;
	for (u of prev)
		u.is_active = false;

	index = 0;
	outbuff = "";
	inbuff = "";
}

function printList(l){
    let str = "";
    for (n of l){
       str += n.label + " "; 
    }
    console.log(str);
}

function filter(connections, test){
	let ret = [];
	let out = [];
	let arrows = u.connected_arrows;
	for(arr of arrows){
		if(arr.IF === test || arr.IF === ""){
			ret.push(connections[0]);
			out.push(arr.OUT);
		}
	}
	return [ret, out];
}

function step(start_ = 0){
	if(nodes.length === 0)
		return;
	//console.log(tds[0].innerText);
	if (is_starting){
		Q.push(nodes[start_]);
		is_starting = false;
	}else{
		//console.log(prev);
		for(u of prev){
			u.is_active = false;
		}
		prev = [];
	}

    let connections = [];
    if(Q.length === 0)
    	return;

	for(u of Q){

		u.is_active = true;
		prev.push(u);
		
		console.log(u);
		let tmp = filter(graph.getConnections(u), tds[index].innerText);
		connections = connections.concat(connections, tmp[0]);

		tds[index + 1].innerText = tmp[1].toString();
		connections = [...new Set(connections)];
		//console.log(connections);
	}
    
    //console.log(connections);
    Q = connections;     
}

if(typeof module !== 'undefined'){
    var nodes = [];
    let Graph = require('./graph.js');
    var graph = new Graph();
    module.exports = { step, nodes, Q};
}
