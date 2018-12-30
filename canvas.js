var canvas;
var context;

var height;
var width;

const NODE_RADIUS = 25;

const FRAME_RATE = 30;
var intervalTime = 1000/FRAME_RATE;

window.onload = init;

function init(){
	canvas = document.getElementById("canvas");
	if(!canvas || !canvas.getContext)
		return;

	context = canvas.getContext("2d");
	height = canvas.height;
	width = canvas.width;
	context.fillStyle = '#aaaaaa';
	canvas.focus();
	//background color:
	context.fillRect(0, 0, width, height);
	app();
}

var nodes = [];
var arrows = [];
var mouse_pos, mouse_down, key_down;
var current_node;
function app(){
	mouse_down = begin_arrow = key_down = false;
	canvas.addEventListener('click', (e) => {
		mouse_pos = getMouse(e);
		if(isOverNode() || key_down)
			return;
		drawCircle(mouse_pos, true);
		nodes.push(new Node(mouse_pos));
	});

	canvas.addEventListener('mousedown', (e) => {
		mouse_down = true;
		if(e.shiftKey && isOverNode() && mouse_down){
			begin_arrow = true;
			current_node = getClosestNode();
		}
		if(isOverNode() && !key_down)
			current_node = getClosestNode();
	});

	canvas.addEventListener('mousemove', (e) => {
		mouse_pos = getMouse(e);
		//check if we're over anything
		if(nodes.length == 0) 
			return;

		if(current_node && mouse_down && !key_down){
			current_node.pos = mouse_pos;
			if(current_node.arrow_index != -1){
				arrows[current_node.arrow_index].setClosestPoint(mouse_pos);
			}
		}
	});

	canvas.addEventListener('mouseup', (e) => {
		mouse_down = false;
		dragging = false;
		if(begin_arrow){
			begin_arrow = false;
			if(isOverNode()){
				//if we landed on another node create a new arrow
				addArrowToNode(getClosestNode(), current_node);
			}
		}
		current_node = null;
	});

	window.addEventListener('keydown', (e) =>{
		//draw arrow instead
		current_node = null;
		key_down = true;

		if(e.shiftKey && isOverNode() && mouse_down){
			begin_arrow = true;
			current_node = getClosestNode();
		}
	});

	window.addEventListener('keyup', (e) =>{
		key_down = false;
		if(begin_arrow){
			begin_arrow = false;
			if(isOverNode()){
				//if we landed on another node create a new arrow
				addArrowToNode(getClosestNode(), current_node);
			}
		}
		current_node = null;
	});

	function drawScreen(){
		//reset
		context.fillStyle = '#aaaaaa';
		context.fillRect(0, 0, width, height);

		if(begin_arrow){
			drawLine(current_node.getPos(), mouse_pos);
			drawCircle(current_node.getPos(), true);
		}

		for(var i = 0; i < arrows.length; ++i){
			drawArrow(arrows[i]);
		}

		if(getArrowUnderMouse()){
			drawArrow(getArrowUnderMouse(), 2.5);
			context.lineWidth = 1;
		}

		//draw circles on top of arrows to avoid anything inside the 'nodes'
		for(var i = 0; i < nodes.length; ++i){
			drawCircle(nodes[i].getPos());
		}

		if(isOverNode() || current_node && !begin_arrow)
			drawCircle(getClosestNode().getPos(), true);
	}

	loop();
	function loop(){
		drawScreen();
		window.setTimeout(loop, intervalTime);
	}
}

function getArrowUnderMouse(){
	for(var i = 0; i < arrows.length; i++){
		//see if we're in the range of an arrow
		let point_a = arrows[i].end_pos;
		let point_b = arrows[i].start_pos;

		if( Math.floor(getDistance(point_a, mouse_pos) + getDistance(point_b, mouse_pos)) === 
			Math.floor(getDistance(point_a,point_b)))
			return arrows[i];

	}
	return null;
}

function isOverNode(){
	return distanceToClosestNode() < NODE_RADIUS;
}

function getMouse(pos){
	var rect = canvas.getBoundingClientRect();
	let X = pos.clientX - rect.left;
	let Y = pos.clientY - rect.top;
	return {X,Y};
}
function drawArrow(arr, thickness = 1){
	drawLine(arr.start_pos, arr.end_pos, thickness);
}
function drawCircle(center, fill = false){
	context.beginPath();
	context.arc(center.X, center.Y, NODE_RADIUS, 0, 2 * Math.PI);
	if(!fill){
		context.stroke();
		context.beginPath();
		context.arc(center.X, center.Y, NODE_RADIUS - 0.5, 0, 2 * Math.PI);
		context.fillStyle = "#ffffff";
		context.fill();
	}
	else{
		context.fillStyle = "#000020";
		context.fill();
	}
}

function drawLine(a, b, thickness = 1){
	context.beginPath();
	context.moveTo(a.X,a.Y);
	context.lineTo(b.X,b.Y);
	context.lineWidth = thickness;
	context.stroke();
}

function getDistance(a, b){
	var x_ = Math.abs(a.X - b.X);
	var y_ = Math.abs(a.Y - b.Y);
	return Math.hypot(x_, y_); 
}

function distanceToClosestNode(){
	var min = 1000;
	var closest_node;
	if(nodes.length === 0)
		return width;
	return getDistance(mouse_pos, getClosestNode().getPos());
}

function addArrowToNode(_node){
	arrows.push(new Arrow(current_node.getPos(), _node.getPos()));
	_node.arrow_index = current_node.arrow_index = arrows.length-1;
}

function getClosestNode(){
	var min = 1000;
	var index = 0;
	if(nodes.length === 0)
		return;
	if(nodes.length === 1)
		return nodes[0];
	for (var i = 0; i < nodes.length; ++i) {
		var dist = getDistance(nodes[i].getPos(), mouse_pos);
		if(dist < min){
			min = dist;
			index = i;
		}
	}	
	return nodes[index];
}

class Node{
	constructor(pos){
		this.pos = pos
		this.arrow_index = -1;
	}
	getPos(){return this.pos}
}

class Arrow{
	constructor(a, b){
		this.start_pos = a;
		this.end_pos = b;
	}
	length(){
		return getDistance(this.start_pos, this.end_pos);
	}
	getClosestPoint(){
		return (getDistance(this.start_pos, mouse_pos) < getDistance(this.end_pos, mouse_pos)) ?
				this.start_pos : this.end_pos;
	}
	setClosestPoint(new_pos){
		if(this.getClosestPoint() == this.start_pos)
			this.start_pos = new_pos;
		else
			this.end_pos = new_pos;
	}
}