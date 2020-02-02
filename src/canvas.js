var canvas,
    context,

    height = 500,
    width = 1000,

    arrow_menu,
    graph;


const NODE_RADIUS = 25,	
      LEFT_MOUSE_BUTTON = 0,
      RIGHT_MOUSE_BUTTON = 2;



Array.prototype.getLast = function() {
    return this[this.length - 1];
}

Array.prototype.remove = function(tgt) {
    for(var i = 0; i < this.length; i++)
    	if (this[i] === tgt){
    		this.splice(i,1);
    		break;
    	}
}

Array.prototype.toFlatString = function() {
    let ret = "";
    for(var i = 0; i < this.length; i++)  
       ret += this[i].toString(); 
    return ret;
}


window.onload = function init(){
	canvas = document.getElementById("canvas");
	if(!canvas || !canvas.getContext("2d"))
		return;

	arrow_menu = document.getElementById("arrow_menu");
	context = canvas.getContext("2d");  

    canvas.width = width;
    canvas.height = height;

	context.fillStyle = '#aaaaaa';
	canvas.focus();
	context.fillRect(0, 0, width, height);
	graph = new Graph();
	initControls(canvas);
    fileManager();
	app();
}

var nodes = [], arrows = [],
	mouse_pos, mouse_down, key_down,
	current_node, current_arrow,
	begin_arrow, start_node, mouse_down,
	selected_arrow, arrow_menu_drawn;

function app(){
	mouse_down = begin_arrow = key_down = arrow_menu_drawn = false;
	current_node = current_arrow = selected_arrow = null;
	mouse_pos = new Point(0,0);
	drawArrowMenu(mouse_pos);

	drawScreen();
	function drawScreen(){
		//reset
		context.fillStyle = '#aaaaaa';
		context.fillRect(0, 0, width, height);

		if(begin_arrow && current_node){
			if(isOverNode() && (getClosestNode() == start_node) )
				drawSelfArrow(start_node.pos);

			drawLine(current_node.pos, mouse_pos);
			current_node.draw();
		}

		for(var i = 0; i < arrows.length; ++i){
			arrows[i].draw();
			if(arrows[i].isMouseOver() && !isOverNode() ){
				current_arrow = arrows[i];
			}
		}

		//draw circles on top of arrows to avoid anything inside the 'nodes'
		for(var i = 0; i < nodes.length; ++i){
			nodes[i].draw();
		}

		if(selected_arrow === null)
			hideArrowMenu();

		window.requestAnimationFrame(drawScreen);
	}

}

//helper functions:
function isOverNode(){
	return distanceToClosestNode() < NODE_RADIUS;
}

/**
create a new node

@param {Node} node_ - if node is null a new node will be created, otherwise 
                      the given node will be placed and added to the graph
**/
function addNewNode(node_ = null){
	if(node_ === null)
		var node_ = new Node(mouse_pos, nodes.length.toString(10));
    
	nodes.push( node_ );
	graph.addVertex(nodes.getLast());

	if(!is_starting)
		resetSim();
}

/**
place an existing arrow and add it to the graph

@param {Arrow} arr
**/
function placeNewArrow(arr){
	arrows.push(arr);
	graph.addEdge(arr.start_node,arr.end_node);
        

	if(!is_starting)
		resetSim();
}

/**
create a new arrow and connect it between two nodes

@param {Node} start_node 
@param {Node} end_node
**/
function addNewArrow(start_node, end_node){

	let is_self = false;
	let angle = 0.0;
	if(start_node === end_node){
		is_self = true;
		angle = findAngle(start_node.pos, mouse_pos);
	}

	new_arrow = new Arrow(start_node, end_node, is_self, angle);
	
	start_node.connected_arrows.push(new_arrow);
    
    if(!is_self)
        end_node.connected_arrows.push(new_arrow);

	arrows.push(new_arrow);
	graph.addEdge(start_node, end_node);

	if(!is_starting)
		resetSim();
    
}

function deleteNode(){
	for(var i = 0; i < getClosestNode().connected_arrows.length; ++i)
		arrows.splice( getArrowIndex(getClosestNode().connected_arrows[i]) , 1);

	//update labels
	for(var i = getNodeIndex(getClosestNode()); i < nodes.length; ++i)
		nodes[i].label = i-1;

	//remove from list
	nodes.splice(getNodeIndex(getClosestNode()), 1);

	if(!is_starting)
		resetSim();
}

function deleteArrow(arr_){
	let start = arr_.start_node;
	let end = arr_.end_node;

	start.connected_arrows.remove(arr_);
	if(start !== end)
		end.connected_arrows.remove(arr_);

	arrows.remove(arr_);
	graph.deleteEdge(start, end);

	if(!is_starting)
		resetSim();
}

function getNodeIndex(_node){
	for(var i = 0; i < nodes.length; ++i){
		if(nodes[i] === _node)
			return i;
	}
	return -1;
}

function getArrowIndex(arr){
	for(var i = 0; i < arrows.length; ++i){
		if(arrows[i] === arr)
			return i;
	}
	return -1;
}

/**
@param {Point} pos - position to convert from canvas to HTML coords
@returns {Point}
**/
function mouseToPage(pos){
	var rect = canvas.getBoundingClientRect();
	return new Point( pos.X + rect.left, pos.Y + Math.abs(rect.top) ); 
}

//theres probably a better way to handle this...
function drawLabel(str, _pos){
	context.font = "italic 25px Times New Roman";
	context.fillStyle = "black";
	context.fillText("S", _pos.X-8, _pos.Y+5);
	context.font = "15px Times New Roman";
	context.fillText(str, _pos.X+4, _pos.Y+10);
}

function drawText(str, _pos){
	context.font = "italic 25px Times New Roman";
	context.fillStyle = "black";
	context.fillText(str, _pos.X, _pos.Y);
}

function drawLine(a, b, thickness = 1){
	context.beginPath();
	context.moveTo(a.X,a.Y);
	context.lineTo(b.X,b.Y);
	context.lineWidth = thickness;
	context.stroke();
}

//returns closest node relative to the current mouse position
function distanceToClosestNode(){
	var min = 1000;
	var closest_node;
	if(nodes.length === 0)
		return width;
	return getDistance(mouse_pos, getClosestNode().pos);
}

//returns a refrence to the closest node relative to the mouse position
function getClosestNode(){
	let min = 1000;
	let index = 0;
	if(nodes.length === 0)
		return;
	if(nodes.length === 1)
		return nodes[0];
	for (let i = 0; i < nodes.length; ++i) {
		let dist = getDistance(nodes[i].pos, mouse_pos);
		if(dist < min){
			min = dist;
			index = i;
		}
	}	
	return nodes[index];
}

function resetCanvas(){
	//delete graph;
	graph = new Graph();
	nodes = [];
	arrows = [];

	mouse_pos = new Point();
}

function refocus(){
    canvas.focus();
    canvas.click();
}

/** @typedef { import('./geometry.js').Point } Point */


