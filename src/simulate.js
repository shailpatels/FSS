
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
	let i = 0;
	for(arr of arrows){
		if(arr.IF === test || arr.IF === ""){
			ret.push(connections[i]);
			out.push(arr.OUT);
		}
		i++;
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
        tds[index + 1].innerText = outbuff;
        outbuff = "";
	}

    let connections = [];
    if(Q.length === 0)
    	return;

	for(u of Q){
		if(typeof u === 'undefined')
			break;

		u.is_active = true;
		prev.push(u);
    
        let f = ""; 
        if(tds.length > 0)
            f = tds[index].innerText;
        else
            addRow(false);
		
		let tmp = filter(graph.getConnections(u), f);
		connections = tmp[0];

        outbuff = tmp[1].toString();
		connections = [...new Set(connections)];
	}
    
    //console.log(connections);
    Q = connections;     
}

function initTable(){
    if(table === null)
        table = document.getElementById("io_table");
    
    table.style.left = (canvas.width + canvas.offsetLeft + 10) + "px"; 
    table.style.top = (canvas.offsetTop) + "px";
}

function addRow(add_in = true){
    let txt = "";
    if(add_in){
        txt = document.getElementById("string_input").value;  
        if ( txt === "")
            return;
    } 
    
    let tmp = document.createElement("tr");
    let td_a = document.createElement("td");
    let td_b = document.createElement("td");

    txt = document.createTextNode(txt);
    td_a.appendChild(txt);
    txt = document.createTextNode("");
    td_b.appendChild(txt);

    tmp.appendChild(td_a);
    tmp.appendChild(td_b);
    

    table.appendChild(tmp);
}

if(typeof module !== 'undefined'){
    var nodes = [];
    let Graph = require('./graph.js');
    var graph = new Graph();
    module.exports = { step, nodes, Q};
}
