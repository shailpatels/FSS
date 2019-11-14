
canvas.addEventListener('mousemove', (e) => {
		mouse_pos = getMouse(e);
		pos.set(e.offsetX, e.offsetY);
		if(nodes.length == 0 || key_down) 
			return;

		if(current_node){
			current_node.pos = mouse_pos;
			return;
		}

		if(!isOverNode() && mouse_down && current_arrow){
			current_arrow.setCtrl_pos(mouse_pos);
		}
	});