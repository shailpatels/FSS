import {inputManager} from './input.js';
import {Node, Arrow} from './elements.js';
import {findAngle} from './lib/geometry.js';

var canvasManager = (function(){
	var instance;
	return {
		init : function (canvas) {
			instance = new __CANVAS_MANAGER(canvas);
			return instance;
		},

		getInstance: function(){
			if (!instance) {
				throw 'Canvas manager not initialized';
			}
			return instance;
		}
	};
})();


class __CANVAS_MANAGER{
	constructor(canvas_){
		this.canvas = canvas_;
		this.context = this.canvas.getContext("2d");  

		this.selected_arrow = null;
		this.current_arrow = null;
		this.start_node = null;

		this.arrows = [];
		this.nodes = [];

		this.is_arrow_menu_drawn = false;
		this.is_over_node = false;
		this.is_starting_arrow = false;

		this.node_radius = 25;
	}


	/**
	* create a new node if given nothing, otherwise 
	* the given node will be placed and added to the graph
	*
	* @param {Node|void} node_
	*/
	addNewNode(node_ = null){
		let IM = inputManager.getInstance();

		if(node_ === null){
			var node_ = new Node(IM.mouse_pos, this.nodes.length.toString(10));
		}
	    
		this.nodes.push( node_ );
		//graph.addVertex(nodes.getLast());

		// if(!is_starting)
		// 	resetSim();
	}


	/**
	* create a new arrow and connect it between two nodes
	*
	* @param {Node} start_node 
	* @param {Node} end_node
	*/
	addNewArrow(start_node, end_node){

		let IM = inputManager.getInstance();
		let is_self = false;
		let angle = 0.0;
		if(start_node === end_node){
			is_self = true;
			angle = findAngle(start_node.pos, IM.mouse_pos);
		}

		let new_arrow = new Arrow(start_node, end_node, is_self, angle);
		
		start_node.connected_arrows.push(new_arrow);
	    
	    if(!is_self){
	        end_node.connected_arrows.push(new_arrow);
	    }

		this.arrows.push(new_arrow);
		//graph.addEdge(start_node, end_node);

		// if(!is_starting)
		// 	resetSim();
	    
	}
}

export{
	canvasManager
}