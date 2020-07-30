import {API} from './api.js';
import {transformPoint, Point} from './lib/geometry.js';
import {isOverNode, addNewNode, getClosestNode} from './canvas.js';


var inputManager = (function(){
	var instance;
	return {
		getInstance: function(){
			if (!instance) {
				instance = new __INPUT_MANAGER();
			}
			return instance;
		}
	};
})();


class __INPUT_MANAGER{
	constructor(){
		this.mouse_pos = new Point(0,0);
	}
}

/**
* Add JS event listeners for user input
* 
* @param {HTMLCanvasElement} canvas
*/
function initControls(canvas){
var selected_arrow = null;

let if_ = document.getElementById("if_");
let out = document.getElementById("out");
var nodes = [], arrows = [],
	mouse_down, key_down,
	current_node, current_arrow,
	begin_arrow, start_node, mouse_down,
	arrow_menu_drawn;

var selected_arrow = null;

canvas.addEventListener('mousedown', (e) => {
	return;
	mouse_down = true;
	selected_arrow = null;

	API.call("mouse_down", e);
	if(e.button === RIGHT_MOUSE_BUTTON){
		API.call("left_mouse_down", e);
		return;
	}else{
		API.call("right_mouse_down", e);
	}

	if(e.shiftKey && isOverNode()){
		begin_arrow = true;
		current_node = getClosestNode();
		start_node = current_node;
	}
	if(isOverNode() && !key_down){
		current_node = getClosestNode();
        return;
    }

	for (var i = arrows.length - 1; i >= 0; i--) {
		if(arrows[i].mouse_over && current_arrow === null){
			current_arrow = arrows[i];
			selected_arrow = arrows[i];
			break;
		}
	}

    hideArrowMenu();
});

canvas.addEventListener('dblclick', (e) => {
	let IM = inputManager.getInstance();
	IM.mouse_pos = getMouse(e);
	API.call("double_click", e);
	let current_arrow = null;
	console.log(!isOverNode() && !key_down && current_arrow === null);
	if( !isOverNode() && !key_down && current_arrow === null) {
		addNewNode();
        // curent_node = null;
        // current_arrow = null;
        // start_node = null;
        return;
	}
    
    let ref = getClosestNode();
    if( ref !== null && isOverNode()){
        ref.is_accept = !ref.is_accept;
    } 
        
	current_node = null;
	current_arrow = null;
	start_node = null;
});

canvas.addEventListener('mousemove', (e) => {
	API.call("mouse_move", e);
	inputManager.getInstance().mouse_pos = getMouse(e);
	let dragging = mouse_down;
    
	if(nodes.length == 0 || key_down) 
		return;

	if(current_node){
		current_node.moveTo(mouse_pos);
	}

	if(!isOverNode() && mouse_down && current_arrow !== null){
		current_arrow.moveToMouse();
        selected_arrow = null;
	}
});

canvas.addEventListener('mouseup', (e) => {
	return;
	API.call("mouse_up", e);
	mouse_down = false;
	dragging = false;

	if(e.button === RIGHT_MOUSE_BUTTON){
		//remove all conections from this node
		if(isOverNode()){
			deleteNode();
		}

		for(var i = 0; i < arrows.length; i++)
			if(arrows[i].mouse_over){
				deleteArrow(arrows[i]);
				break;
			}
		
		current_node = null;
		current_arrow = null;
		start_node = null;
		return;
	}

	if(begin_arrow){
		begin_arrow = false;
		if(isOverNode()){
			//if we landed on another node create a new arrow
			addNewArrow(current_node, getClosestNode());
		}
	}
    
    if( !isOverNode() ){
        for (var i = arrows.length - 1; i >= 0; i--) {
            if(arrows[i].mouse_over && selected_arrow === null){
                selected_arrow = arrows[i];
                break;
            }
        }
    }
    current_node = null;
	current_arrow = null;
	start_node = null;
});


window.addEventListener('keydown', (e) =>{
	API.call("key_down", e);
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
document.addEventListener('keyup', (e) =>{
	API.call("key_up", e);
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


//record the user input when typing in the input box
arrow_menu.addEventListener('keyup', (e) => {
	API.call("arrow_menu_key_up", e);
    updateSelectedArrow();

    if(e.keyCode === 13){
	    updateSelectedArrow();  
	    hideArrowMenu(); 
    }
});


//end function
}


function updateSelectedArrow(){
    if(selected_arrow === null)
        return;

    selected_arrow.IF = if_.value;
	selected_arrow.OUT = out.value;
}


function updateArrowMenu(){
	if(selected_arrow === null || arrow_menu_drawn)
        return;

    if_.value = selected_arrow.IF;
    out.value = selected_arrow.OUT; 
}


function drawArrowMenu(pos,if_text, out_text){
	var selected_arrow = null;

	if(selected_arrow === null || arrow_menu_drawn)
		return;

	let w = Math.round(arrow_menu.offsetWidth/2);
    updateArrowMenu();

	arrow_menu.style.display = "block";	
	arrow_menu.style.left = ((CANVAS.offsetLeft + pos.X + 15) - w) + "px";
	arrow_menu.style.top = (CANVAS.offsetTop + pos.Y + 15) + "px";
    
    arrow_menu_drawn = true;
    if_.focus();
}


function hideArrowMenu(){
    if( !arrow_menu_drawn )
        return;

	arrow_menu.style.display = "none";
    selected_arrow = null;
    arrow_menu_drawn = false;
    
    refocus();
}


/**
* corrects the raw mouse position to a mouse position relative to the canvas
* upper left corner is (0,0)
*
* also corrects for HiDPI displays since every canvas pixel
* may not map to every pixel on the physical display
*
* @param {Point} pos - raw mouse position
* @returns {Point}
*/
function getMouse(pos){
	return transformPoint(new Point(pos.offsetX, pos.offsetY));
}

/** @typedef { import('./lib/geometry.js').Point } Point */
export{
	initControls,
	drawArrowMenu,
	inputManager
}