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
var mouse_pos;

function app(debug = false){
	var over_node = false;
	var mouse_down = false;
	var begin_arrow = false;
	var current_node = null;
	var key_down = false;
	canvas.addEventListener('click', (e) => {
		mouse_pos = getMouse(e);
		if(over_node || key_down)
			return;
		drawCircle(mouse_pos, true);
		nodes.push(new Node(mouse_pos));
		over_node = true;
   		if(debug)
   			console.log('added new node:' + nodes.length);
	});

	canvas.addEventListener('mousedown', (e) => {
		mouse_down = true;
		if(e.shiftKey && isOverNode() && mouse_down){
			begin_arrow = true;
		}
		if(isOverNode() && key_down)
			current_node = nodes[getClosestNodeIndex()];
	});

	canvas.addEventListener('mousemove', (e) => {
		mouse_pos = getMouse(e);
		//check if we're over anything
		if(nodes.length == 0) 
			return;
		over_node = (distanceToClosestNode() < NODE_RADIUS);

		if(current_node && mouse_down && !key_down)
			current_node.pos = mouse_pos;
	});

	canvas.addEventListener('mouseup', (e) => {
		mouse_down = false;
		dragging = false;
		if(begin_arrow){
			begin_arrow = false;
			if(isOverNode()){
				//if we landed on another node create a new arrow
				arrows.push(new Arrow(current_node.getPos(), nodes[getClosestNodeIndex()].getPos()));
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
			current_node = nodes[getClosestNodeIndex()];
		}
	});

	window.addEventListener('keyup', (e) =>{
		key_down = false;
		if(begin_arrow){
			begin_arrow = false;
			if(isOverNode()){
				//if we landed on another node create a new arrow
				arrows.push(new Arrow(current_node.getPos(), nodes[getClosestNodeIndex()].getPos()));
			}
		}
		current_node = null;
	});

	function drawScreen(){
		context.fillStyle = '#aaaaaa';
		context.fillRect(0, 0, width, height);

		if(begin_arrow){
			drawLine(current_node.getPos(), mouse_pos);
			drawCircle(current_node.getPos(), true);
		}

		for(var i = 0; i < arrows.length; ++i){
			drawArrow(arrows[i]);
		}

		//draw circles on top of arrows to avoid anything inside the 'nodes'
		for(var i = 0; i < nodes.length; ++i){
			drawCircle(nodes[i].getPos());
		}

		if(over_node || current_node && !begin_arrow)
			drawCircle(nodes[getClosestNodeIndex()].getPos(), true);
	}

	loop();
	function loop(){
		drawScreen();
		window.setTimeout(loop, intervalTime);
	}
}

function isOverNode(){
	return distanceToClosestNode() < NODE_RADIUS;
}

function getMouse(pos){
	var rect = canvas.getBoundingClientRect();
	var X = pos.clientX - rect.left;
	var Y = pos.clientY - rect.top;
	return {X,Y};
}
function drawArrow(arr){
	drawLine(arr.start_pos, arr.end_pos);
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

function drawLine(a, b){
	context.beginPath();
	context.moveTo(a.X,a.Y);
	context.lineTo(b.X,b.Y);
	context.stroke();
}

function getDistance(a, b){
	var x_ = Math.abs(a.X - b.X);
	var y_ = Math.abs(a.Y - b.Y);
	return Math.hypot(x_, y_); 
}

function drawPathToClosestNode(){
	var min = 1000;
	var closest_node;
	if(nodes.length === 0)
		return;
	for (var i = 0; i < nodes.length; ++i) {
		var dist = getDistance(nodes[i].getPos(), mouse_pos);
		if(dist < min){
			min = dist;
			closest_node = nodes[i];
		}
	}	
	context.strokeStyle = '#ff0000';
	drawLine(mouse_pos, closest_node.getPos());
	context.strokeStyle = '#000000';
}

function distanceToClosestNode(){
	var min = 1000;
	var closest_node;
	if(nodes.length === 0)
		return width;
	tmp = nodes[getClosestNodeIndex()];
	return getDistance(mouse_pos, tmp.getPos());
}

function getClosestNodeIndex(){
	var min = 1000;
	var index = 0;
	if(nodes.length === 0)
		return;
	if(nodes.length === 1)
		return 0;
	for (var i = 0; i < nodes.length; ++i) {
		var dist = getDistance(nodes[i].getPos(), mouse_pos);
		if(dist < min){
			min = dist;
			index = i;
		}
	}	
	return index;
}

function drawPathToAllNodes(){
	if(nodes.length === 0)
		return;
	for(var i = 0 ; i < nodes.length; ++i){
		drawLine(mouse_pos, nodes[i].getPos());
	}
}

class Node{
	constructor(pos){this.pos = pos}
	getPos(){return this.pos}
}

class Arrow{
	constructor(a, b){
		this.start_pos = a;
		this. end_pos = b;
	}
	length(){
		return getDistance(this.start_pos, this.end_pos);
	}
}