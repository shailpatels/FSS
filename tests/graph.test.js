const _G = require('../src/lib/graph.js');

Array.prototype.getLast = function() {
    return this[this.length - 1];
}

Array.prototype.remove = function(tgt) {
    for(var i = 0; i < this.length; i++)
    	if (this[i] === tgt){
    		this.splice(i,1);
    		break;
    	}
}

test('add vertex', () => {
	var g = new _G.Graph();
	expect( g.size ).toBe(0);

	g.addVertex(0);
	expect( g.size ).toBe(1);
	expect( g.graph.get(0) ).toStrictEqual([]);
});

test('add edge', () => {
	var g = new _G.Graph();
	expect( g.size ).toBe(0);

	g.addVertex(0);
	g.addVertex(1);
	g.addVertex(2);

	//0->1, 1->2;
	g.addEdge(0,1);
	g.addEdge(1,2);

	expect( g.size ).toBe(3);
	expect( g.graph.get(0) ).toStrictEqual([1]);
	expect( g.graph.get(1) ).toStrictEqual([2]);
	expect( g.graph.get(2) ).toStrictEqual([]);

});

test('delete vertex', () => {
	var g = new _G.Graph();
	g.addVertex(0);
	g.addVertex(1);
	g.addVertex(2);
	g.addVertex(3);

	g.addEdge(1,2);
	g.addEdge(1,3);
	g.addEdge(3,0);

	//1->2, 1->3, 3->0
	g.deleteVertex(2);
	expect(g.size).toBe(3);

	expect( g.graph.get(1) ).toStrictEqual([3]);
	expect( g.graph.get(2) ).toBe(undefined);

	g.deleteVertex(3);

	expect( g.graph.get(1) ).toStrictEqual([]);
	expect( g.graph.size ).toBe(g.size);

});

test('delete edge', () => {
	console.log(_G);
	var g = new _G.Graph();

	g.addVertex(0);
	g.addVertex(1);
	g.addEdge(0,1);

	expect(g.graph.get(0)).toStrictEqual([1]);
	g.deleteEdge(0,1);
	expect(g.graph.get(0)).toStrictEqual([]);
});
