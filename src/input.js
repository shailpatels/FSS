import {API} from './api.js';
import {transformPoint, Point} from './lib/geometry.js';
import {isOverNode, getClosestNode, refocus} from './canvas.js';
import {canvasManager} from './canvasManager.js';
import {step, addRow} from './simulate.js';
import {buildTransitionTable, save, load} from './lib/graph.js';
import {toggleDarkMode} from './renderer.js';

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
*/
function initControls(){
	let CM = canvasManager.getInstance();

	let if_ = document.getElementById("if_");
	let out = document.getElementById("out");

	CM.canvas.addEventListener('mousedown', onMouseDown);
	CM.canvas.addEventListener('dblclick', onDoubleClick);
	CM.canvas.addEventListener('mousemove', onMouseMove);
	CM.canvas.addEventListener('mouseup', onMouseUp);

	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);

	if(!API.is_external){
		document.getElementById('stp_btn').addEventListener('click', () => {
			step(API.is_external);
		});
		document.getElementById('submit_btn').addEventListener('click', () => {
			addRow();
		});
		document.getElementById('draw_btn').addEventListener('click', () => {
			buildTransitionTable('t_table');
		});
		document.getElementById('save_btn').addEventListener('click', () => {
			save();
		});
		document.getElementById('load_btn').addEventListener('click', () => {
			load();
		});
		document.getElementById('toggle_dark').addEventListener('click', () => {
			toggleDarkMode();
		});
		document.getElementById('clear_btn').addEventListener('click', () => {
			CM.clearCanvas();
			localStorage.clear();
		});
	}

	//record the user input when typing in the input box
	arrow_menu.addEventListener('keyup', (e) => {
	    updateSelectedArrow();

	    if(e.keyCode === 13){
		    updateSelectedArrow();  
		    hideArrowMenu(); 
		    save();
	    }
	});


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
			CM.deleteNode(getClosestNode());
		}

		for(let i = 0; i < CM.arrows.length; i++){
			if(CM.arrows[i].is_mouse_over){
				CM.deleteArrow(CM.arrows[i]);
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
		API.call("right_mouse_down", e);
		return;
	}else{
		API.call("left_mouse_down", e);
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

	for (let a of CM.arrows) {
		if(a.is_mouse_over && CM.current_arrow === null){
			CM.current_arrow = a;
			CM.selected_arrow = a;
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

	if(!CM.is_over_node && IM.is_mouse_down && CM.current_arrow !== null){
		CM.current_arrow.moveToMouse();
        CM.selected_arrow = null;
	}
}


function onDoubleClick(e){
	let IM = inputManager.getInstance();
	let CM = canvasManager.getInstance();

	IM.mouse_pos = getMouse(e);
	API.call("double_click", e);
	if( !isOverNode() && !IM.is_key_down && CM.current_arrow === null) {
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
			CM.addNewArrow(CM.current_node, getClosestNode());
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
	let CM = canvasManager.getInstance();

	let if_ = document.getElementById("if_");
	let out = document.getElementById("out");

    if(CM.selected_arrow === null){
        return;
    }

    CM.selected_arrow.IF = if_.value;
	CM.selected_arrow.OUT = out.value;

	API.call("update_selected_arrow", if_.value, out.value);
}


function updateArrowMenu(){
	let CM = canvasManager.getInstance();
	if(CM.selected_arrow === null || CM.arrow_menu_drawn){
        return;
	}

	let if_ = document.getElementById("if_");
	let out = document.getElementById("out");

    if_.value = CM.selected_arrow.IF;
    out.value = CM.selected_arrow.OUT; 

   	API.call("update_arrow_menu", if_.value, out.value);
}


function drawArrowMenu(pos, if_text, out_text){
	let CM = canvasManager.getInstance();

	if(CM.selected_arrow === null || CM.is_arrow_menu_drawn){
		return;
	}

	let w = Math.round(arrow_menu.offsetWidth/2);
    updateArrowMenu();

	arrow_menu.style.display = "block";	
	arrow_menu.style.left = ((CM.canvas.offsetLeft + pos.X + 15) - w) + "px";
	arrow_menu.style.top = (CM.canvas.offsetTop + pos.Y + 15) + "px";
    
    CM.is_arrow_menu_drawn = true;
    if_.focus();
}


function hideArrowMenu(){
	let CM = canvasManager.getInstance();

    if( !CM.is_arrow_menu_drawn ){
        return;
    }

	arrow_menu.style.display = "none";
    CM.selected_arrow = null;
    CM.is_arrow_menu_drawn = false;
    
    refocus();
    save();
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
	inputManager,
	hideArrowMenu
}