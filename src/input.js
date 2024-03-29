import {API} from './api.js';
import {Point} from './lib/geometry.js';
import {isOverNode, getClosestNode, refocus} from './canvas.js';
import {canvasManager} from './canvasManager.js';
import {step, getNextString, simManager} from './simulate.js';
import {buildTransitionTable, save, load} from './lib/graph.js';
import {toggleDarkMode} from './renderer.js';

var inputManager = (function(){
    var instance;
    return {
        getInstance: function(){
            if (!instance) {
                instance = new __INPUT_MANAGER();
            }
            return instance;
        }
    };
})();


class __INPUT_MANAGER{
    constructor(){
        this.mouse_pos = new Point(0,0);
        this.is_key_down = false;
        this.is_mouse_down = false;
        this.is_dragging = false;

        this.LEFT_MOUSE_BUTTON = 0;
        this.RIGHT_MOUSE_BUTTON = 2;

        this.num_input_strings = 0;

        this.io_table = {
            in : [],
            out: []
        };
    }

    /**
    * save the io table to localStorage
    */ 
    saveIOTable(){
        localStorage.setItem('io_table', JSON.stringify(this.io_table));
    }

    /**
    * load the io table from localStorage
    */
    loadIOTable(){
        let table = localStorage.getItem('io_table');
        if(!table){
            return;
        }

        this.io_table = JSON.parse(table);

        for(let x of this.io_table['in']){
            addRowToDOM(x);
            this.num_input_strings ++;
        }
    }

    clear(){
        this.num_input_strings = 0;
        this.io_table = {
            in : [],
            out: []
        };
    }
}

/**
* Add JS event listeners for user input
* 
*/
function initControls(){
    let CM = canvasManager.getInstance();

    CM.canvas.addEventListener('mousedown', onMouseDown);
    CM.canvas.addEventListener('dblclick', onDoubleClick);
    CM.canvas.addEventListener('mousemove', onMouseMove);
    CM.canvas.addEventListener('mouseup', onMouseUp);

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    if(!API.is_external){
        document.getElementById('stp_btn').addEventListener('click', () => {
            step();
        });
        document.getElementById('submit_btn').addEventListener('click', () => {
            addRow();
        });
        document.getElementById('draw_btn').addEventListener('click', () => {
            buildTransitionTable('t_table');
        });
        document.getElementById('save_btn').addEventListener('click', () => {
            save();
        });
        document.getElementById('load_btn').addEventListener('click', () => {
            load();
        });
        document.getElementById('toggle_dark').addEventListener('click', () => {
            toggleDarkMode();
        });
        document.getElementById('clear_btn').addEventListener('click', () => {
            clearGame();
            if(timeout != null){
                clearTimeout(timeout);
            }
       });
        document.getElementById('string_input').addEventListener('keyup', (e) => {
            if(e.key === 'Enter'){
                addRow();
            }
            e.stopPropagation();
        });
        document.getElementById('run_btn').addEventListener('click', () => {
            setTimeout(() => {run()}, 0);
        });
        document.getElementById('reset_btn').addEventListener('click', () => {
            simManager.getInstance().resetSim();
        })
    }

    //record the user input when typing in the input box
    let arrow_menu = document.getElementById("arrow_menu");
    arrow_menu.addEventListener('keyup', (e) => {
        updateSelectedArrow();

        if(e.keyCode === 13){
            updateSelectedArrow();  
            hideArrowMenu(); 
            save();
        }
    });


}

let run_delay = 200;
var timeout = null;
function run(){
    step();

    if("" === getNextString()){
        return;
    }

    timeout = setTimeout(() => {run()}, run_delay);
}

function clearGame(){
    canvasManager.getInstance().clearCanvas();
    localStorage.clear();
    inputManager.getInstance().clear();
    clearIOTable();
} 

function onMouseUp(e){
    API.call("mouse_up", e);

    let IM = inputManager.getInstance();
    let CM = canvasManager.getInstance();

    IM.is_mouse_down = false;
    IM.is_dragging = false;

    if(e.button === IM.RIGHT_MOUSE_BUTTON){
        //remove all conections from this node
        if(isOverNode()){
            CM.deleteNode(getClosestNode());
        }

        for(let i = 0; i < CM.arrows.length; i++){
            if(CM.arrows[i].is_mouse_over){
                CM.deleteArrow(CM.arrows[i]);
                break;
            }
        }
        
        CM.current_node = null;
        CM.current_arrow = null;
        CM.start_node = null;
        return;
    }

    if(CM.is_starting_arrow){
        CM.is_starting_arrow = false;
        if(isOverNode()){
            //if we landed on another node create a new arrow
            CM.addNewArrow(CM.start_node, getClosestNode());
        }
    }
    
    if( !CM.is_over_node ){
        for (let i = CM.arrows.length - 1; i >= 0; i--) {
            if(CM.arrows[i].mouse_over && CM.selected_arrow === null){
                CM.selected_arrow = CM.arrows[i];
                break;
            }
        }
    }

    CM.current_node = null;
    CM.current_arrow = null;
    CM.start_node = null;
}


function onMouseDown(e){
    let IM = inputManager.getInstance();
    let CM = canvasManager.getInstance();

    IM.is_mouse_down = true;
    CM.selected_arrow = null;

    API.call("mouse_down", e);
    if(e.button === IM.RIGHT_MOUSE_BUTTON){
        API.call("right_mouse_down", e);
        return;
    }else{
        API.call("left_mouse_down", e);
    }

    if(e.shiftKey && CM.is_over_node){
        CM.is_starting_arrow = true;
        CM.current_node = getClosestNode();
        CM.start_node = CM.current_node;
    }
    if(CM.is_over_node && !IM.is_key_down){
        CM.current_node = getClosestNode();
        return;
    }

    for (let a of CM.arrows) {
        if(a.is_mouse_over && CM.current_arrow === null){
            CM.current_arrow = a;
            CM.selected_arrow = a;
            break;
        }
    }

    hideArrowMenu();
}


function onMouseMove(e){
    let IM = inputManager.getInstance();
    let CM = canvasManager.getInstance();

    IM.mouse_pos = getMouse(e);
    IM.is_dragging = IM.is_mouse_down;
    
    if(CM.nodes.length == 0 || IM.is_key_down) {
        return;
    }

    if(CM.current_node){
        CM.current_node.moveTo(IM.mouse_pos);
    }

    if(!CM.is_over_node && IM.is_mouse_down && CM.current_arrow !== null){
        CM.current_arrow.moveToMouse();
        CM.selected_arrow = null;
    }
}


function onDoubleClick(e){
    let IM = inputManager.getInstance();
    let CM = canvasManager.getInstance();

    IM.mouse_pos = getMouse(e);
    API.call("double_click", e);
    if( !isOverNode() && !IM.is_key_down && CM.current_arrow === null 
        && !CM.is_over_arrow && !CM.selected_arrow && !CM.is_arrow_menu_drawn) {
        CM.addNewNode();
        CM.curent_node = null;
        CM.current_arrow = null;
        CM.start_node = null;
        return;
    }
    
    let ref = getClosestNode();
    if( ref !== null && isOverNode()){
        ref.is_accept = !ref.is_accept;
    } 
        
    CM.current_node = null;
    CM.current_arrow = null;
    CM.start_node = null;
}


function onKeyUp(e){
    let IM = inputManager.getInstance();
    let CM = canvasManager.getInstance();

    API.call("key_up", e);
    IM.is_key_down = false;

    if(CM.is_starting_arrow){
        CM.is_starting_arrow = false;
        if(CM.is_over_node){
            //if we landed on another node create a new arrow
            CM.addNewArrow(CM.current_node, getClosestNode());
        }
    }

    CM.current_node = null;
}


function onKeyDown(e){
    API.call("key_down", e);
    let CM = canvasManager.getInstance();
    let IM = inputManager.getInstance();

    //draw arrow instead
    CM.current_node = null;
    IM.is_key_down = true;

    if(e.shiftKey && CM.is_over_node && IM.is_mouse_down){
        CM.is_starting_arrow = true;
        CM.current_node = getClosestNode();
    }
}


function updateSelectedArrow(){
    let CM = canvasManager.getInstance();

    let if_ = document.getElementById("if_");
    let out = document.getElementById("out");

    if(CM.selected_arrow === null){
        return;
    }

    CM.selected_arrow.IF = if_.value;
    CM.selected_arrow.OUT = out === null ? '' : out.value;

    API.call("update_selected_arrow", CM.selected_arrow.IF, CM.selected_arrow.OUT);
}


function updateArrowMenu(){
    let CM = canvasManager.getInstance();
    if(CM.selected_arrow === null || CM.arrow_menu_drawn){
        return;
    }

    let if_ = document.getElementById("if_");
    let out = document.getElementById("out");

    if_.value = CM.selected_arrow.IF;

    if(out !== null){
        out.value = CM.selected_arrow.OUT; 
    }

    API.call("update_arrow_menu", CM.selected_arrow.OUT, CM.selected_arrow.OUT);
}


//TODO: check if this function gets called correctly?
function drawArrowMenu(pos, if_text, out_text){
    let CM = canvasManager.getInstance();

    if(CM.selected_arrow === null || CM.is_arrow_menu_drawn){
        return;
    }

    let if_ = document.getElementById("if_");
    let out = document.getElementById("out");
    if_.value = if_text;

    if(out !== null){
        out.value = out_text;
    }

    let arrow_menu = document.getElementById("arrow_menu");
    let w = Math.round(arrow_menu.offsetWidth/2);
    updateArrowMenu();

    arrow_menu.style.display = "block"; 
    arrow_menu.style.left = ((CM.canvas.offsetLeft + pos.X + 15) - w) + "px";
    arrow_menu.style.top = (CM.canvas.offsetTop + pos.Y + 15) + "px";
    
    CM.is_arrow_menu_drawn = true;
    if_.focus();
}


//check if this function gets called correctly
function hideArrowMenu(){
    let CM = canvasManager.getInstance();

    if( !CM.is_arrow_menu_drawn ){
        return;
    }

    let arrow_menu = document.getElementById("arrow_menu");
    arrow_menu.style.display = "none";
    CM.selected_arrow = null;
    CM.is_arrow_menu_drawn = false;
    
    refocus();
    save();
}


/**
* Add a row to the io table
*/
function addRow(){
    const string = document.getElementById('string_input').value;
    const IM = inputManager.getInstance();

    IM.io_table['in'].push(string);

    addRowToDOM(string);
    IM.num_input_strings ++;
}

/**
* Write a string to the html page's IO table
*/
function addRowToDOM(string){
    const IM = inputManager.getInstance();
    const table = document.getElementById('io_table');

    if(string === ''){
        string = 'ε'
    }

    let output = `<tr><td id="str-${IM.num_input_strings}" data-full-string="${string}">`;
    for(let i = 0; i < string.length; i++){
        output += `<span id='str-${IM.num_input_strings}-${i}'>${string[i]}</span>`
    }
    output += `<td id="status-${IM.num_input_strings}"></td>  </td></tr>`;

    table.innerHTML += output;
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


/**
* corrects the raw mouse position to a mouse position relative to the canvas
* upper left corner is (0,0)
*
* @param {Point} pos - raw mouse position
* @returns {Point}
*/
function getMouse(pos){
    return new Point(pos.offsetX, pos.offsetY)  ;
}

/** @typedef { import('./lib/geometry.js').Point } Point */
export{
    clearGame,
    initControls,
    drawArrowMenu,
    inputManager,
    hideArrowMenu
}
