
class Point{
	constructor(X_,Y_){
		this.X = X_;
		this.Y = Y_;
	}

	set(X_,Y_){
		this.X = X_;
		this.Y = Y_;
	}
}

function getDistance(a, b){
	let x_ = Math.abs(a.X - b.X);
	let y_ = Math.abs(a.Y - b.Y);
	return Math.hypot(x_, y_); 
}

function isCloser(test_pos, a, b){
	return getDistance(test_pos, a) <= getDistance(test_pos, b);
}

function findAngle(start_pos, end_pos) {
    // make sx and sy at the zero point
    return Math.atan2((end_pos.Y - start_pos.Y), (end_pos.X - start_pos.X));
}

function getMidPoint(a, b){
	let X = Math.abs(a.X + b.X)/2;
	let Y = Math.abs(a.Y + b.Y)/2;
	return new Point(X, Y);
}
