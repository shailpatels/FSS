
/**
* There should only ever be only API object
* https://www.dofactory.com/javascript/singleton-design-pattern
*/
var API_OBJ = (function(){
    var instance = null;

    function createInstance() {
        return new _API;
    }
 
    return {
        clear : function(){
            instance = null;
        },

        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }

    };
})();


class _API{
    constructor(){
    	this.translation_table = new Map();
    }

    addFunc(func, callback){
    	let tgt = this.translation_table.get(func);
    	let set = [];
    	if (typeof tgt === "undefined") {
    		set = [callback]; 
    	}else{
    		tgt.push(callback);
    		set = tgt;
    	}

    	this.translation_table.set(func, set);
    }

    call(func, ...data){
    	let tgt = this.translation_table.get(func);
    	if ( typeof tgt === "undefined")
    		return;

    	let args = [];
    	for (let x of data){
    		args.push(x);
    	}

    	for (let x of tgt){
    		x.apply(null, args);
    	}
    }
}


if ( typeof module !== "undefined")
	module.exports = {API_OBJ};