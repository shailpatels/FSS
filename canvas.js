var canvas;
var context;

var height;
var width;

const NODE_RADIUS = 25;

const FRAME_RATE = 30;
var intervalTime = 1000/FRAME_RATE;

const LEFT_MOUSE_BUTTON = 0;
const RIGHT_MOUSE_BUTTON = 2;

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
		if(e.button === RIGHT_MOUSE_BUTTON)
			return;
		
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
			for(let i = 0; i < current_node.connected_arrows.length; ++i){
				current_node.connected_arrows[i].setClosestPoint(mouse_pos);
			}
		}

		if(mouse_down && current_arrow){
			current_arrow.midpoint = mouse_pos;
		}
	});

	canvas.addEventListener('mouseup', (e) => {
		mouse_down = false;
		dragging = false;

		if(e.button === RIGHT_MOUSE_BUTTON){
			//remove all conections from this node
			if(isOverNode()){
				for(var i = 0; i < getClosestNode().connected_arrows.length; ++i)
					arrows.splice( getArrowIndex(getClosestNode().connected_arrows[i]) , 1);

				//update labels
				for(var i = getNodeIndex(getClosestNode()); i < nodes.length; ++i)
					nodes[i].string = i-1;
				//remove from list
				nodes.splice(getNodeIndex(getClosestNode()), 1);
			}
			if(getArrowUnderMouse()){
				let arr_ = getArrowUnderMouse();
				let node_a = arr_.connected_nodes[0];
				let node_b = arr_.connected_nodes[1];

				node_a.connected_arrows.splice(node_a.getConnectedArrowIndex(arr_),1);
				node_b.connected_arrows.splice(node_b.getConnectedArrowIndex(arr_),1);

				arrows.splice(getArrowIndex(arr_), 1);

			}
			return;
		}

		if(begin_arrow){
			begin_arrow = false;
			if(isOverNode()){
				//if we landed on another node create a new arrow
				addArrowToNode(getClosestNode(), current_node);
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
//helper functions:
//note that position/point objects are represented as: {X,Y}

//checks if there's an arrow under the current mouse position
//returns a refrence to that arrow if there is one, otherwise returns null

//warning: this is a hacked up solution
function getArrowUnderMouse(){
	for(var i = 0; i < arrows.length; i++){
		//see if we're in the range of an arrow
		let point_a = arrows[i].end_pos;
		let point_b = arrows[i].start_pos;
		let point_c = arrows[i].midpoint;

		let offset = getDistance(getMidPoint(point_a, point_b), point_c)
		if( Math.floor(getDistance(point_a, mouse_pos) + getDistance(point_b, mouse_pos)) === 
			Math.floor(getDistance(point_a,point_b)) && offset === 0 )
		  	return arrows[i];

		context.beginPath();
		context.moveTo(point_a.X, point_a.Y);
		context.quadraticCurveTo(point_c.X, point_c.Y,
						  	 	 point_b.X, point_b.Y);

		if(context.isPointInPath(mouse_pos.X, mouse_pos.Y))
			return arrows[i];
	}
	return null;
}

function isOverNode(){
	return distanceToClosestNode() < NODE_RADIUS;
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
//corrects the raw mouse position to a mouse position relative to the canvas
//upper left corner is (0,0)
function getMouse(pos){
	var rect = canvas.getBoundingClientRect();
	let X = pos.clientX - rect.left;
	let Y = pos.clientY - rect.top;
	return {X,Y};
}

//draws an arrow between two nodes,
//expects an arrow object
function drawArrow(arr, thickness = 1){
	context.lineWidth = thickness;
	context.beginPath();
	context.moveTo(arr.start_pos.X,arr.start_pos.Y);
	context.quadraticCurveTo(arr.midpoint.X, arr.midpoint.Y,
						  	 arr.end_pos.X,  arr.end_pos.Y);
	context.stroke();

	context.fillStyle = "black";

	var angle = Math.atan2(arr.end_pos.Y-arr.midpoint.Y,arr.end_pos.X-arr.midpoint.X);

	context.save();
	context.translate(arr.end_pos.X, arr.end_pos.Y );
	context.rotate(angle);
	 // draw your arrow, with its origin at [0, 0]

	context.beginPath();
	
	context.moveTo(-NODE_RADIUS,0);
	context.lineTo(-10 - NODE_RADIUS, -5);
	context.lineTo(-10 - NODE_RADIUS, 5);

	context.fill();
	context.restore();
}


//draw a node
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

//returns closest node relative to the current mouse position
function distanceToClosestNode(){
	var min = 1000;
	var closest_node;
	if(nodes.length === 0)
		return width;
	return getDistance(mouse_pos, getClosestNode().pos);
}

//adds a new arrow to the list of arrows,
//sets the midpoint and assigns the connected points to _node and current_node
function addArrowToNode(_node, _current_node){
	arrows.push(new Arrow(current_node.pos, _node.pos));
	_node.connected_arrows.push(arrows[arrows.length-1]);
	_current_node.connected_arrows.push(arrows[arrows.length-1]);

	arrows[arrows.length-1].connected_nodes.push(_node);
	arrows[arrows.length-1].connected_nodes.push(_current_node);
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

function getMidPoint(a, b){
	let X = Math.abs(a.X + b.X)/2;
	let Y = Math.abs(a.Y + b.Y)/2;
	return {X, Y}
}

//a node represents a state in a FSM
/*NODE:
	pos: the position on the canvas of the node (its centerpoint)
	connected_arrows: a list of arrows connected to this node
	string: the label of the node e.g: S_1
*/
class Node{
	constructor(pos, str = null){
		this.pos = pos
		this.connected_arrows = [];
		this.string = str;
	}
	getConnectedArrowIndex(arr){
		for(var i = 0; i < this.connected_arrows.length; ++i){
			if(arr == this.connected_arrows[i])
				return i;
		}
		return -1;
	}
}

//an arrow represents a connection in a FSM
/*ARROW
	start_pos: the position where the arrow started from
	end_pos: the position where the arrow ends
	midpoint: the position between the start & end points
	
	lenght(): returns the lenght of the arrow
	getClosestPoint(): returns either the start or end pos, depending on which is closer to the mouse pos
	setClosestPoint(): sets the closest point to a new position
*/
class Arrow{
	constructor(a, b){
		this.start_pos = a;
		this.end_pos = b;
		this.midpoint = getMidPoint(a,b);
		this.connected_nodes = [];
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