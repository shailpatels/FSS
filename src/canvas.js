import {canvasManager} from './canvasManager.js';
import {API} from './api.js';
import {initCanvas, drawSelfArrow} from './renderer.js';
import {Graph} from './lib/graph.js';
import {initControls, drawArrowMenu, inputManager, hideArrowMenu} from './input.js';
import {Point, getDistance} from './lib/geometry.js';
import {Node} from './elements.js';

var height = 500,
    width = 1000,

    arrow_menu,
    graph;

const NODE_RADIUS = 25,	
      LEFT_MOUSE_BUTTON = 0,
      RIGHT_MOUSE_BUTTON = 2;


Array.prototype.getLast = function() {
    return this[this.length - 1];
}


Array.prototype.toFlatString = function() {
    let ret = "";
    for(var i = 0; i < this.length; i++)  
       ret += this[i].toString(); 
    return ret;
}


window.onload = () => {
	let canvas = document.getElementById("canvas");
	if(!canvas || !canvas.getContext("2d")){
		alert("Your browser does not support the HTML5 canvas");
		return;
	}

	arrow_menu = document.getElementById("arrow_menu");

	let CM = canvasManager.init(canvas);

	//prevent highlighting outside of the canvas on click
	CM.canvas.onselectstart = function () { return false; }
	initCanvas();
	graph = new Graph();
	initControls(canvas);
   // fileManager();
	app();
}


var nodes = [], arrows = [],
	mouse_pos, mouse_down, key_down;
var current_node = null, current_arrow,
	begin_arrow, start_node, mouse_down,
	selected_arrow, arrow_menu_drawn;


function app(){
	mouse_down = begin_arrow = key_down = arrow_menu_drawn = false;
	current_arrow = selected_arrow = null;
	mouse_pos = new Point(0,0);
	drawArrowMenu(mouse_pos);

	drawScreen();
}


function drawScreen(){
	let CM = canvasManager.getInstance();
	let IM = inputManager.getInstance();

	//reset
	CM.context.fillStyle = '#aaaaaa';
	CM.context.fillRect(0, 0, width, height);
	isOverNode();

	if(CM.is_starting_arrow && CM.current_node){
		if(CM.is_over_node && (getClosestNode() == CM.start_node) ){
			drawSelfArrow(CM.start_node.pos);
		}

		drawLine(CM.current_node.pos, IM.mouse_pos);
		CM.current_node.draw();
	}

	for(let i = 0; i < CM.arrows.length; ++i){
		CM.arrows[i].draw();
		if(CM.arrows[i].isMouseOver() && !CM.is_over_node ){
			CM.current_arrow = CM.arrows[i];
		}
	}

	//draw circles on top of arrows to avoid anything inside the 'nodes'
	for(let n of CM.nodes){
		n.draw();
	}
	

	if(CM.selected_arrow === null){
		hideArrowMenu();
	}

	window.requestAnimationFrame(drawScreen);
}


//helper functions:
function isOverNode(){
	let CM = canvasManager.getInstance();
	CM.is_over_node = distanceToClosestNode() < NODE_RADIUS;
	return CM.is_over_node;
}


/**
* place an existing arrow and add it to the graph
*
* @param {Arrow} arr
*/
function placeNewArrow(arr){
	arrows.push(arr);
	graph.addEdge(arr.start_node,arr.end_node);
        

	if(!is_starting)
		resetSim();
}


/**
* @param {Point} pos - position to convert from canvas to HTML coords
* @returns {Point}
**/
function mouseToPage(pos){
	var rect = CANVAS.getBoundingClientRect();
	return new Point( pos.X + rect.left, pos.Y + Math.abs(rect.top) ); 
}


//theres probably a better way to handle this...
function drawLabel(str, _pos){
	let CM = canvasManager.getInstance();

	CM.context.font = "italic 25px Times New Roman";
	CM.context.fillStyle = "black";
	CM.context.fillText("S", _pos.X-8, _pos.Y+5);
	CM.context.font = "15px Times New Roman";
	CM.context.fillText(str, _pos.X+4, _pos.Y+10);
}


function drawText(str, _pos){
	let CM = canvasManager.getInstance();

	CM.context.font = "italic 25px Times New Roman";
	CM.context.fillStyle = "black";
	CM.context.fillText(str, _pos.X, _pos.Y);
}


function drawLine(a, b, thickness = 1){
	let CM = canvasManager.getInstance();

	CM.context.beginPath();
	CM.context.moveTo(a.X,a.Y);
	CM.context.lineTo(b.X,b.Y);
	CM.context.lineWidth = thickness;
	CM.context.stroke();
}


//returns closest node relative to the current mouse position
function distanceToClosestNode(){
	let CM = canvasManager.getInstance();

	if(CM.nodes.length === 0){
		return width;
	}

	let IM = inputManager.getInstance();

	return getDistance(IM.mouse_pos, getClosestNode().pos);
}


//returns a refrence to the closest node relative to the mouse position
function getClosestNode(){
	let CM = canvasManager.getInstance();
	let IM = inputManager.getInstance();

	let min = 1000;
	let index = 0;

	if(CM.nodes.length === 0){
		return null;
	}else if(CM.nodes.length === 1){
		return CM.nodes[0];
	}

	for (let i = 0; i < CM.nodes.length; ++i) {
		let dist = getDistance(CM.nodes[i].pos, IM.mouse_pos);
		if(dist < min){
			min = dist;
			index = i;
		}
	}	
	return CM.nodes[index];
}


function resetCanvas(){
	//delete graph;
	graph = new Graph();
	nodes = [];
	arrows = [];

	mouse_pos = new Point();
}


function refocus(){
	let CM = canvasManager.getInstance();
    CM.canvas.focus();
    CM.canvas.click();
}

/** @typedef { import('./lib/geometry.js').Point } Point */
export{
	width,
	height,
	isOverNode,
	getClosestNode,
	drawLabel,
	refocus,
	drawText,
	resetCanvas
}