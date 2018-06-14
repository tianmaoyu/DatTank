/*
 * @author ohmed
 * DatTank Arena network handler
*/

import * as OMath from "./../OMath/Core.OMath";
import { Network } from "./../network/Core.Network";
import { Arena } from "./../core/Arena.Core";
import { BoxManager } from "./../managers/Box.Manager";
import { ControlsManager } from "./../managers/Control.Manager";
import { UI } from "./../ui/Core.UI";

//

class ArenaNetwork {

    private playerDied ( data ) {

        let player = data.player;
        let killer = data.killer;

        Arena.playerKilled( player, killer );

    };

    private newExplosion ( data ) {

        let bulletId = data[0];
        let x = data[1];
        let y = 26;
        let z = data[2];

        Arena.newExplosion( new OMath.Vec3( x, y, z ), bulletId );

    };

    private newTowers ( data ) {

        let tower;
        let towerBinSize = 6;
        let towers = [];

        //

        for ( let i = 0, il = data.length / towerBinSize; i < il; i ++ ) {

            tower = {
                id:         data[ i * towerBinSize + 0 ],
                team:       data[ i * towerBinSize + 1 ],
                position:   {
                    x:  data[ i * towerBinSize + 2 ],
                    y:  0,
                    z:  data[ i * towerBinSize + 3 ]
                },
                rotation:   data[ i * towerBinSize + 4 ] / 1000,
                health:     data[ i * towerBinSize + 5 ]
            };

            towers.push( tower );

        }

        Arena.newTowers( towers );

    };

    private newTanks ( data ) {

        let players = [];
        let player;
        let playerBinSize = 25;

        for ( let i = 0, il = data.length / playerBinSize; i < il; i ++ ) {

            player = {
                id:             data[ i * playerBinSize + 11 ],
                login:          '',
                team:           data[ i * playerBinSize + 1 ],
                tank:           {
                    id:             data[ i * playerBinSize + 0 ],
                    position:   {
                        x:  data[ i * playerBinSize + 2 ],
                        y:  0,
                        z:  data[ i * playerBinSize + 3 ]
                    },
                    rotation:       data[ i * playerBinSize + 4 ] / 1000,
                    rotationTop:    data[ i * playerBinSize + 5 ] / 1000,
                    health:         data[ i * playerBinSize + 6 ],
                    moveDirection:  {
                        x:  data[ i * playerBinSize + 7 ],
                        y:  data[ i * playerBinSize + 8 ]
                    },
                    typeId: data[ i * playerBinSize + 9 ],
                    ammo:   data[ i * playerBinSize + 10 ]
                }
            };

            for ( var j = 0; j < 13; j ++ ) {

                if ( data[ i * playerBinSize + 12 + j ] !== 0 ) {
                
                    player.login += String.fromCharCode( data[ i * playerBinSize + 12 + j ] );

                }

            }

            players.push( player );

        }

        Arena.newPlayers( players );

    };

    private newBoxes ( data ) {

        let boxes = [];
        let box;
        let boxBinSize = 4;

        //

        for ( let i = 0, il = data.length / boxBinSize; i < il; i ++ ) {

            box = {
                id:         data[ i * boxBinSize + 0 ],
                type:       data[ i * boxBinSize + 1 ],
                position:   {
                    x:  data[ i * boxBinSize + 2 ],
                    y:  20,
                    z:  data[ i * boxBinSize + 3 ]
                }
            };

            boxes.push( box );

        }

        Arena.newBoxes( boxes );

    };

    private boxRemove ( data ) {

        let boxId = data[0];
        let box = BoxManager.getBoxById( boxId );

        if ( box ) {

            box.pick();

        }

    };

    private playerLeft ( data ) {

        // todo

    };

    private updateLeaderboard ( data ) {

        Arena.updateLeaderBoard( data.players, data.teams );

    };

    private joinArena ( data ) {

        Arena.init( data );
        UI.Landing.hideLoader();
        UI.InGame.showViewport();

        setTimeout( () => {

            ControlsManager.init();

        }, 100 );

    };

    private newChatMessage ( data ) {

        // todo
        console.log( data );

    };

    //

    public init () {

        Network.addMessageListener( 'ArenaJoinResponse', this.joinArena.bind( this ) );

        Network.addMessageListener( 'ArenaBulletHit', this.newExplosion.bind( this ) );
        Network.addMessageListener( 'ArenaBoxRemove', this.boxRemove.bind( this ) );

        Network.addMessageListener( 'ArenaTanksInRange', this.newTanks.bind( this ) );
        Network.addMessageListener( 'ArenaTowersInRange', this.newTowers.bind( this ) );
        Network.addMessageListener( 'ArenaBoxesInRange', this.newBoxes.bind( this ) );

        Network.addMessageListener( 'ArenaPlayerLeft', this.playerLeft.bind( this ) );
        Network.addMessageListener( 'ArenaLeaderboardUpdate', this.updateLeaderboard.bind( this ) );

        Network.addMessageListener( 'ArenaPlayerDied', this.playerDied.bind( this ) );

        Network.addMessageListener( 'ArenaChatMessage', this.newChatMessage.bind( this ) );

    };

};

//

export { ArenaNetwork };
