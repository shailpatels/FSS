
/**
* _API base class that handles interacting with FSS from outsite programs
*
* @typedef {Object} _API
*/
class _API{
    constructor(){
    	this.translation_table = new Map();
        this.is_external = false;
    }

    clear(){
        this.translation_table.clear();
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
    	if ( typeof tgt === "undefined"){
    		return;
        }

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

//global object shared between program
var API = new _API();

export{
    API,
    _API /* used for testing */
}