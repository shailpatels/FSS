const _S = jest.requireActual('../src/simulate.js');
const _E = jest.requireActual('../src/elements.js');
const _G = jest.requireActual('../src/lib/geometry.js');
const _C = jest.requireActual('../src/canvas.js');


test('test empty sim', () => {
	_S.step(true);
});

test('test sim 1', () => {
	let n = new _E.Node(new _G.Point(), "foo" );
	let m = new _E.Node(new _G.Point(), "bar" );
	
});