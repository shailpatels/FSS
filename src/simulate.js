
var Q = [],
	is_starting = true,
	prev = [],
	outbuff = "",
	inbuff = "",
	index = 0,
    char_index = 0,
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

function filter(node, test){
	let ret = [];
	let out = [];
	let i = 0;
    let arrows = node.connected_arrows;

    
    for(arr of arrows){
        //if the node is entering pointing to this, skip it
        if (arr.end_node === node && !arr.is_self )
            continue;
        
        if(arr.IF === test || arr.IF === ""){
            ret.push(arr.end_node);
            out.push(arr.OUT);
        }
    }
        
	return [ret, out];
}

function step(start_ = 0){
    let full_word = document.getElementById("is_full_word").checked;

	if(nodes.length === 0)
		return;

	if (is_starting){
		Q.push(nodes[start_]);
		is_starting = false;
	}else{
		for(u of prev){
			u.is_active = false;
		}
		prev = [];
        
        if( (index + 1) < tds.length )
            tds[index + 1].innerText += outbuff;

        outbuff = "";

        highlightNext();
	}

    let connections = [];
	tds = document.getElementsByTagName("td");
    if(Q.length === 0)
    	return;

	for(u of Q){
		if(typeof u === 'undefined')
			break;

		u.is_active = true;
		prev.push(u);
    
        let f = ""; 
        if(tds.length > 0 && index < tds.length){
            f = full_word ? tds[index].innerText : tds[index].innerText[char_index];
        }else{
            addRow(false);
        }
        
		
		let tmp = filter(u, f);
		connections = tmp[0];

        outbuff = tmp[1].toString();
		connections = [...new Set(connections)];
    }

    Q = connections;     
    char_index += 1;
}

function initTable(){
    if(table === null)
        table = document.getElementById("io_table");
    
    table.style.left = (canvas.width + canvas.offsetLeft + 10) + "px"; 
    table.style.top = (canvas.offsetTop) + "px";
}

function addRow(add_in = true){
    let txt = "";
    let full_word = document.getElementById("is_full_word").checked;
    let is_first = true;
    let tmp_index = 0;
	tds = document.getElementsByTagName("td");
    if(add_in){
        txt = document.getElementById("string_input").value;  
        if ( txt === "")
            return;
        
        is_first = tds.length === 0;
        
        if(!is_first)
            tmp_index = tds.length;
    } 
    
    let tmp = document.createElement("tr");
    let td_a = document.createElement("td"); //in col

    if(!full_word){
        for(var i = 0; i < txt.length; i++){
            let highlight = document.createElement("span");
            if (i == 0 && is_first)
                highlight.setAttribute("class", "highlight");

            highlight.setAttribute("id", tmp_index.toString() + "_"  + i.toString());
            highlight.appendChild( document.createTextNode(txt[i]) );
            td_a.appendChild(highlight);
        }
    }else{
        let highlight = document.createElement("span");
        if(is_first)
            highlight.setAttribute("class", "highlight");

        highlight.appendChild( document.createTextNode(txt) );
        td_a.appendChild(highlight);
        highlight.setAttribute("id", tmp_index.toString() + "_0");
    }


    let td_b = document.createElement("td"); //out col
    txt = document.createTextNode("");
    td_b.appendChild(txt);

    tmp.appendChild(td_a);
    tmp.appendChild(td_b);
    
    table.appendChild(tmp);
}

function highlightNext(){
    let h = document.getElementsByClassName("highlight");
    if (h.length === 0){
        return;
    }

    h = h[0];

    h.setAttribute("class","");
    let id = parseInt(h.getAttribute("id").split("_")[1], 10);
    let next = document.getElementById( index.toString() + "_" + (id+1).toString() );
        
    
    if( next === null || typeof next === "undefined" ){
        index += 2;
        char_index = 0;
        let ref = document.getElementById( index.toString() + "_0");
        if( ref === null )
            return;

        ref.setAttribute("class", "highlight");        
        return;
    }

    next.setAttribute("class", "highlight"); 
}

if(typeof module !== 'undefined'){
    var nodes = [];
    let Graph = require('./graph.js');
    var graph = new Graph();
    module.exports = { step, nodes, Q};
}
