var canvas;
var context;

var height;
var width;

const NODE_RADIUS = 25;	

const LEFT_MOUSE_BUTTON = 0;
const RIGHT_MOUSE_BUTTON = 2;

window.onload = init;

var arrow_menu;

function init(){
	canvas = document.getElementById("canvas");
	if(!canvas || !canvas.getContext)
		return;

	arrow_menu = document.getElementById("arrow_menu");
	context = canvas.getContext("2d");
	height = canvas.height;
	width = canvas.width;
	context.fillStyle = '#aaaaaa';
	canvas.focus();
	//background color:
	context.fillRect(0, 0, width, height);

	initControls(canvas);

	app();
}

var nodes = [];
var arrows = [];
var mouse_pos, mouse_down, key_down;
var current_node, current_arrow;

var raw_pos;
function app(){
	mouse_down = begin_arrow = key_down = false;
	current_node = current_arrow = null;
	raw_pos = new Point(0,0);
	drawScreen();
	function drawScreen(){
		//reset
		context.fillStyle = '#aaaaaa';
		context.fillRect(0, 0, width, height);

		if(begin_arrow && current_node){
			drawLine(current_node.pos, mouse_pos);
			drawNode(current_node, true);
		}

		for(var i = 0; i < arrows.length; ++i){
			arrows[i].draw();
			if(arrows[i].isMouseOver() && !isOverNode() ){
				current_arrow = arrows[i];
			}
		}

		//draw circles on top of arrows to avoid anything inside the 'nodes'
		for(var i = 0; i < nodes.length; ++i){
			drawNode(nodes[i]);
		}

		if(isOverNode() || current_node && !begin_arrow)
			drawNode(getClosestNode(), true);


		window.requestAnimationFrame(drawScreen);
	}

}
//helper functions:

function isOverNode(){
	return distanceToClosestNode() < NODE_RADIUS;
}

function addNewArrow(start_node, end_node){
	new_arrow = new Arrow(start_node, end_node);
	
	start_node.connected_arrows.push(new_arrow);
	end_node.connected_arrows.push(new_arrow);

	arrows.push(new_arrow);
	//showArrowMenu(new_arrow);
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

function mouseToPage(pos){
	var rect = canvas.getBoundingClientRect();
	return new Point( pos.X + rect.left, pos.Y + Math.abs(rect.top) ); 
}

//draws an arrow between two nodes,
//expects an arrow object
function drawArrow(arr, thickness = 1){
	context.lineWidth = thickness;
	context.beginPath();

	if(!arr.self_arrow){
		context.moveTo(arr.start_pos.X,arr.start_pos.Y);
		cdrawArrowontext.quadraticCurveTo(arr.midpoint.X, arr.midpoint.Y,
							  	 arr.end_pos.X,  arr.end_pos.Y);
		context.stroke();

		context.fillStyle = "black";
		let angle = Math.atan2(arr.end_pos.Y-arr.midpoint.Y,arr.end_pos.X-arr.midpoint.X);
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
	}else{
		context.moveTo(arr.start_pos.X,arr.start_pos.Y);
		context.arc(arr.start_pos.X - NODE_RADIUS - 25,arr.start_pos.Y , 30, 0, 2 * Math.PI);
		context.stroke();
	}
}


//draw a node
function drawNode(_node, fill = false){
	drawCircle(_node.pos,fill);
	drawText(_node.label, _node.pos);
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
	_node.connected_arrows.push(arrows[arrows.length-1]);
	_current_node.connected_arrows.push(arrows[arrows.length-1]);

	arrows[arrows.length-1].connected_nodes.push(_node);
	arrows[arrows.length-1].connected_nodes.push(_current_node);
}

function addArrowToCurrentNode(_current_node){
	_current_node.connected_arrows.push(arrows[arrows.length-1]);
	arrows[arrows.length-1].connected_nodes.push(_current_node);
	arrows[arrows.length-1].self_arrow = true;
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


