class Graph{

	constructor(){ 
		this.graph = new Map();
		this.size = 0;
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
	@param {Node} v - node to delete
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

	@param {Node} u - starting node of edge
	@param {Node} v - ending node of edge 
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
//end class

function buildTransitionTable(){
    let tbl = document.getElementById("t_table");
    let keys = this.graph.graph.keys();
    
    function buildText(str){
        let ret = document.createElement("span");
        ret.innerHTML = "S<sub>" + str + "</sub>";
        return ret;
    }

    for(key of keys){
        console.log(key);
        let tmp = document.createElement("tr");
        let td_tmp = document.createElement("td");
        td_tmp.setAttribute("class", "t_tbl");
        tmp.appendChild( td_tmp.appendChild( buildText(key.label))); 
        tbl.appendChild(tmp);
        let arrs = key.connected_arrows;
        let td = document.createElement("td");
        td.setAttribute("class", "t_tbl");

        for(arr of arrs){
            if(arr.isDeparting(key))
                continue;
            td.appendChild( document.createTextNode(arr.IF));
            td.appendChild( document.createElement("br") );
            tmp.appendChild( td );
        }
        
        td = document.createElement("td");
        td.setAttribute("class", "t_tbl");

        for(arr of arrs){
            if(arr.isDeparting(key))
                continue;
            td.appendChild( document.createTextNode(arr.OUT));
            td.appendChild( document.createElement("br") );
            tmp.appendChild( td );
        }
            
        td = document.createElement("td");
        td.setAttribute("class", "t_tbl");

        for(arr of arrs){
            if(arr.isDeparting(key))
                continue;
            td.appendChild( buildText(arr.end_node.label) );
            td.appendChild( document.createElement("br") );
            tmp.appendChild( td );
        }
        tbl.appendChild(tmp);
    }
    
}

var file_count = 0;
function save(){
	data = [];
	for(u of graph.graph.keys() ){
		let tmp = {
			"node" : u.serialize(),
            "connected_arrows" : serializeArrows(u.connected_arrows)
		};
		data.push(tmp);
	}

    data.push( saveIO() );

	let json = JSON.stringify(data);
	localStorage.setItem('data', json);
    file_count ++;
}

function saveIO(){
    let ts = getTableCells();
    let ret = [];

    let i = 0;
    for ( t of ts ){
        ret.push( { "value" : t.textContent,
                    "full_word" : t.childNodes.length === 1,
                    "input" : i % 2 == 0
                  });

        i++;
    }

    return {"io_table" : ret }; 
}


function fileManager(){
    for(var i = 0; i < 10; i++){
        if(localStorage.getItem('file-' + i.toString()) === null)
            break;

        file_count ++;
    } 
    
    if(file_count === 0)
        document.getElementById("loadbtn").disabled = true;
}


function rebuildNode(data){
    let ret = new Node();

    for (var property in ret)
        ret[property] = data[property]; 
    
    ret.connected_arrows = []; 
    addNewNode(ret);
}

function rebuildArrow(data){
    let arr = new Arrow(new Node(), new Node(), false, 0.0); 
    
    for (property in data){
        if (property == "start_node" || property == "end_node"){
            arr[property] = JSON.parse(data[property]); 
            continue;
        }
        
        arr[property] = data[property];
    }
    
    for (n of nodes){
        if(n.label === arr.start_node.label){
            n.connected_arrows.push(arr);
            arr.start_node = n;
        }
        
        if(n.label === arr.end_node.label){
            n.connected_arrows.push(arr);
            arr.end_node = n;
        }
    } 
    
    placeNewArrow(arr); 
}


function doesNodeExist(label){
	for(var i = 0; i < nodes.length; i++)
		if(nodes[i].label === label)
			return i;

	return -1;
}


function rebuildIOTable(data){
    let tgt = document.getElementById("io_table");

    
    let current_row = null;
    let is_first = true;

    let row_index = -1;
    data = data.io_table;
    for ( obj of data){
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


function load(f = 0){
	let json = localStorage.getItem('data');
	if(json === null)
		return;

	resetCanvas();
    
    let data = JSON.parse(json);
    for(obj of data){
        if ( typeof obj.node === "undefined")
            continue;

        rebuildNode(JSON.parse(obj.node));
    }
        

    for(obj of data){

        if ( typeof obj.node === "undefined")
            continue;

        let source_node = JSON.parse(obj.node);
        for(arr of JSON.parse(obj.connected_arrows)){
            let arr_obj = JSON.parse(arr);
            let arr_src = JSON.parse(arr_obj.start_node);
            
            if (source_node.label !== arr_src.label && !arr_obj.is_self)
                continue;

            rebuildArrow(arr_obj) 
        }
    }

    clearIOTable();
    rebuildIOTable( data.getLast());

    for (n of nodes)
        n.is_active = false;
}

if(typeof module !== 'undefined')
	module.exports = Graph;
