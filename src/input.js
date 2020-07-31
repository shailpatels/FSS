import {API} from './api.js';
import {transformPoint, Point} from './lib/geometry.js';
import {isOverNode, getClosestNode} from './canvas.js';
import {canvasManager} from './canvasManager.js';


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
		this.is_key_down = false;
		this.is_mouse_down = false;
		this.is_dragging = false;

		this.LEFT_MOUSE_BUTTON = 0;
      	this.RIGHT_MOUSE_BUTTON = 2;
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

canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('dblclick', onDoubleClick);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseup', onMouseUp);


document.addEventListener('keydown', onKeyDown);

//incase the user is over a node and releases the shift key 
//before the mouse button
document.addEventListener('keyup', onKeyUp);


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

function onMouseUp(e){
	API.call("mouse_up", e);

	let IM = inputManager.getInstance();
	let CM = canvasManager.getInstance();

	IM.is_mouse_down = false;
	IM.is_dragging = false;

	if(e.button === IM.RIGHT_MOUSE_BUTTON){
		//remove all conections from this node
		if(CM.is_over_node){
			deleteNode();
		}

		for(let i = 0; i < CM.arrows.length; i++){
			if(CM.arrows[i].mouse_over){
				deleteArrow(CM.arrows[i]);
				break;
			}
		}
		
		CM.current_node = null;
		CM.current_arrow = null;
		CM.start_node = null;
		return;
	}

	if(CM.is_starting_arrow){
		CM.is_starting_arrow = false;
		if(CM.is_over_node){
			//if we landed on another node create a new arrow
			CM.addNewArrow(CM.current_node, getClosestNode());
		}
	}
    
    if( !CM.is_over_node ){
        for (let i = CM.arrows.length - 1; i >= 0; i--) {
            if(CM.arrows[i].mouse_over && CM.selected_arrow === null){
                CM.selected_arrow = CM.arrows[i];
                break;
            }
        }
    }

    CM.current_node = null;
	CM.current_arrow = null;
	CM.start_node = null;
}


function onMouseDown(e){
	let IM = inputManager.getInstance();
	let CM = canvasManager.getInstance();

	IM.is_mouse_down = true;
	CM.selected_arrow = null;

	API.call("mouse_down", e);
	if(e.button === IM.RIGHT_MOUSE_BUTTON){
		API.call("left_mouse_down", e);
		return;
	}else{
		API.call("right_mouse_down", e);
	}

	if(e.shiftKey && CM.is_over_node){
		CM.is_starting_arrow = true;
		CM.current_node = getClosestNode();
		CM.start_node = CM.current_node;
	}
	if(CM.is_over_node && !IM.is_key_down){
		CM.current_node = getClosestNode();
        return;
    }

	for (let i = CM.arrows.length - 1; i >= 0; i--) {
		if(CM.arrows[i].mouse_over && CM.current_arrow === null){
			CM.current_arrow = CM.arrows[i];
			CM.selected_arrow = CM.arrows[i];
			break;
		}
	}

    hideArrowMenu();
}


function onMouseMove(e){
	API.call("mouse_move", e);

	let IM = inputManager.getInstance();
	let CM = canvasManager.getInstance();

	IM.mouse_pos = getMouse(e);

	IM.is_dragging = IM.is_mouse_down;
    
	if(CM.nodes.length == 0 || IM.is_key_down) {
		return;
	}

	if(CM.current_node){
		CM.current_node.moveTo(IM.mouse_pos);
	}

	if(!CM.is_over_node && IM.mouse_down && CM.current_arrow !== null){
		CM.current_arrow.moveToMouse();
        CM.selected_arrow = null;
	}
}


function onDoubleClick(e){
	let IM = inputManager.getInstance();
	let CM = canvasManager.getInstance();

	IM.mouse_pos = getMouse(e);
	API.call("double_click", e);
	let current_arrow = null;
	if( !isOverNode() && !IM.is_key_down && current_arrow === null) {
		CM.addNewNode();
        CM.curent_node = null;
        CM.current_arrow = null;
        CM.start_node = null;
        return;
	}
    
    let ref = getClosestNode();
    if( ref !== null && isOverNode()){
        ref.is_accept = !ref.is_accept;
    } 
        
	CM.current_node = null;
	CM.current_arrow = null;
	CM.start_node = null;
}


function onKeyUp(e){
	let IM = inputManager.getInstance();
	let CM = canvasManager.getInstance();

	API.call("key_up", e);
	IM.is_key_down = false;

	if(CM.is_starting_arrow){
		CM.is_starting_arrow = false;
		if(CM.is_over_node){
			//if we landed on another node create a new arrow
			addNewArrow(current_node, getClosestNode());
		}
	}

	CM.current_node = null;
}


function onKeyDown(e){
	API.call("key_down", e);
	let CM = canvasManager.getInstance();
	let IM = inputManager.getInstance();

    //draw arrow instead
    CM.current_node = null;
    IM.is_key_down = true;

    if(e.shiftKey && CM.is_over_node && IM.is_mouse_down){
        CM.is_starting_arrow = true;
        CM.current_node = getClosestNode();
    }
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
	let CM = canvasManager.getInstance();

    if( !CM.is_arrow_menu_drawn )
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