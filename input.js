
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
			for(var i = 0; i < getClosestNode().connected_arrows.length; ++i)
				arrows.splice( getArrowIndex(getClosestNode().connected_arrows[i]) , 1);

			//update labels
			for(var i = getNodeIndex(getClosestNode()); i < nodes.length; ++i)
				nodes[i].string = i-1;
			//remove from list
			nodes.splice(getNodeIndex(getClosestNode()), 1);
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