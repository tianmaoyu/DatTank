/*
 * @authour ohmed
 * Stones map decoration
*/

var Stones1 = function ( arena, params ) {

    this.id = Stones1.numIds ++;

    Game.Decoration.call( this, arena, params );

    this.size.set( 0.8, 0.8, 0.8 );

    this.init();

};

Stones1.prototype = Object.create( Game.Decoration.prototype );

Stones1.prototype.init = function () {

    var position = this.position;
    var sizeX = this.size.x * this.scale.x;
    var sizeY = this.size.y * this.scale.y;
    var sizeZ = this.size.z * this.scale.z;
    var id = this.id;

    this.arena.pathManager.placeObject( new Game.Vec3( position.x - sizeX / 2, 0, position.z - sizeZ / 2 ), new Game.Vec3( position.x + sizeX / 2, 0, position.z + sizeZ / 2 ) );
    this.arena.collisionManager.addObject( position, sizeX, sizeY, sizeZ, id );

};

Stones1.prototype.toJSON = function () {

    return {
        id:         this.id,
        name:       this.name,
        type:       'rock1',
        position:   this.position.toJSON(),
        rotation:   this.rotation,
        scale:      this.scale.toJSON()
    };

};

//

module.exports = Stones1;
