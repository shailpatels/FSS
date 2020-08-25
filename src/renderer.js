import {canvasManager} from './canvasManager.js';
import {inputManager} from './input.js';
import {findAngle} from './lib/geometry.js';

/** @typedef { import('./lib/geometry.js').Point } Point */``

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
    let CM = canvasManager.getInstance();

	CM.context.fillStyle = "black";

	let sizex = 8 + line_width,
		sizey = 8 + line_width;

    let hx = sizex / 2,
    	hy = sizey / 2;

    CM.context.translate(pos.X, pos.Y);
    CM.context.rotate(angle);
    CM.context.translate(-hx,-hy);

    CM.context.beginPath();

    let pad = 5
    CM.context.moveTo(-(CM.node_radius+pad),0);
  	CM.context.lineTo(-(CM.node_radius+pad),(1*sizey));   
    CM.context.lineTo((1*sizex)- (CM.node_radius+pad),1*hy);
    CM.context.closePath();
    CM.context.fill();

    CM.context.translate(hx,hy);
    CM.context.rotate(-angle);
    CM.context.translate(-pos.X,-pos.Y);
}  


/**
* Draws an arrow that starts and ends at the same node
*
* @param {Point} start_pos - position of node to draw at
*/
function drawSelfArrowHelper(start_pos){
    let CM = canvasManager.getInstance();
    let IM = inputManager.getInstance();

    let angle = findAngle(start_pos, IM.mouse_pos);

    let a_offset = angle + (Math.PI/5);

    let pad = 30;

    CM.context.translate(start_pos.X, start_pos.Y);
    CM.context.rotate(-a_offset);

    CM.context.beginPath();
    CM.context.arc(pad,pad, CM.node_radius, 0, 2 * Math.PI);
    CM.context.stroke(); 

    CM.context.rotate(a_offset);
    CM.context.translate(-start_pos.X, -start_pos.Y);
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
    CM.canvas.width = CM.width * ratio;
    CM.canvas.height = CM.height * ratio;
    CM.canvas.style.width = CM.width + "px";
    CM.canvas.style.height = CM.height + "px";
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
    getDeviceRatio,
    drawArrowhead,
    drawSelfArrowHelper
}

