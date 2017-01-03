/*
 * @author ohmed
 * HealthBox main class
*/

var Health = function ( arena, params ) {

    Game.Box.call( this, arena, params );

    this.type = 'Health';
    this.amount = 20;

    //

    this.init();

};

Health.prototype = Object.create( Game.Box.prototype );

Health.prototype.pickUp = function ( player ) {

    player.health += this.amount;
    player.health = Math.min( player.health, 100 );

    player.hit( false );

    //

    this.arena.announce( 'pickedBox', { id: this.id } );

    if ( player.socket ) {

        networkManager.send( player.socket, 'gotBox', { box: this.toJSON(), value: player.health } );

    }

};

//

module.exports = Health;
