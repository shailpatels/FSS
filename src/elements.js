

//a node represents a state in a FSM
/*Node:
	pos: the position on the canvas of the node (its centerpoint)
	connected_arrows: a list of arrows connected to this node
	label: the label of the node e.g: S_1
*/
class Node{
	constructor(pos, str = null){
		this.pos = pos
		this.connected_arrows = [];
		this.label = str;
		this.is_active = false;
	}

	moveTo(new_pos){
		this.pos = new_pos;
		for (var i = this.connected_arrows.length - 1; i >= 0; i--) {
			this.connected_arrows[i].moveByNode(new_pos, this);
		}
	}

	toString(){
		return this.label;
	}
}


//an arrow represents a connection in a FSM
/*ARROW
	start_pos: the position where the arrow started from
	end_pos: the position where the arrow ends
	midpoint: the position between the start & end points
	
	lenght(): returns the lenght of the arrow
	getClosestPoint(): returns either the start or end pos, depending on which is closer to the mouse pos
	setClosestPoint(): sets the closest point to a new position
*/

class Arrow{
	constructor(start, end, is_self_, angle_off){
		this.start_pos = start.pos;
		this.end_pos = end.pos;
		this.t = 0.5;
		this.ctrl_pos = getMidPoint(this.start_pos, this.end_pos);
		this.mouse_over = false;
		this.start_node = start;
		this.end_node = end;
		this.is_self = is_self_;
		this.angle_offset = angle_off;
		this.is_active = false;
	}
	
	draw(){
		if (this.is_self){
			this.drawSelfArrow();
			return;
		}

		context.fillStyle = "black";
		let line_width = 2;

		if(this.mouse_over)
			line_width = 4;

		context.lineWidth = line_width;
		this.path = new Path2D();
		this.path.moveTo(this.start_pos.X, this.start_pos.Y);
		this.path.quadraticCurveTo(this.ctrl_pos.X,this.ctrl_pos.Y, 
								   this.end_pos.X, this.end_pos.Y);

		context.stroke(this.path);
		let ang = findAngle(this.ctrl_pos, this.end_pos);
		drawArrowhead(this.end_pos, ang, line_width );

		this.hooverPath = new Path2D();
		this.hooverPath.moveTo(this.start_pos.X, this.start_pos.Y);
		this.hooverPath.quadraticCurveTo(this.ctrl_pos.X,this.ctrl_pos.Y, 
								         this.end_pos.X, this.end_pos.Y);

		context.lineWidth = 50;
		context.save();
		context.globalAlpha = 0.0;
		context.stroke(this.hooverPath); 
		context.restore();
	
		this.mouse_over = this.isMouseOver();		
		context.lineWidth = 1;
	}

	drawSelfArrow(){
		let line_width = 2;

		if(this.mouse_over)
			line_width = 4;

		context.lineWidth = line_width;
		let pad = 30;

	 	context.translate(this.start_pos.X, this.start_pos.Y);
	 	context.rotate(this.angle_offset);

	    context.beginPath();
	    context.arc(pad,pad, NODE_RADIUS, 0, 2 * Math.PI);
	    context.stroke();

	    this.hooverPath = new Path2D();
	    this.hooverPath.arc(pad,pad, NODE_RADIUS, 0, 2 * Math.PI);

	    context.lineWidth = 10;
	    context.save();
		context.globalAlpha = 0.0;
		context.stroke(this.hooverPath); 
		context.restore();

		this.mouse_over = this.isMouseOver();

	    context.rotate(-this.angle_offset);
	    context.translate(-this.start_pos.X, -this.start_pos.Y);

	    context.lineWidth = 1;
	    drawArrowhead(this.end_pos, this.angle_offset + Math.PI + (Math.PI/17), line_width );
	}


	isMouseOver(){	
		return context.isPointInStroke( this.hooverPath, mouse_pos.X, mouse_pos.Y );
	}

	moveByNode(new_pos, selected_node){
		if(this.is_self){
			this.start_pos = new_pos;
			this.end_pos = new_pos;
		}

		//the point connected to the selected node should be moved
		if(selected_node === this.start_node )
			this.start_pos = new_pos;
		else
			this.end_pos = new_pos;
	}
     
    moveToMouse(){
    	current_arrow.ctrl_pos = mouse_pos;
    	if(this.is_self)
    		this.angle_offset = findAngle(this.start_pos, mouse_pos);
    }
}

