const Elements = jest.requireActual('../src/elements.js');
const Geometry = jest.requireActual('../src/geometry.js');

const Node = Elements['Node'];
const Arrow = Elements['Arrow'];
const Point = Geometry['Point'];
    
let index = 0;
function buildFakeNode(X,Y){
    let ret = new Node( new Point(X,Y) );
    ret.label = index.toString();
    index ++;
    return ret;
}


test('serialize node', () => {
    let n = new Node( new Point(100,500));
    n.label = '0';
    let json = n.serialize();
    json = JSON.parse(json);

    expect(json["pos"]["X"]).toBe( n.pos.X );
    expect(json["pos"]["Y"]).toBe( n.pos.Y );

    expect(json["label"]).toStrictEqual( n.label );
});

test('serialize arrow', () => {
    let a = new Arrow ( buildFakeNode(100,200), buildFakeNode(300,500), false, 0.0);
    let json = a.serialize(); 
    json = JSON.parse(json);
     
    expect(json["start_pos"]["X"]).toBe( 100 );
});
