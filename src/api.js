//api is a set of functions that can be exposed 
//to other applications when important events happen

class API{
    //hashmap between a trigger and a function
    constructor(){
        this.funcs = {};
    }
    
     /** 
     create an event listener, whenever a trigger function occurs
     call all functions associated with it
    
    @param {String} trigger - api function to listen for
    @param {Object} funcs - a list of functions to call on the trigger event
    **/
    addHook( trigger, funcs ){
        this.funcs[trigger] = funcs;
    }

    //fires when the simulation moves from 1 row to the next
    onMoveNextTestCase( index, funcs ){
        let calls =  this.funcs["onMoveNextTestCase"] ;
        if ( typeof calls === "undefined")
            return;

        for (var c of calls )
            c( index ); 
    }

}



