import {simManager,step} from '../src/simulate.js';
import {canvasManager} from '../src/canvasManager.js';
import {Node} from '../src/elements.js';
import {Point} from '../src/lib/geometry.js';
import {API} from '../src/api.js';

canvasManager.init({getContext : function(){return null}});

API.is_external = true;

test('test empty sim', () => {
	step(true);
});

test('test sim 1', () => {
	let n = new Node(new Point(), "foo" );
	let m = new Node(new Point(), "bar" );
	
});
