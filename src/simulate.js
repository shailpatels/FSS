import {API} from './api.js';
import {canvasManager} from './canvasManager.js';
import {resetCanvas} from './canvas.js';

var simManager = (function(){
    var instance = null;
 
    return {
        clear : function(){
            instance = null;
        },

        getInstance: function () {
            if (!instance) {
                instance = new __SIM_STATE();
            }
            return instance;
        }

    };
})();


class __SIM_STATE{
    constructor(){
        this.Q = [],
        this.is_starting = true,
        this.prev = [],
        this.outbuff = "",
        this.inbuff = "",
        this.index = 0,
        this.char_index = 0,
        this.tds = getTableCells(),
        this.is_full_word = false;
        this.moved_next_row = false;
    }
}


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
    for (let t of tmp){
        if (t.className === "t_tbl"){
            continue;
        }

        ret.push(t);
    }
    return ret;
}


function resetSim(){
	simManager.clear();

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
* filter which nodes to visit based on a string to test against
*
* @param {Node} node - the node to start from
* @param {test} String - the string to test arrow IF conditionals against
* @param {shuffle} Boolean - shuffle the output string array
*
* @returns {Object} array containing an array of nodes to visit and an array of strings from the arrow OUTs
*/
function filter(node, test, shuffle=true){
	let ret = [];
	let out = [];
	let i = 0;
    let arrows = node.connected_arrows;

    
    for(let arr of arrows){
        //if the node is entering pointing to this, skip it
        if( arr.isDeparting(node) ){
            continue;
        }
        
        if(arr.IF === test || arr.IF === ""){
            ret.push(arr.end_node);
            out.push(arr.OUT);
        }
    }

    if(shuffle){
        out = shuffleArray(out);
    }
        
	return [ret, out];
}


/**
* function that moves the simulation forward by one transition
* if theres a valid input table will move to the next input otherwise uses an empty string 
*
* @param {Boolean|null} external - is the simulation being ran from an external app
*/
function step(external = false){
    let SM = simManager.getInstance();
    let CM = canvasManager.getInstance();

    API.call("step_simulation");
    SM.is_full_word = external ? false : document.getElementById("is_full_word").checked;
    
    for(let u of SM.prev){
        u.is_active = false;
    }


	if(CM.nodes.length === 0){
		return;
    }

	if (SM.is_starting){
		SM.Q.push(CM.nodes[0]);
		SM.is_starting = false;
	}else{
		SM.prev = [];
        if( (SM.index + 1) < SM.tds.length && !SM.external){
            SM.tds[SM.index + 1].innerText += SM.outbuff;
        }


        API.call("simulate_write", SM.outbuff);
        SM.outbuff = "";
        SM.moved_next_row = external ? API.call("is_finished") : highlightNext();
	}

    let connections = [];
	SM.tds = getTableCells(); 
    if(SM.Q.length === 0){
    	return;
    }

	for(let u of SM.Q){
		if(typeof u === 'undefined'){
			break;
        }

		u.is_active = true;
		SM.prev.push(u);
    
        let f = ""; 
        if(SM.tds.length > 0 && SM.index < SM.tds.length){
            f = SM.full_word ? SM.tds[SM.index].innerText : SM.tds[SM.index].innerText[SM.char_index];
        }else if(!SM.external){
            addRow(false);
        }else{
            f = API.call("request_input")[0];
        }
        
		let tmp = filter(u, f);
		connections = tmp[0];

        SM.outbuff += tmp[1].toFlatString();
		connections = [...new Set(connections)];
    }

    SM.Q = connections;     
    SM.char_index += 1;
    
    if (SM.moved_next_row){
        resetFSS();
        SM.char_index -= 1;
    }
}


/**
* add a new row to the input list from the input textarea on the page
*
* @param {Boolean|null} add_in - if the input textarea should be read and added to the input table
*/
function addRow(add_in = true){
    let txt = "";
    let full_word = document.getElementById("is_full_word").checked;
    let is_first = true;
    let tmp_index = 0;
	let table = document.getElementById("io_table");
    let SM = simManager.getInstance();

	SM.tds = getTableCells(); 

    if(add_in){
        txt = document.getElementById("string_input").value;  
        if ( txt === ""){
            return;
        }
        
        is_first = tds.length === 0;
        
        if(!is_first){
            tmp_index = tds.length;
        }
    } 
    
    let tmp = document.createElement("tr");
    let td_a = document.createElement("td"); //in col

    if(!full_word){
        for(var i = 0; i < txt.length; i++){
            let highlight = document.createElement("span");
            if (i == 0 && is_first){
                highlight.setAttribute("class", "highlight");
            }

            highlight.setAttribute("id", tmp_index.toString() + "_"  + i.toString());
            highlight.appendChild( document.createTextNode(txt[i]) );
            td_a.appendChild(highlight);
        }
    }else{
        let highlight = document.createElement("span");
        if(is_first){
            highlight.setAttribute("class", "highlight");
        }

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
    let SM = simManager.getInstance();
    let h = document.getElementsByClassName("highlight");
    if (h.length === 0){
        return false;
    }

    h = h[0];

    h.setAttribute("class","");
    let id = parseInt(h.getAttribute("id").split("_")[1], 10);
    let next = document.getElementById( index.toString() + "_" + (id+1).toString() );
        
    
    if( next === null || typeof next === "undefined" ){
        SM.index += 2;
        SM.char_index = 0;
        let ref = document.getElementById( index.toString() + "_0");
        if( ref === null ){
            return true;
        }

        ref.setAttribute("class", "highlight");        
        return true;
    }

    next.setAttribute("class", "highlight"); 
    return false;
}


export {
    simManager,
    step
}