

//a node represents a state in a FSM
/*NODE:
	pos: the position on the canvas of the node (its centerpoint)
	connected_arrows: a list of arrows connected to this node
	string: the label of the node e.g: S_1
*/
class Node{
	constructor(pos, str = null){
		this.pos = pos
		this.connected_arrows = [];
		this.label = str;
	}

	getConnectedArrowIndex(arr){
		for(var i = 0; i < this.connected_arrows.length; ++i){
			if(arr == this.connected_arrows[i])
				return i;
		}
		return -1;
	}

	moveTo(new_pos){
		this.pos = new_pos;
		for (var i = this.connected_arrows.length - 1; i >= 0; i--) {
			this.connected_arrows[i].moveTo(new_pos, this);
		}
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
	constructor(start, end){
		this.start_pos = start.pos;
		this.end_pos = end.pos;
		this.t = 0.5;
		this.ctrl_pos = getMidPoint(this.start_pos, this.end_pos);
		this.mouse_over = false;
		this.start_node = start;
		this.end_node = end;
	}

	draw(){

		context.fillStyle = "black";
		context.lineWidth = 2;

		if(this.mouse_over)
			context.lineWidth = 4;


		this.path = new Path2D();
		this.path.moveTo(this.start_pos.X, this.start_pos.Y);
		this.path.quadraticCurveTo(this.ctrl_pos.X,this.ctrl_pos.Y, 
								   this.end_pos.X, this.end_pos.Y);

		context.stroke(this.path); 


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

	isMouseOver(){	
		return context.isPointInStroke( this.hooverPath, mouse_pos.X, mouse_pos.Y );
	}

	moveTo(new_pos, selected_node){
		//the point connected to the selected node should be moved
		if(selected_node === this.start_node )
			this.start_pos = new_pos;
		else
			this.end_pos = new_pos;
	}
}