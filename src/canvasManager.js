

var canvasManager = (function(){
	function SingletonClass() {
	// ...
	}
	var instance;
	return {
		init : function (canvas) {
			instance = new __CANVAS_MANAGER(canvas);
			return instance;
		},

		getInstance: function(){
			if (!instance) {
				throw 'Canvas manager not initialized';
			}
			return instance;
		}
	};
})();


class __CANVAS_MANAGER{
	constructor(canvas_){
		this.canvas = canvas_;
		this.context = this.canvas.getContext("2d");  
	}
}

export{
	canvasManager
}