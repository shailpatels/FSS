	
/**
Add JS event listeners for user input

@param {HTMLCanvasElement} canvas
*/
function initControls(canvas){

let if_ = document.getElementById("if_");
let out = document.getElementById("out");

canvas.addEventListener('mousedown', (e) => {
	mouse_down = true;
	selected_arrow = null;
	if(e.button === RIGHT_MOUSE_BUTTON)
		return;

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

});

canvas.addEventListener('dblclick', (e) => {
	mouse_pos = getMouse(e);
	if( !isOverNode() && !key_down && current_arrow === null) {
		addNewNode();
        curent_node = null;
        current_arrow = null;
        start_node = null;
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
	mouse_pos = getMouse(e);
	dragging = mouse_down;
    
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
    updateSelectedArrow();
});

arrow_menu.addEventListener('keyup', (e) => {
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
	if(selected_arrow === null || arrow_menu_drawn)
		return;

	let w = Math.round(arrow_menu.offsetWidth/2);
    updateArrowMenu();

	arrow_menu.style.display = "block";	
	arrow_menu.style.left = ((canvas.offsetLeft + pos.X + 15) - w) + "px";
	arrow_menu.style.top = (canvas.offsetTop + pos.Y + 15) + "px";
    
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
corrects the raw mouse position to a mouse position relative to the canvas
upper left corner is (0,0)

@param {Point} pos - raw mouse position
@returns {Point}
*/
function getMouse(pos){
	return new Point(pos.offsetX, pos.offsetY);
}
