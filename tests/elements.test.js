import {Node, Arrow} from '../src/elements.js';
import {Point} from '../src/lib/geometry.js';
    
function buildFakeNode(X,Y){
    let index = 0;
    let ret = new Node( new Point(X,Y), index.toString() );
    index ++;
    return ret;
}


test('serialize node', () => {
    let n = buildFakeNode(500,500);
    let json = n.serialize();
    json = JSON.parse(json);

    expect(json["pos"]["X"]).toBe( n.pos.X );
    expect(json["pos"]["Y"]).toBe( n.pos.Y );

    expect(json["label"]).toStrictEqual( n.label );
});


test('serialize arrow', () => {
    let a = new Arrow ( 
        buildFakeNode(100,200), 
        buildFakeNode(300,500), 
        false, 0.0
    );
    
    let json = a.serialize(); 
    json = JSON.parse(json);
     
    expect(json["start_pos"]["X"]).toBe( 100 );
});
