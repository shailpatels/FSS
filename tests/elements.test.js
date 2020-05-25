const _E = jest.requireActual('../src/elements.js');
const _G = jest.requireActual('../src/lib/geometry.js');

    
let index = 0;
function buildFakeNode(X,Y){
    let ret = new _E.Node( new _G.Point(X,Y) );
    ret.label = index.toString();
    index ++;
    return ret;
}


test('serialize node', () => {
    let n = new _E.Node( new _G.Point(100,500) );
    n.label = '0';
    let json = n.serialize();
    json = JSON.parse(json);

    expect(json["pos"]["X"]).toBe( n.pos.X );
    expect(json["pos"]["Y"]).toBe( n.pos.Y );

    expect(json["label"]).toStrictEqual( n.label );
});


test('serialize arrow', () => {
    let a = new _E.Arrow ( buildFakeNode(100,200), buildFakeNode(300,500), false, 0.0);
    let json = a.serialize(); 
    json = JSON.parse(json);
     
    expect(json["start_pos"]["X"]).toBe( 100 );
});
