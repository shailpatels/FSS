const Graph = jest.requireActual('../src/graph.js');

test('add vertex', () => {
	var g = new Graph();
	expect( g.size ).toBe(0);
});