import {API} from './api.js';
import {canvasManager} from './canvasManager.js';
import {save} from './lib/graph.js';
import {inputManager} from './input.js';


var simManager = (function(){
    var instance = null;
 
    return {
        clear : function(){
            instance = null;
        },

        getInstance: function () {
            if (!instance) {
                instance = new __SIM_MANAGER();
            }
            return instance;
        }

    };
})();


class __SIM_MANAGER{
    constructor(){
        this.has_started = false;
        this.branches = [];
        this.str_index = 0;
        this.use_epsilon = false;
        this.current_branch_open = 0;
        this.is_deterministic = true;
        this.display_all = true;
    }

    resetSim(){ resetSim(); }

    getCurrentBranch(){
        return this.branches[this.current_branch_open];
    }
}

class SimState{
    constructor(start_node_index, string, index, inner_str_index = 0){
        this.current_node_index = start_node_index;
        this.string = string;
        this.inner_str_index = inner_str_index;
        this.accepted = false;
        this.is_done = false;
        this.branch_index = index;
    }

    step(){
        let CM = canvasManager.getInstance();
        let SM = simManager.getInstance();

        //check outgoing connections 
        let this_node = CM.nodes[this.current_node_index];
        let connections = this_node.connected_arrows;
        let matches = [];

        for(let c of connections){
            if(c.isDeparting(this_node)){
                continue;
            }

            if(c.IF === ""){
                matches.push(c.end_node.index);
                SM.use_epsilon = true;
            }else if(c.IF === this.string[this.inner_str_index]){
                matches.push(c.end_node.index);
            }
        }

        if(matches.length === 1){
            //deterministic can continue as normal
            CM.nodes[this.current_node_index].is_active = false;

            //only consume input on a literal match, not epsilon
            if(connections[0].IF === this.string[this.inner_str_index]){
                this.inner_str_index++;
                if(SM.display_all){
                    highlightNextChar();
                }
            }

            API.call("node_transition", this.current_node_index, matches[0], this.inner_str_index);
            this.current_node_index = matches[0];
            CM.nodes[this.current_node_index].is_active = true;
        }else if(matches.length === 0){
            //nothing more to do, check if we're in an accept state
            this.accepted = CM.nodes[this.current_node_index].is_accept && 
                            this.inner_str_index === this.string.length;
            CM.nodes[this.current_node_index].is_active = false;
            this.is_done = true;
            API.call("branch_complete", this );
        }else if(matches.length > 1){
            //need to branch on all posibilities
            this.is_deterministic = false;

            if(SM.branches.length === 1){
                createNewBranch(0);
            }

            let new_inner_str_index = this.inner_str_index;
            for(let i = 0; i < matches.length; i++){
                let child_index = this.inner_str_index;
                //only consume input on a literal match, not epsilon
                if(connections[i].IF === this.string[this.inner_str_index]){
                    child_index ++;
                }

                if(i === 0){
                    if(connections[i].IF === this.string[this.inner_str_index]){
                        new_inner_str_index++;
                        if(SM.display_all){
                            highlightNextChar();
                        }
                    }
                    continue;
                }

                
                let index = SM.branches.length;
                CM.nodes[matches[i]].is_active = true;
                SM.branches.push(new SimState(matches[i],this.string,index,child_index));
                createNewBranch(index);
            }

            //the first match will be followed by the 'main' branch
            CM.nodes[this.current_node_index].is_active = false;
            this.inner_str_index = new_inner_str_index;
            this.current_node_index = matches[0];
            CM.nodes[this.current_node_index].is_active = true;
        }

    }
}


function createNewBranch(branch_index){
    let branch_bar = document.getElementById('branches');
    if(!branch_bar){
        return;
    }

    let SM = simManager.getInstance();

    let new_btn = document.createElement('button');
    new_btn.appendChild(document.createTextNode(`Branch ${branch_index}`));
    new_btn.addEventListener('click', () => {
        displayBranch(branch_index);
    });
    branch_bar.appendChild(new_btn);

    let all_btn = document.getElementById('branch-all')
    all_btn.addEventListener('click', () => {
        SM.display_all = true;
    });
    all_btn.style.display = '';
}


function displayBranch(id){
    let SM = simManager.getInstance();
    SM.display_all = false;
    SM.current_branch_open = id;
    highlightChar( SM.getCurrentBranch().inner_str_index-1 );
}


function highlightNextChar(){
    if(API.is_external){
        return;
    }

    let SM = simManager.getInstance();
    let tgt = document.getElementsByClassName('highlight');

    if(tgt.length === 0){
        tgt = document.getElementById(`str-${SM.str_index}-0`);
        if(!tgt){
            return; 
        }
        tgt.className += 'highlight';
    }else{
        tgt[0].className = "";
        let branch = SM.branches[SM.current_branch_open];

        tgt = document.getElementById(`str-${SM.str_index}-${branch.inner_str_index}`);
        if(!tgt){
            return;
        }

        tgt.className += 'highlight';
    }
}


function highlightChar(index){
    if(API.is_external){
        return;
    }

    let tgt = document.getElementsByClassName('highlight');
    for(let t of tgt){
        tgt.className = '';
    }

    let SM = simManager.getInstance();
    tgt = document.getElementById(`str-${SM.str_index}-${index}`);
    tgt.className = 'highlight';
}


function moveToNextRow(){
    let SM = simManager.getInstance();
    let tgts = document.getElementsByClassName('highlight');
    for(let t of tgts){
        t.className = "";
    }
    let new_index = SM.str_index + 1;
    resetSim();
    SM = simManager.getInstance();
    SM.str_index = new_index;
}


function updateStatus(status){
    API.call("update_status", status);
    if(API.is_external){
        return;
    }

    let SM = simManager.getInstance();
    let tgt = document.getElementById(`status-${SM.str_index}`);
    if(!tgt){
        return;
    }

    tgt.innerHTML = status;
}

function step(){
    let SM = simManager.getInstance();
    let CM = canvasManager.getInstance();

    if(!SM.has_started){

        let string = API.is_external ? API.requestInput() : getNextString();
        let index = SM.branches.length;

        if(CM.nodes.length > 0){
            SM.branches.push(new SimState( 0, string ));
            CM.nodes[0].is_active = true;
            SM.has_started = true;
            highlightNextChar();
        }else{
            return;
        }

    }else{
        let all_done = true;
        let num_branches = SM.branches.length;

        for(let i = 0; i < num_branches; i++){
            if(!SM.branches[i].is_done){
                all_done = false;
                SM.branches[i].step();
            }

            if(SM.branches[i].accepted){
                updateStatus("Accept");
                moveToNextRow();
                //reset and move to next row
                return;
            }
        }

        if(!SM.display_all){
            highlightChar( SM.getCurrentBranch().inner_str_index-1 );
        }


        //all done?
        if(all_done){
            updateStatus("Reject");
            moveToNextRow();
        }
    }
}


function getNextString(){
    let SM = simManager.getInstance();
    let tgt = document.getElementById(`str-${SM.str_index}`);

    if(!tgt){
        return "";
    }

    return tgt.dataset.fullString;
}


function resetSim(){
    simManager.clear();
    clearTransitionTable();

    for(let n of canvasManager.getInstance().nodes){
        n.is_active = false;
    }

    let tgts = document.getElementsByClassName('highlight');
    for(let t of tgts){
        t.className = "";
    }

    let tgt = document.getElementById('branches');
    if(!tgt){
        return;
    }

    tgt.innerHTML = `<button style="display: none;" id="branch-all">All</button>`;
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


//instead of resetting the entire sim, only start back at state0
function resetFSS(){
    let SM = simManager.getInstance();
    SM.Q = [];

    SM.outbuff = "";
    SM.inbuff = "";
    SM.is_starting = true;
    SM.moved_next_row = false;
}



export {
    simManager,
    step
}
