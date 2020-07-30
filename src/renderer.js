import {canvasManager} from './canvasManager.js';
import {width,height} from './canvas.js';
//Draw an arrow at the end of the curve to show the direction
// SRC : https://stackoverflow.com/questions/6576827/html-canvas-draw-curved-arrows


/**
* Draws an arrowhead at a given point - usually a node
*
* @param {Point} pos - position of node to draw the arrow at
* @param {Number} angle - angle arrow should point at in rads
* @param {Number} line_width - thickness to draw arrow 
*/
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


/** @typedef { import('./lib/geometry.js').Point } Point */``
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


/** returns the device's pixel ratio for HiDPI displays */
function getDeviceRatio () {
    let CM = canvasManager.getInstance();
    let dpr = window.devicePixelRatio || 1;
    let bsr = CM.context.webkitBackingStorePixelRatio ||
          CM.context.mozBackingStorePixelRatio ||
          CM.context.msBackingStorePixelRatio ||
          CM.context.oBackingStorePixelRatio ||
          CM.context.backingStorePixelRatio || 1;

    return dpr / bsr;
}


/**
* https://stackoverflow.com/questions/
* 15661339/how-do-i-fix-blurry-text-in-my-html5-canvas
*/
function initCanvas() {
    let ratio = getDeviceRatio();
    let CM = canvasManager.getInstance();
    CM.canvas.width = width * ratio;
    CM.canvas.height = height * ratio;
    CM.canvas.style.width = width + "px";
    CM.canvas.style.height = height + "px";
    //                    a     b  c  d      e  f
    CM.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    /**
    [ a c e 
      b d f
      0 0 1
    ]
    */
}

export{
    initCanvas,
    getDeviceRatio
}

