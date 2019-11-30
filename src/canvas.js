var canvas,
    context,

    height,
    width;

const NODE_RADIUS = 25;	
const LEFT_MOUSE_BUTTON = 0;
const RIGHT_MOUSE_BUTTON = 2;

//HTML UIs 
var arrow_menu;
var graph;

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

window.onload = function init(){
	canvas = document.getElementById("canvas");
	if(!canvas || !canvas.getContext("2d"))
		return;

	arrow_menu = document.getElementById("arrow_menu");
	context = canvas.getContext("2d");
	height = canvas.height;
	width = canvas.width;
	context.fillStyle = '#aaaaaa';
	canvas.focus();
	//background color:
	context.fillRect(0, 0, width, height);
	graph = new Graph();

	initControls(canvas);

	app();
}

var nodes = [], arrows = [],
	mouse_pos, mouse_down, key_down,
	current_node, current_arrow,
	begin_arrow, start_node, mouse_down;

function app(){
	mouse_down = begin_arrow = key_down = false;
	current_node = current_arrow = null;
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

		window.requestAnimationFrame(drawScreen);
	}

}

//helper functions:
function isOverNode(){
	return distanceToClosestNode() < NODE_RADIUS;
}

function addNewNode(){
	nodes.push( new Node(mouse_pos, nodes.length.toString(10) ));
	graph.addVertex(nodes.getLast());
}

function addNewArrow(start_node, end_node){

	let is_self = false;
	let angle = 0.0;
	if(start_node === end_node){
		is_self = true;
		angle = findAngle(start_node.pos, mouse_pos);
	}

	new_arrow = new Arrow(start_node, end_node, is_self, angle);
	
	start_node.connected_arrows.push(new_arrow);
	end_node.connected_arrows.push(new_arrow);

	arrows.push(new_arrow);

	graph.addEdge(start_node, end_node);
}

function deleteNode(){
	for(var i = 0; i < getClosestNode().connected_arrows.length; ++i)
		arrows.splice( getArrowIndex(getClosestNode().connected_arrows[i]) , 1);

	//update labels
	for(var i = getNodeIndex(getClosestNode()); i < nodes.length; ++i)
		nodes[i].label = i-1;

	//remove from list
	nodes.splice(getNodeIndex(getClosestNode()), 1);
}

function deleteArrow(arr_){
	let start = arr_.start_node;
	let end = arr_.end_node;

	start.connected_arrows.remove(arr_);
	if(start !== end)
		end.connected_arrows.remove(arr_);

	arrows.remove(arr_);
	graph.deleteEdge(start, end);
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
function drawText(str, _pos){
	context.font = "italic 25px Times New Roman";
	context.fillStyle = "black";
	context.fillText("S", _pos.X-8, _pos.Y+5);
	context.font = "15px Times New Roman";
	context.fillText(str, _pos.X+4, _pos.Y+10);
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

/** @typedef { import('./geometry.js').Point } Point */


