
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