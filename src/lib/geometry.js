
/** 
* point represents 2D position
* @typedef {Object} Point
*/ 
class Point{
	/**
	* @param {Number} X_
	* @param {Number} Y_
	*/
	constructor(X_ = 0,Y_ = 0){
		this.X = X_;
		this.Y = Y_;
	}

	/**
	* @param {Number} X_
	* @param {Number} Y_
	*/
	set(X_,Y_){
		this.X = X_;
		this.Y = Y_;
	}
}


/**
finds euclidean distance between two points
* 
* @param {Point} a
* @param {Point} b
* @returns {Number}
*/
function getDistance(a, b){
	let x_ = Math.abs(a.X - b.X);
	let y_ = Math.abs(a.Y - b.Y);
	return Math.hypot(x_, y_); 
}


/**
* finds angle between two points
*
* @param {Point} start_pos
* @param {Point} end_pos
* @returns {Number}
*/
function findAngle(start_pos, end_pos) {
    // make sx and sy at the zero point
    return Math.atan2((end_pos.Y - start_pos.Y), (end_pos.X - start_pos.X));
}

/**
* find the midpoint between two points
* 
* @param {Point} a
* @param {Point} b
* @returns {Point}
*/
function getMidPoint(a, b){
	let X = Math.abs(a.X + b.X)/2;
	let Y = Math.abs(a.Y + b.Y)/2;
	return new Point(X, Y);
}

/**
* converts radians to degrees
*
* @param {Number} rad
* @returns {Number}
*/
function radToDeg(rad){
	return rad * (180/Math.PI);
}


//https://stackoverflow.com/questions/27205018/multiply-2-matrices-in-javascript
function matrixDot (A, B) {
    var result = new Array(A.length).fill(0).map(row => new Array(B[0].length).fill(0));

    return result.map((row, i) => {
        return row.map((val, j) => {
            return A[i].reduce((sum, elm, k) => sum + (elm*B[k][j]) ,0)
        })
    })
}


function transformPoint(p){
	//use the transformation matrix to get the real canvas position
	let m = matrixDot(
		[[p.X, p.Y]], 
      	[[ratio, 0, 0 ], 
       	 [0, ratio, 0], 
       	 [0,0,1]]
    )[0];

    return new Point(m[0],m[1]);
}


if(typeof module !== 'undefined')
    module.exports = {Point, getMidPoint};
