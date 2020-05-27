
/**
* There should only ever be only API object
*
* @type {Object} API_OBJ - singleton representing external interaction with FSS
* @prop {Object} clear - removes this obj
* @prop {Object} getInstance - returns the singleton, creates it if it doesn't exist
*
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


/**
* _API base class that handles interacting with FSS
*
* @typedef {Object} _API
*/
class _API{
    constructor(){
    	this.translation_table = new Map();
    }

    /**
    * adds a new function to be called with a defined action occurs
    * @param {String} func - name of the trigger
    * @param {Object} callback - a function to call when the trigger occurs
    */
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

    /**
    * call all functions related to a trigger
    * @param {String} func - name of the trigger
    * @param {Object} data - additional parameters to send to the functions associated with the given trigger
    */
    call(func, ...data){
    	let tgt = this.translation_table.get(func);
    	if ( typeof tgt === "undefined")
    		return;

    	let args = [];
    	for (let x of data){
    		args.push(x);
    	}

        let response = [];
    	for (let x of tgt){
    		response.push( x.apply(null, args) );
    	}

        return response;
    }
}


if ( typeof module !== "undefined")
	module.exports = {API_OBJ};