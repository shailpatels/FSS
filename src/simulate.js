
var Q = [],
	is_starting = true,
	prev = [],
	outbuff = "",
	inbuff = "",
	index = 0,
    char_index = 0,
	tds = getTableCells(),
    full_word = false;

/**
* collect all the table cells ignoring the ones used in the transition table
*
* @param {Boolean} external - if this is being ran from an external app
* @returns {Array} - Array of HTML elements
*/
function getTableCells(external){
    if (external)
        return [];

    let tmp  = document.getElementsByTagName("td") || [];
    let ret = [];
    for (t of tmp){
        if (t.className === "t_tbl")
            continue;

        ret.push(t);
    }
    return ret;
}


function resetSim(){
	Q = [];
	is_starting = true;
	for (u of prev)
		u.is_active = false;

	index = 0;
	outbuff = inbuff = "";

    clearIOTable();
    clearTransitionTable();

    resetCanvas();
}

function clearTransitionTable(){
    document.getElementById("t_table").innerHTML = 
        "<tr>\
            <th> State </th>\
            <th> Input </th>\
            <th> Output </th>\
            <th> Next State </th>\
        </tr>"
}

function clearIOTable(){
    document.getElementById("io_table").innerHTML = 
        "<tbody><tr><th>Input</th><th>Output</th></tr></tbody>";
}

//instead of resetting the entire sim, only start back at state0
function resetFSS(){
    Q = [];

    outbuff = inbuff = "";
    is_starting = true;
    moved_next_row = false;
}


/**
* given an array, shuffle its contents
*
* @param {Array}
* @return {Array}
* SRC: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
*/
function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


/**
filter which nodes to visit based on a string to test against

@param {Node} node - the node to start from
@param {test} String - the string to test arrow IF conditionals against
@param {shuffle} Boolean - shuffle the output string array

@returns {Object} array containing an array of nodes to visit and an array of strings from the arrow OUTs
**/
function filter(node, test, shuffle=true){
	let ret = [];
	let out = [];
	let i = 0;
    let arrows = node.connected_arrows;

    
    for(arr of arrows){
        //if the node is entering pointing to this, skip it
        if( arr.isDeparting(node) )
            continue;
        
        if(arr.IF === test || arr.IF === ""){
            ret.push(arr.end_node);
            out.push(arr.OUT);
        }
    }

    if(shuffle)
        out = shuffleArray(out);
        
	return [ret, out];
}

var moved_next_row = false;

/**
* function that moves the simulation forward by one transition
* if theres a valid input table will move to the next input otherwise uses an empty string 
*
* @param {Bool|void} external - is the simulation being ran from an external app
*/
function step(external = false){
    API.call("step_simulation");
    full_word = external ? false : document.getElementById("is_full_word").checked;
    
    for(u of prev)
        u.is_active = false;


	if(nodes.length === 0)
		return;

	if (is_starting){
		Q.push(nodes[0]);
		is_starting = false;
	}else{
		prev = [];
        if( (index + 1) < tds.length && !external)
            tds[index + 1].innerText += outbuff;


        API.call("simulate_write", outbuff);
        outbuff = "";
        moved_next_row = external ? API.call("is_finished") : highlightNext();
	}

    let connections = [];
	tds = getTableCells(); 
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
        }else if(!external){
            addRow(false);
        }else{
            f = API.call("request_input")[0];
        }
        
		let tmp = filter(u, f);
		connections = tmp[0];

        outbuff += tmp[1].toFlatString();
		connections = [...new Set(connections)];
    }

    Q = connections;     
    char_index += 1;
    
    if (moved_next_row){
        resetFSS();
        char_index -= 1;
    }
}


/**
* add a new row to the input list from the input textarea on the page
*
* @param {Boolean} add_in - if the input textarea should be read and added to the input table
*/
function addRow(add_in = true){
    let txt = "";
    let full_word = document.getElementById("is_full_word").checked;
    let is_first = true;
    let tmp_index = 0;
	var table = document.getElementById("io_table");
	tds = getTableCells(); 

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

//move the highlight from the current word/char to the next in the input list
//returns if moved to the next row
function highlightNext(){
    let h = document.getElementsByClassName("highlight");
    if (h.length === 0){
        return false;
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
            return true;

        ref.setAttribute("class", "highlight");        
        return true;
    }

    next.setAttribute("class", "highlight"); 
    return false;
}

if(typeof module !== 'undefined'){
    var nodes = [];
    const _A = jest.requireActual('./api.js');
    var API = _A.API_OBJ.getInstance();

    module.exports = { step };
    _A.API_OBJ.clear();
}
