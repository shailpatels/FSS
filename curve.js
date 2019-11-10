

class Curve{
	constructor(start, end){
		this.start_pos = start;
		this.end_pos = end;
		this.t = 0.5;
		this.ctrl_pos = getMidPoint(this.start_pos, this.end_pos);
		this.mouse_over = false;
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

		context.lineWidth = 25;
		context.save();
		context.globalAlpha = 0.0;
		
		// context.fill(hooverPath);
		context.stroke(this.hooverPath); 
		context.restore();
	
		this.mouse_over = this.isMouseOver();		
		context.lineWidth = 1;
	}

	isMouseOver(){	
		return context.isPointInStroke( this.hooverPath, pos.X, pos.Y );
	}

}