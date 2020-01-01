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
            td.appendChild( buildText(key.label) );
            td.appendChild( document.createElement("br") );
            tmp.appendChild( td );
        }
        tbl.appendChild(tmp);
    }
    
}

function save(){
	data = [];
	for(u of graph.graph.keys() ){
		let tmp = {
			"node" : u.serialize(),
            "connected_arrows" : serializeArrows(u.connected_arrows)
		};
		data.push(tmp);
	}

	let json = JSON.stringify(data);
	localStorage.setItem('data', json);
}


function rebuildNode(data){
    let ret = new Node();

    for (var property in ret)
        ret[property] = data[property]; 
    
    ret.connected_arrows = []; 
    addNewNode(ret);
}

function rebuildArrow(start_node, data){
    let s = JSON.parse(data["start_node"]);
    if( start_node.label !== s.label && !s.is_active)
        return;    

	let ret = new Arrow(new Node(), new Node(), false, 0.0); 
    for(property in data){
        if(property === "start_node" || property === "end_node"){
            ret[property] = JSON.parse(data[property]); 
            continue;
        }
        ret[property] = data[property];
    }

    //connect everything together
    for (n of nodes){
        if(n.label === ret.start_node.label){
            n.connected_arrows.push(ret);
            ret.start_node = n;
        }
        if(n.label === ret.end_node.label){
            n.connected_arrows.push(ret);
            ret.end_node = n;
        }
    }
       
    placeNewArrow(ret);
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
    for(obj of data){
        rebuildNode(JSON.parse(obj.node));
    }
        
    //once all the nodes have been created we can connected them together
    for(obj of data){
        rebuildArrow(
            JSON.parse(obj.node),
            JSON.parse(obj.connected_arrows)
        );
    }

}

if(typeof module !== 'undefined')
	module.exports = Graph;
