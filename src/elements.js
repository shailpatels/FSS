

/*Node:
	pos: the position on the canvas of the node (its centerpoint)
	connected_arrows: a list of arrows connected to this node
	label: the label of the node e.g: S_1
*/
class Node{
	/**
	@param {Point} pos
	@param {string} str - label to give node
	*/
	constructor(pos = null, str = ""){
		if (pos === null)
			pos = new Point();
		this.pos = pos
		this.connected_arrows = [];
		this.label = str;
		this.is_active = false;
        this.is_accept = false;
	}

	serialize(){
        function replacer(key,value){
            if(key === "connected_arrows")
                return undefined;
            
            return value;
        }

        return JSON.stringify(this, replacer);
	}

	/**
	Move this node along to a new position, will drag the ends of 
	connected arrows with it

	@param {Point} new_pos
	**/
	moveTo(new_pos){
		this.pos = new_pos;
		for (var i = this.connected_arrows.length - 1; i >= 0; i--) {
			this.connected_arrows[i].moveByNode(new_pos, this);
		}
	}

	/** @returns {string} */
	toString(){
		return this.label;
	}

	draw(){
		context.beginPath();
		context.arc(this.pos.X, this.pos.Y, NODE_RADIUS, 0, 2 * Math.PI);
		context.stroke();
       
		if(!this.mouse_over){
			context.beginPath();
			context.arc(this.pos.X, this.pos.Y, NODE_RADIUS - 0.5, 0, 2 * Math.PI);
			context.fillStyle = this.is_active ? "yellow" : "white";
			context.fill();
		}
		else{
			context.save();
			context.globalAlpha = 0.75;
			context.fillStyle = "CornflowerBlue";
			context.fill();
			context.restore();

		}
    
        if(this.is_accept){
            context.beginPath();
            context.arc(this.pos.X, this.pos.Y, NODE_RADIUS - 7, 0, 2 * Math.PI);
            context.stroke();
        }
	
		this.mouse_over = this.mouseOver();
		drawLabel(this.label, this.pos);
	}

    /** @returns {boolean} **/
	mouseOver(){
		return isOverNode() && getClosestNode() === this;
	}

}


//an arrow represents a connection in a FSM
/*ARROW
	start_pos: the position where the arrow started from
	end_pos: the position where the arrow ends
	ctrl_pos: the position between the start & end points
*/

class Arrow{
	/**
	@param {Node} start
	@param {Node} end
	@param {boolean} is_self_ - does the arrow enter and leave the same node
	@param {number}	angle_off angle offset the mouse clicked on, used for self arrows
	*/
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
		this.mid_point = this.getCurveMidPoint();

		this.IF = "";
		this.OUT = "";
	}
        
    isDeparting(node){
        return node !== this.start_node && !this.is_self;
    }
	
	serialize(){
        function replacer(key,value){
            if(key === "start_node" || key === "end_node")
                return value.serialize();

            return value;
        }
    
        let tmp = JSON.stringify( this, replacer );
        return tmp;
	}

	getCurveMidPoint(){
		var ax = getMidPoint( this.ctrl_pos, this.start_pos );
		var bx = getMidPoint( this.ctrl_pos, this.end_pos)

		var m = getMidPoint(ax,bx);


		return m;
	}

	draw(){
		if (this.is_self){
			this.drawSelfArrow();
			return;
		}

		context.fillStyle = "black";
		let line_width = 2;

		if(this.mouse_over || this === selected_arrow)
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

		if(this === selected_arrow){
			drawArrowMenu(this.mid_point,this.IF,this.OUT);
		}
		else if(this.IF != ""){
            let text = this.OUT === "" ? this.IF : this.IF + " : " + this.OUT;
            let w = context.measureText(text).width;
            
            let Y = this.mid_point.Y;
            let X = this.mid_point.X; 
            let m = getMidPoint( this.start_pos, this.end_pos );

            if ( this.mid_point.Y > m.Y ){
                Y += 25;
            }else{
                Y -= 10;
            }

            if( this.mid_point.X > m.X ){
                X += (w + 5);
            }else{
                X -= (w);
            }
                
            let pt = new Point( X - w, Y );
			drawText(text, pt);
		}
	}

	drawSelfArrow(){
		let line_width = 2;

		if(this.mouse_over || this === selected_arrow)
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

	    context.lineWidth = 7;
	    context.save();
		context.globalAlpha = 0.0;
		context.stroke(this.hooverPath); 
		context.restore();

		this.mouse_over = this.isMouseOver();

	    context.rotate(-this.angle_offset);
	    context.translate(-this.start_pos.X, -this.start_pos.Y);

	    context.lineWidth = 1;
	    drawArrowhead(this.end_pos, this.angle_offset + Math.PI + (Math.PI/17), line_width );
    
        let d = 75;
        let X = Math.cos((this.angle_offset)) * d;
        let Y = Math.sin((this.angle_offset)) * d;
        
        X += (this.start_node.pos.X );
        Y += (this.start_node.pos.Y );
            
        let pt = new Point(X,Y);
        if(this === selected_arrow){
            drawArrowMenu(pt ,this.IF,this.OUT);
        }else if(this.IF != ""){
            let text = this.OUT === "" ? this.IF : this.IF + " : " + this.OUT;
            let w = context.measureText(text).width;
            
            drawText(text,pt); 
        }
	}


	isMouseOver(){	
		return context.isPointInStroke( this.hooverPath, mouse_pos.X, mouse_pos.Y );
	}

	/**
	moveByNode updates the arrows position when a conencted node is moved
	should be called by moveTo on a node object

	@param {Point} new_pos - tgt pos
	@param {Node} selected_node - node moving this arrow
	**/
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

		this.mid_point = this.getCurveMidPoint();
	}
     
    moveToMouse(){
    	current_arrow.ctrl_pos = mouse_pos;
    	if(this.is_self)
    		this.angle_offset = findAngle(this.start_pos, mouse_pos);

    	this.mid_point = this.getCurveMidPoint();
    }
}

function serializeArrows(arrs){
	let ret = [];
	for(var i = 0; i < arrs.length; i++){
		ret.push(arrs[i].serialize());
	}
	return JSON.stringify( ret );
}

/** @typedef { import('./geometry.js').Point } Point */
if(typeof module !== 'undefined'){
    const Geometry = jest.requireActual('./geometry');
    getMidPoint = Geometry['getMidPoint'];
    module.exports = {Node,Arrow};
}
