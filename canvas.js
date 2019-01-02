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
var current_node, current_arrow;
function app(){
	mouse_down = begin_arrow = key_down = false;

	canvas.addEventListener('mousedown', (e) => {
		mouse_down = true;
		if(e.shiftKey && isOverNode() && mouse_down){
			begin_arrow = true;
			current_node = getClosestNode();
		}
		if(isOverNode() && !key_down)
			current_node = getClosestNode();

		if(getArrowUnderMouse())
			current_arrow = getArrowUnderMouse();
	});

	canvas.addEventListener('mousemove', (e) => {
		mouse_pos = getMouse(e);
		if(nodes.length == 0 || key_down) 
			return;

		if(current_node && mouse_down){
			current_node.pos = mouse_pos;
			for(let i = 0; i < current_node.connected_points.length; ++i){
				current_node.connected_points[i].setClosestPoint(mouse_pos);
			}
		}

		if(mouse_down && current_arrow){
			current_arrow.midpoint = mouse_pos;
		}
	});

	canvas.addEventListener('mouseup', (e) => {
		mouse_down = false;
		dragging = false;
		if(begin_arrow){
			begin_arrow = false;
			if(isOverNode()){
				//if we landed on another node create a new arrow
				addArrowToNode(getClosestNode());
			}
		}
		mouse_pos = getMouse(e);
		if( !isOverNode() && !key_down && !current_arrow) {
			nodes.push(new Node(mouse_pos, nodes.length.toString(10) ));
		}

		current_arrow = current_node = null;
	});

	window.addEventListener('keydown', (e) =>{
		//draw arrow instead
		current_node = null;
		key_down = true;

		if(e.shiftKey && isOverNode() && mouse_down){
			begin_arrow = true;
			current_node = getClosestNode();
			return;
		}
	});

	window.addEventListener('keyup', (e) =>{
		key_down = false;
		if(begin_arrow){
			begin_arrow = false;
			if(isOverNode()){
				//if we landed on another node create a new arrow
				addArrowToNode(getClosestNode());
			}
		}
		current_node = null;
	});

	function drawScreen(){
		//reset
		context.fillStyle = '#aaaaaa';
		context.fillRect(0, 0, width, height);

		if(begin_arrow){
			drawLine(current_node.pos, mouse_pos);
			drawNode(current_node, true);
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
			drawNode(nodes[i]);
		}

		if(isOverNode() || current_node && !begin_arrow)
			drawNode(getClosestNode(), true);
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
		let point_c = arrows[i].midpoint;
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
	context.lineWidth = thickness;
	context.beginPath();
	context.moveTo(arr.start_pos.X,arr.start_pos.Y);
	context.quadraticCurveTo(arr.midpoint.X, arr.midpoint.Y,
						  	 arr.end_pos.X, arr.end_pos.Y );
	//context.lineTo(arr.midpoint.X,arr.midpoint.Y);
	//context.lineTo(arr.end_pos.X, arr.end_pos.Y);
	context.stroke();
}
function drawNode(_node, fill = false){
	drawCircle(_node.pos,fill);
	drawText(_node.string, _node.pos);
}
function drawCircle(center, fill){
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

function getDistance(a, b){
	let x_ = Math.abs(a.X - b.X);
	let y_ = Math.abs(a.Y - b.Y);
	return Math.hypot(x_, y_); 
}

function distanceToClosestNode(){
	var min = 1000;
	var closest_node;
	if(nodes.length === 0)
		return width;
	return getDistance(mouse_pos, getClosestNode().pos);
}

function addArrowToNode(_node){
	arrows.push(new Arrow(current_node.pos, _node.pos));
	_node.connected_points.push(arrows[arrows.length-1]);
	current_node.connected_points.push(arrows[arrows.length-1]);
}

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

function getMidPoint(a, b){
	let X = Math.abs(a.X + b.X)/2;
	let Y = Math.abs(a.Y + b.Y)/2;
	return {X, Y}
}

class Node{
	constructor(pos, str = null){
		this.pos = pos
		this.arrow_index = -1;
		this.connected_points = [];
		this.string = str;
	}
}

class Arrow{
	constructor(a, b){
		this.start_pos = a;
		this.end_pos = b;
		this.midpoint = getMidPoint(a,b);
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