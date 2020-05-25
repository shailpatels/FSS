const _S = jest.requireActual('../src/simulate.js');
const _E = jest.requireActual('../src/elements.js');
const _G = jest.requireActual('../src/lib/geometry.js');


test('test empty sim', () => {
	_S.step();
});

test('test sim 1', () => {
	let n = new _E.Node(new _G.Point(), "foo" );
});