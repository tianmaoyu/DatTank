/*
 * @author ohmed
 * Tank "T29" unit class
*/

var T29 = function ( params ) {

    Game.Tank.call( this, params );

    this.title = 'T29';

    this.speed = 35;
    this.armour = 102;
    this.bullet = 76;
    this.ammoCapacity = 127;
    this.rpm = 16.67;

    this.typeId = 1;

};

T29.prototype = Object.create( Game.Tank.prototype );

//

module.exports = T29;
