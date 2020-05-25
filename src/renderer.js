
//Draw an arrow at the end of the curve to show the direction
// SRC : https://stackoverflow.com/questions/6576827/html-canvas-draw-curved-arrows


/**
Draws an arrowhead at a given point - usually a node

@param {Point} pos - position of node to draw the arrow at
@param {Number} angle - angle arrow should point at in rads
@param {Number} line_width - thickness to draw arrow 
**/
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

/**
Draws an arrow that starts and ends at the same node

@param {Point} start_pos - position of node to draw at
**/
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


function foo () {
    console.log(context);
    var ctx = context,
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
}

createHiDPICanvas = function(w, h) {
    ratio = foo();
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
}


/**
* https://stackoverflow.com/questions/
* 15661339/how-do-i-fix-blurry-text-in-my-html5-canvas
*/
function initCanvas() {
    return createHiDPICanvas(width,height );
    // Get the device pixel ratio, falling back to 1.
    var dpr = window.devicePixelRatio || 1;
    // Get the size of the CANVAS in CSS pixels.
    var rect = canvas.getBoundingClientRect();
    // Give the CANVAS pixel dimensions of their CSS
    // size * the device pixel ratio.
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    context.scale(dpr, dpr);
}