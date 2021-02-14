import {canvasManager} from './canvasManager.js';
import {initCanvas, drawSelfArrowHelper, drawLine, renderBackground} from './renderer.js';
import {load} from './lib/graph.js';
import {initControls, inputManager, hideArrowMenu} from './input.js';
import {getDistance} from './lib/geometry.js';


window.addEventListener("load", main);
function main(){
	let canvas = document.getElementById("canvas");
	if(!canvas || !canvas.getContext("2d")){
		alert("Your browser does not support the HTML5 canvas");
		return;
	}

	let CM = canvasManager.init(canvas);

	//prevent highlighting outside of the canvas on click
	CM.canvas.onselectstart = function () { return false; }
	initCanvas();
	initControls(canvas);
    //fileManager();
	
	drawScreen();

    if(CM.auto_save){
        load();
    }
}


function drawScreen(){
	let CM = canvasManager.getInstance();
	let IM = inputManager.getInstance();

	//reset
	renderBackground();
	isOverNode();

	if(CM.is_starting_arrow && CM.current_node){
		if(CM.is_over_node && (getClosestNode() == CM.start_node) ){
			drawSelfArrowHelper(CM.start_node.pos);
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

	//DEBUG
	// if(CM.nodes.length > 0){
	// 	drawLine(IM.mouse_pos, CM.nodes[0].pos );
	// }

	window.requestAnimationFrame(drawScreen);
}


//helper functions:
function isOverNode(){
	let CM = canvasManager.getInstance();
	CM.is_over_node = distanceToClosestNode() < CM.node_radius;
	return CM.is_over_node;
}


//returns closest node relative to the current mouse position
function distanceToClosestNode(){
	let CM = canvasManager.getInstance();

	if(CM.nodes.length === 0){
		return CM.width;
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


function refocus(){
	let CM = canvasManager.getInstance();
    CM.canvas.focus();
    CM.canvas.click();
}


/** @typedef { import('./lib/geometry.js').Point } Point */
export{
	isOverNode,
	getClosestNode,
	refocus,
}
