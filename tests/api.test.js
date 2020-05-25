const _A = jest.requireActual('../src/api.js');

test('basic test', () => {
    let foo = function (response){ expect(response).toBe(2); } ;
    let api = _A.API_OBJ.getInstance();

    api.addFunc( "test1" , foo);
    api.call("test1", 2);
    _A.API_OBJ.clear();
});


test('test empty', () => {
    let api = _A.API_OBJ.getInstance();

    api.call("foo", "foo");
    _A.API_OBJ.clear();
});


test('test multiple funcs', () => {
    let api = _A.API_OBJ.getInstance();

    let foo = function (response){ expect(response).toBe("test"); } ;
    let bar = function (response){ expect(response).toBe("test"); } ;
    let baz = function (response){ expect(response).toBe("test"); } ;
        
    api.addFunc( "a" , foo);
    api.addFunc( "a" , bar);
    api.addFunc( "a" , baz);

    api.call("a", "test");

    _A.API_OBJ.clear();
});


test('test multiple args', () => {
    let api = _A.API_OBJ.getInstance();
    let foo = function (a,b,c){ 
        expect(a).toBe(1);
        expect(b).toBe("foo");
        expect(c).toBe(3.14); 
    } ;

    api.addFunc("test", foo);
    api.call("test", 1, "foo", 3.14 );
    _A.API_OBJ.clear();
});