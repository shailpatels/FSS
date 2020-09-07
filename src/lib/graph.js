import {canvasManager} from '../canvasManager.js';
import {getTableCells} from '../simulate.js';
import {deserializeNode, deserializeArrow} from '../elements.js';
import {API} from '../api.js';

class Graph{

	constructor(){ 
		this.graph = new Map();
		this.size = 0;
	}

    getKeys(){
        return this.graph.keys();
    }

	/**
	* @param {Node} v - index of state as a new vertex to add to graph
	*/
	addVertex(v){
		this.graph.set(v, []);
		this.size ++;
	}

	/**
	* create a new directed edge between two vertices
    *
	* @param {Node} start
	* @param {Node} end
	*/
	addEdge(start, end){
		this.graph.get(start).push(end);
	}

	/**
	* @param {Node} v_ - node to delete
	*/
	deleteVertex(v_){
		this.graph.delete(v_);

		let keys = this.graph.keys();
		for (let u of keys){
			let connections = this.graph.get(u);
			let index = 0;
			for (let v of connections){
				if(v === v_){
					connections.splice(index, 1);
                }

				index ++;
			}
		}

		this.size --;

	}

	/**
	* given two nodes delete the edge between them if it exists
    *
	* @param {Node} u - starting node of edge
	* @param {Node} v - ending node of edge 
	*/
	deleteEdge(u, v){
		let keys = this.graph.keys();
		let connections = this.graph.get(u);

        const index = connections.indexOf(v);
        connections.splice(index,1);
	}


	getConnections(node){
		return this.graph.get(node);
	}
}

function printGraph(){
	graph.print();
}

function buildText(str){
    return `
        <span>
            S<sub>${str}</sub>
        </span>
    `;
}

/**
* @param {Node} Node to start from
* @param {String} val what value to read from (IF,OUT,NEXT STATE label)
*/
function buildTransitionTableHelper(key, val){
    let arrs = key.connected_arrows;
    let output = `<td class='t_tbl'>`;

    for(let arr of arrs){
        if(arr.isDeparting(key)){
            continue;
        }

        let data = null;
        if(val === "IF"){
            data = arr.IF;
        }else if(val === "OUT"){
            data = arr.OUT;
        }else{
            data = buildText(arr.end_node.label);
        }

        output += `${data}`;
        output += `<br>`

    }

    return output;
}


/**
* Construct a transition table based on the FSM
* @param {String|null} tgt_element to draw too
* @returns {String} HTML output
*/
function buildTransitionTable(tgt_element = null){
    let CM = canvasManager.getInstance();

    let tbl = null;
    if(tgt_element){
        tbl = document.getElementById(tgt_element);
    }

    let keys = CM.graph.getKeys();
    

    let output = `
        <tr>
            <th> State </th>
            <th> Input </th>
            <th> Output </th>
            <th> Next State </th>
        </tr>
    `;

    for(let key of keys){
        output += 
            `<tr>
                <td class='t_tbl'>
                    ${buildText(key.label)}
                </td>
        `;
        
        output += buildTransitionTableHelper(key, "IF");
        output += buildTransitionTableHelper(key, "OUT");
        output += buildTransitionTableHelper(key, "");
        output += "</tr>";
    }

    if(tbl){
        tbl.innerHTML = output;
    }

    return output;   
}


/**
* Save the FSS state into localstorage
*/
function save(){
    let CM = canvasManager.getInstance();
    let map = canvasManager.getInstance().map;

    let nodes = [];
    for(let x of CM.nodes){
        nodes.push(x.serialize());
    }

    let arrows = [];
    for(let x of CM.arrows){
        arrows.push(x.serialize());
    }

	localStorage.setItem('object_map', JSON.stringify(map));
    localStorage.setItem('nodes', JSON.stringify(nodes));
    localStorage.setItem('arrows', JSON.stringify(arrows));   

    if(!API.is_external){
        saveIO();
    }
}


function saveIO(){
    let ts = getTableCells();
    let ret = [];

    let i = 0;
    for (let t of ts ){
        ret.push({ 
            "value" : t.textContent,
            "full_word" : t.childNodes.length === 1,
            "input" : i % 2 == 0
        });
        i ++;
    }

    localStorage.setItem('io_table', JSON.stringify(ret));
}


function rebuildIOTable(data){
    let tgt = document.getElementById("io_table");
    
    let current_row = null;
    let is_first = true;

    let row_index = -1;
    for (let obj of data){
        if (obj.input ){
            current_row = document.createElement("tr");
            row_index ++; 
        }

        let td_a = document.createElement("td");
        if( obj.input ){
        if ( obj.full_word ){
            let highlight = document.createElement("span");
            if ( is_first )
                highlight.setAttribute("class", "highlight");

            highlight.setAttribute("id", row_index.toString() + "_0"); 
            highlight.appendChild( document.createTextNode( obj.value ) );
            td_a.appendChild(highlight);
        } else {
            for(var i = 0; i < obj.value.length; i++){
                let highlight = document.createElement("span");
                if (i == 0 && is_first)
                    highlight.setAttribute("class", "highlight");

                highlight.setAttribute("id", row_index.toString() + "_" + i.toString());
                highlight.appendChild( document.createTextNode( obj.value[i] ) );
                td_a.appendChild( highlight );
            }
        }
        }else{
            let td_a = document.createElement("td");
            td_a.appendChild( document.createTextNode( obj.value ) );
        }
            
        
        current_row.appendChild( td_a );
        tgt.appendChild(current_row);
        is_first = false; 
    }
}


function clearIOTable(){
    let tgt = document.getElementById("io_table");

    tgt.innerHTML = 
    `<tr>
        <th> Input </th>
        <th> Output </th>
    </tr>`;
}


function load(){
	let CM = canvasManager.getInstance();
    CM.resetCanvas();

    //toggle auto save so re-adding elements doesn't cause problems
    CM.auto_save = !CM.auto_save;

    let objects = localStorage.getItem('object_map');
    let nodes = localStorage.getItem('nodes');
    let arrows = localStorage.getItem('arrows');

    if(!objects || !nodes || !arrows){
        return;
    }

    nodes = JSON.parse(nodes);
    arrows = JSON.parse(arrows);
    objects = JSON.parse(objects);

    //rebuild nodes
    for(let n of nodes){
        let new_node = deserializeNode(n);
        CM.addNewNode(new_node);
    }

    for(let a of arrows){
        let new_arrow = deserializeArrow(a);
        //try and find its start and end nodes

        let start = CM.getObjFromID(new_arrow.start_node);
        let end = CM.getObjFromID(new_arrow.end_node);

        if(!start || !end){
            throw 'Failed to find Arrow starting and or ending node from save data';
        }

        CM.addNewArrow(start,end);
        let last = CM.arrows[CM.arrows.length-1];

        for(let prop in last){
            if(prop === "start_node" || prop === "end_node"){
                continue;
            }

            last[prop] = new_arrow[prop];
        }

    }

    if(!API.is_external){
        let io_table = localStorage.getItem('io_table');
        if(!io_table){
            return;
        }

        rebuildIOTable(JSON.parse(io_table));
    }
    //save the newly loaded data
    save();
    CM.auto_save = !CM.auto_save;
}

export{
    Graph,
    buildTransitionTable,
    save,
    load,
    clearIOTable
}