import {Arrow, Node} from "./elements";
import {Point, getDistance} from "./geometry";

export var canvas,
    context,
    height,
    width;

export const NODE_RADIUS = 25;
const LEFT_MOUSE_BUTTON = 0;
const RIGHT_MOUSE_BUTTON = 2;

//HTML UIs
var arrow_menu;

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

	initControls(canvas);

	app();
}

export var nodes = [], arrows = [],
	mouse_pos, mouse_down, key_down,
	current_node, current_arrow,
	begin_arrow, start_node;

function app(){
	mouse_down = begin_arrow = key_down = false;
	current_node = current_arrow = null;
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

var new_arrow;

function addNewArrow(start_node, end_node){

	if(start_node === end_node){
		console.log("Selft node!");
		return;
		//TODO!
	}

	new_arrow = new Arrow(start_node, end_node);

	start_node.connected_arrows.push(new_arrow);
	end_node.connected_arrows.push(new_arrow);

	arrows.push(new_arrow);
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

var dragging;

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



function initControls(canvas){
	canvas.addEventListener('mousedown', (e) => {
		mouse_down = true;
		if(e.button === RIGHT_MOUSE_BUTTON)
			return;

		if(e.shiftKey && isOverNode()){
			begin_arrow = true;
			current_node = getClosestNode();
		}
		if(isOverNode() && !key_down)
			current_node = getClosestNode();

		for (var i = arrows.length - 1; i >= 0; i--) {
			if(arrows[i].mouse_over && current_arrow === null){
				current_arrow = arrows[i];
				break;
			}
		}

	});

	canvas.addEventListener('mousemove', (e) => {
		mouse_pos = getMouse(e);
		dragging = mouse_down;
		if(nodes.length == 0 || key_down)
			return;

		if(current_node){
			current_node.moveTo(mouse_pos);
		}

		if(!isOverNode() && mouse_down && current_arrow !== null){
			current_arrow.ctrl_pos = mouse_pos;
		}
	});

	canvas.addEventListener('mouseup', (e) => {
		mouse_down = false;
		dragging = false;

		if(e.button === RIGHT_MOUSE_BUTTON){
			//remove all conections from this node
			if(isOverNode()){
				deleteNode();
			}

			current_node = null;
			current_arrow = null;
			return;
		}

		if(begin_arrow){
			begin_arrow = false;
			if(isOverNode()){
				//if we landed on another node create a new arrow
				addNewArrow(current_node, getClosestNode());
			}
		}

		mouse_pos = getMouse(e);
		if( !isOverNode() && !key_down && current_arrow === null) {
			nodes.push( new Node(mouse_pos, nodes.length.toString(10) ));
		}

		current_node = null;
		current_arrow = null;
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

	//incase the user is over a node and releases the shift key
	//before the mouse button
	window.addEventListener('keyup', (e) =>{
		key_down = false;

		if(begin_arrow){
			begin_arrow = false;
			if(isOverNode()){
				//if we landed on another node create a new arrow
				addNewArrow(current_node, getClosestNode());
			}
		}
		current_node = null;
	});


	//end function
}


function showArrowMenu(arr){
	let _pos = mouseToPage(arr.ctrl_pos);

	arrow_menu.style.display = "block";
	arrow_menu.style.left = _pos.X.toString() + "px";
	arrow_menu.style.top = (_pos.Y - 175 ).toString() + "px";

	let label = document.getElementById( "arrow_label" );
	let start_l = arr.start_node.label;
	let end_l = arr.end_node.label;
	label.innerHTML = "S" + start_l + " to " + "S" + end_l;

}

function submitArrowMenu(){
	arrow_menu.style.display = "none";
}

//corrects the raw mouse position to a mouse position relative to the canvas
//upper left corner is (0,0)
function getMouse(pos){
	return new Point(pos.offsetX, pos.offsetY);
}