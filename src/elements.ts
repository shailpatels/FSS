import {context, mouse_pos, NODE_RADIUS} from "./canvas";
import {findAngle, getMidPoint} from "./geometry";


//a node represents a state in a FSM
/*NODE:
	pos: the position on the canvas of the node (its centerpoint)
	connected_arrows: a list of arrows connected to this node
	label: the label of the node e.g: S_1
*/
export class Node {
    public pos: any;
    public connected_arrows: any;
    public label: any;

	constructor(pos, str = null){
		this.pos = pos
		this.connected_arrows = [];
		this.label = str;
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

export class Arrow{
    public start_pos: any;
    public end_pos: any;
    public t: any;
    public ctrl_pos: any;
    public mouse_over: any;
    public start_node: any;
    public end_node: any;
    public is_self: any;
    public path: any;
    public hooverPath: any;

	constructor(start, end, is_self = false){
		this.start_pos = start.pos;
		this.end_pos = end.pos;
		this.t = 0.5;
		this.ctrl_pos = getMidPoint(this.start_pos, this.end_pos);
		this.mouse_over = false;
		this.start_node = start;
		this.end_node = end;
		this.is_self = false;
	}

	draw(){
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
		this.drawArrowhead(this.end_pos, ang, line_width );

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

	//Draw an arrow at the end of the curve to show the direction
	// SRC : https://stackoverflow.com/questions/6576827/html-canvas-draw-curved-arrows
	drawArrowhead(pos, angle, line_width) {
		context.fillStyle = "black";

		let sizex = 8 + line_width,
			sizey = 8 + line_width;

	    var hx = sizex / 2,
	    	hy = sizey / 2;

	    context.translate(pos.X, pos.Y);
	    context.rotate(angle);
	    context.translate(-hx,-hy);

	    context.beginPath();

	    let pad = 5
	    context.moveTo(-(NODE_RADIUS+pad),0);
	  	context.lineTo(-(NODE_RADIUS+pad),(1*sizey));
	    context.lineTo((1*sizex)- (NODE_RADIUS+pad),1*hy);
	    context.closePath();
	    context.fill();

	    context.translate(hx,hy);
	    context.rotate(-angle);
	    context.translate(-pos.X,-pos.Y);
	}
}

