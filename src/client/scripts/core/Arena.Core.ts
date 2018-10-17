/*
 * @author ohmed
 * DatTank Arena core
*/

import { TeamManager } from "./../managers/Team.Manager";
import { PlayerManager } from "./../managers/Player.Manager";
import { TowerManager } from "./../managers/Tower.Manager";
import { BoxManager } from "./../managers/Box.Manager";
import { DecorationManager } from "./../managers/Decoration.Manager";
import { ExplosionManager } from "./../managers/Explosion.Manager";

import * as OMath from "./../OMath/Core.OMath";
import { GfxCore } from "./../graphics/Core.Gfx";
import { PlayerCore } from "./Player.Core";
import { ArenaNetwork } from "../network/Arena.Network";
import { BulletManager } from "./../managers/Bullet.Manager";
import { CollisionManager } from "./../managers/Collision.Manager";
import { UI } from "./../ui/Core.UI";
import { TeamCore } from "./Team.Core";

//

class ArenaCore {

    private static instance: ArenaCore;

    public me: PlayerCore;
    public meId: number;

    private prevUpdateTime: number;
    private updateInterval: number;
    private updateIntervalDuration: number = 40;
    private viewRange: number = 780;

    private network: ArenaNetwork = new ArenaNetwork();

    //

    public preInit ( ip: string, id: string ) {

        this.network.init();

    };

    public init ( params: any ) {

        this.meId = params.me.id;

        // setup teams

        TeamManager.init( params.teams );

        // setup GfxCore

        GfxCore.clear();
        GfxCore.init();

        // setup all other managers

        PlayerManager.init();
        TowerManager.init();
        BoxManager.init();
        DecorationManager.init( params.decorations );

        //

        this.prevUpdateTime = Date.now();
        this.updateInterval = <any>setInterval( this.update.bind( this ), this.updateIntervalDuration );

    };

    public updateLeaderBoard ( players: PlayerCore[], teams: TeamCore[] ) {

        UI.InGame.updateLeaderboard( players );
        UI.InGame.updateTeamScore( teams );

    };

    public playerKilled ( player: any, killer: any ) {

        let playerTeam = TeamManager.getById( player.teamId );
        let killerTeam = TeamManager.getById( killer.teamId );

        if ( ! killer || ! killerTeam || ! playerTeam ) {

            return;

        }

        if ( killer.type === 'player' ) {

            UI.InGame.showKills( killer.id, killer.login, player.login, OMath.intToHex( killerTeam.color ), OMath.intToHex( playerTeam.color ) );

        } else if ( killer.type === 'tower' ) {

            UI.InGame.showKills( killer.id, 'Tower', player.login, OMath.intToHex( killerTeam.color ), OMath.intToHex( playerTeam.color ) );

        }

        //

        if ( player.id === Arena.me.id ) {

            setTimeout( () => {

                if ( ! killerTeam ) {

                    return;

                }

                if ( killer.type === 'tower' ) {

                    UI.InGame.showContinueBox( '<br>' + killerTeam.name + ' team tower', OMath.intToHex( killerTeam.color ) );

                } else if ( killer.type === 'player' ) {

                    UI.InGame.showContinueBox( killer.login, OMath.intToHex( killerTeam.color ) );

                } else {

                    UI.InGame.showContinueBox( '<br>stray bullet', '#555' );

                }

            }, 1400 );

        }

    };

    public removePlayer ( player: PlayerCore ) {

        PlayerManager.remove( [ player.id ] );

    };

    public newExplosion ( position: OMath.Vec3, bulletId: number, explosionType: number ) {

        ExplosionManager.showExplosion( position, explosionType );
        BulletManager.hideBullet( bulletId );

    };

    public newTowers ( towers: Array<any> ) {

        for ( let i = 0, il = towers.length; i < il; i ++ ) {

            TowerManager.remove( [ towers[ i ].id ] );
            TowerManager.add( towers[ i ] );

        }

    };

    public newPlayers ( players: Array<any> ) {

        for ( let i = 0, il = players.length; i < il; i ++ ) {

            if ( Arena.me && players[ i ].id === Arena.me.id ) continue;
            PlayerManager.remove( [ players[ i ].id ] );
            PlayerManager.add( new PlayerCore( players[ i ] ) );

        }

    };

    public newBoxes ( boxes: Array<any> ) {

        for ( let i = 0, il = boxes.length; i < il; i ++ ) {

            BoxManager.remove( [ boxes[ i ].id ] );
            BoxManager.add( boxes[ i ] );

        }

    };

    public dispose () {

        clearInterval( this.updateInterval );

    };

    private removeOutOfRangeObjects () {

        // remove out of range players

        let playersToRemove = [];
        let players = PlayerManager.get();

        for ( let i = 0, il = players.length; i < il; i ++ ) {

            let player = players[ i ];

            if ( ! player || player.id === this.me.id ) continue;
            if ( ! player.tank || ! this.me.tank ) continue;

            if ( player.tank.position.distanceTo( this.me.tank.position ) > this.viewRange ) {

                playersToRemove.push( player.id );

            }

        }

        PlayerManager.remove( playersToRemove );

        // remove out of range towers

        let towersToRemove = [];
        let towers = TowerManager.get();

        for ( let i = 0, il = towers.length; i < il; i ++ ) {

            let tower = towers[ i ];
            if ( ! tower || ! this.me.tank ) continue;

            if ( tower.position.distanceTo( this.me.tank.position ) > this.viewRange ) {

                towersToRemove.push( tower.id );

            }

        }

        TowerManager.remove( towersToRemove );

        // remove out of range boxes

        let boxesToRemove = [];
        let boxes = BoxManager.get();

        for ( var i = 0, il = boxes.length; i < il; i ++ ) {

            var box = boxes[ i ];
            if ( ! box || ! this.me.tank ) continue;

            if ( box.position.distanceTo( this.me.tank.position ) > this.viewRange ) {

                boxesToRemove.push( box.id );

            }

        }

        BoxManager.remove( boxesToRemove );

    };

    private update ( time: number, delta: number ) {

        var time = Date.now();
        var delta = time - this.prevUpdateTime;
        this.prevUpdateTime = time;

        //

        CollisionManager.update( time, delta );
        this.removeOutOfRangeObjects();

    };

    //

    constructor () {

        if ( ArenaCore.instance ) {

            return ArenaCore.instance;

        }

        ArenaCore.instance = this;

    };

};

//

export let Arena = new ArenaCore();
