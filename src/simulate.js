import {API} from './api.js';
import {canvasManager} from './canvasManager.js';
import {save} from './lib/graph.js';

var simManager = (function(){
    var instance = null;
 
    return {
        clear : function(){
            instance = null;
        },

        getInstance: function () {
            if (!instance) {
                instance = new __SIM_MGR();
            }
            return instance;
        }

    };
})();


class __SIM_MGR{
    resetSim () { resetSim() }
}


/**
* A simulation state represents a potential branch the FSM is exploring 
*/
class __SIM_STATE{

}


/**
* collect all the table cells ignoring the ones used in the transition table
*
* @returns {Array} - Array of HTML elements
*/
function getTableCells(){
    if (API.is_external){
        return [];
    }

    let tmp  = document.getElementsByTagName("td") || [];
    let ret = [];
    for (let t of tmp){
        if (t.className === "t_tbl"){
            continue;
        }

        ret.push(t);
    }
    return ret;
}


function resetSim(){
    simManager.clear();

    clearIOTable();
    clearTransitionTable();
}

function clearTransitionTable(){
    if(API.is_external){
        return;
    }
    document.getElementById("t_table").innerHTML = 
        `<tr>
            <th> State </th>
            <th> Input </th>
            <th> Next State </th>
        </tr>`
}

function clearIOTable(){
    if (API.is_external){
        return;
    }
    document.getElementById("io_table").innerHTML = 
        `<tbody>
            <tr><th>Input</th></tr>
        </tbody>`;
}

//instead of resetting the entire sim, only start back at state0
function resetFSS(){
    let SM = simManager.getInstance();
    SM.Q = [];

    SM.outbuff = "";
    SM.inbuff = "";
    SM.is_starting = true;
    SM.moved_next_row = false;
}


function step(){
    
}




export {
    simManager,
    step
}
