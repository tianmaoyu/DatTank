/*
 * @author ohmed
 * DatTank Arena players manager
*/

import { PlayerCore } from "./../core/Player.Core";
import { Arena } from "./../core/Arena.Core";

//

class PlayerManager {

    private players: Array<PlayerCore>;

    //

    public add ( player: PlayerCore ) {

        if ( player.id === Arena.me.id ) {

            Arena.me = player;
    
        }
    
        this.players.push( player );

    };

    public remove ( player: PlayerCore ) {

        var newPlayersList = [];
    
        for ( var i = 0, il = this.players.length; i < il; i ++ ) {
    
            if ( this.players[ i ].id === player.id ) {
    
                player.tank.dispose();
                continue;
    
            }
    
            newPlayersList.push( this.players[ i ] );
    
        }
    
        this.players = newPlayersList;

    };

    public getById ( playerId: number ) {

        for ( var i = 0, il = this.players.length; i < il; i ++ ) {

            if ( this.players[ i ].id === playerId ) {
    
                return this.players[ i ];
    
            }
    
        }
    
        return false;

    };

    public init () {

        // todo

    };

};

//

export { PlayerManager };
