//Draw an arrow at the end of the curve to show the direction
// SRC : https://stackoverflow.com/questions/6576827/html-canvas-draw-curved-arrows
function drawArrowhead(pos, angle, line_width) {
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

function drawSelfArrow(start_pos){

    let angle = findAngle(start_pos, mouse_pos);
    //console.log( radToDeg(angle) );

    let pad = 30;

    context.translate(start_pos.X, start_pos.Y);
    context.rotate(angle);

    context.beginPath();
    context.arc(pad,pad, NODE_RADIUS, 0, 2 * Math.PI);
    context.stroke(); 

    context.rotate(-angle);
    context.translate(-start_pos.X, -start_pos.Y);
} 