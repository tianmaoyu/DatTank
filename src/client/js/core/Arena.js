/*
 * @author ohmed
 * DatTank Arena object
*/

Game.Arena = function () {

    this.id = false;
    this.me = false;
    this.stopped = false;

    this.viewRange = 650;

    //

    this.effects = {
        explosions:     []
    };

    //

    this.boxManager = new Game.BoxManager( this );
    this.playerManager = new Game.PlayerManager( this );
    this.teamManager = new Game.TeamManager( this );
    this.towerManager = new Game.TowerManager( this );
    this.controlsManager = new Game.ControlsManager( this );
    this.decorationManager = new Game.DecorationManager( this );

};

Game.Arena.prototype = {};

//

Game.Arena.prototype.init = function ( params ) {

    this.id = params.id;

    //

    this.addNetworkListeners();

    //

    this.teamManager.init( params.teams );
    this.playerManager.init();
    this.boxManager.init();
    this.towerManager.init();

    //

    view.clean();
    view.setupScene();
    view.addDecorations( params.decorations );
    view.addTerrain();
    view.addTeamZone();

    this.initExplosions();

    //

    this.me = this.addPlayer( params.me );

    //

    ui.updateAmmo( this.me.ammo );
    ui.updateHealth( this.me.health );

    //

    setInterval( function () {

        localStorage.setItem( 'lastActiveTime', Date.now() );

    }, 1000 );

};

Game.Arena.prototype.initExplosions = function () {

    for ( var i = 0; i < 30; i ++ ) {

        var map = resourceManager.getTexture( 'explosion2.png' ).clone();
        map.needsUpdate = true;
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set( 0.25, 0.25 );
        map.offset.set( 0, 0.75 );

        var material = new THREE.SpriteMaterial({ map: map, color: 0xffffff, opacity: 0.7, fog: true });
        var sprite = new THREE.Sprite( material );

        sprite.scale.set( 80, 80, 80 );
        sprite.visible = false;
        view.scene.add( sprite );
        this.effects.explosions.push( sprite );

    }

};

Game.Arena.prototype.showExplosion = function ( data ) {

    var bulletId = data[0];
    var ownerId = data[1];
    var position = { x: data[2], y: 25, z: data[3] };

    //

    for ( var i = 0; i < this.effects.explosions.length; i ++ ) {

        var explosion = this.effects.explosions[ i ];

        if ( ! explosion.visible ) {

            explosion.position.set( position.x, position.y, position.z );
            explosion.scale.set( 80, 80, 80 );
            explosion.visible = true;

            var shooter = this.playerManager.getById( ownerId );
            if ( shooter ) {

                shooter = shooter.tank;

            } else {

                shooter = this.towerManager.getById( ownerId );

            }

            if ( shooter ) {

                var bulletsPool = shooter.bullets;
                for ( var j = 0, jl = bulletsPool.length; j < jl; j ++ ) {

                    if ( bulletsPool[ j ].bulletId === bulletId ) {

                        bulletsPool[ j ].visible = false;
                        bulletsPool[ j ].trace.visible = false;
                        break;

                    }

                }

            }

            break;

        }

    }

};

Game.Arena.prototype.updateExplosions = function ( delta ) {

    for ( var i = 0; i < this.effects.explosions.length; i ++ ) {

        var explosion = this.effects.explosions[ i ];

        if ( ! explosion.visible ) continue;
        explosion.time = explosion.time || 0;
        explosion.time += delta;

        if ( explosion.time > 50 ) {

            if ( explosion.material.map.offset.y >= 0 ) {

                explosion.material.map.offset.x += 0.25;
                explosion.time = 0;

                if ( explosion.material.map.offset.x === 1 && explosion.material.map.offset.y !== 0 ) {

                    explosion.material.map.offset.x = 0;
                    explosion.material.map.offset.y -= 0.25;

                } else if ( explosion.material.map.offset.y === 0 && explosion.material.map.offset.x === 1 ) {

                    explosion.scale.x = 80;
                    explosion.scale.y = 80;
                    explosion.visible = false;
                    explosion.time = 0;
                    explosion.material.map.offset.set( 0, 1 );

                }

            }

        }

    }

};

Game.Arena.prototype.addPlayer = function ( data ) {

    var player = new Game.Player( this, data );
    this.playerManager.add( player );

    return player;

};

Game.Arena.prototype.newPlayersInRange = function ( players ) {

    var scope = this;

    for ( var i = 0, il = players.length; i < il; i ++ ) {

        scope.playerManager.remove( players[ i ] );

    }

    for ( var i = 0, il = players.length; i < il; i ++ ) {

        scope.addPlayer( players[ i ] );

    }

};

Game.Arena.prototype.newTowersInRange = function ( towers ) {

    for ( var i = 0, il = towers.length; i < il; i ++ ) {

        this.towerManager.remove( towers[ i ] );
        this.towerManager.add( new Game.Tower( this, towers[ i ] ) );

    }

};

Game.Arena.prototype.newBoxesInRange = function ( boxes ) {

    for ( var i = 0, il = boxes.length; i < il; i ++ ) {

        this.boxManager.remove( boxes[ i ] );
        this.boxManager.add( boxes[ i ] );

    }

};

Game.Arena.prototype.playerLeft = function ( player ) {

    if ( this.playerManager.getById( player.id ) ) {

        this.playerManager.remove( this.playerManager.getById( player.id ) );

    }

};

Game.Arena.prototype.update = function ( time, delta ) {

    if ( this.stopped ) return;

    this.updateExplosions( delta );

    //

    for ( var i = 0, il = this.playerManager.players.length; i < il; i ++ ) {

        this.playerManager.players[ i ].update( time, delta );

    }

    // remove out of range players

    var playersToRemove = [];

    for ( var i = 0, il = this.playerManager.players.length; i < il; i ++ ) {

        var player = this.playerManager.players[ i ];

        if ( ! player || player.id === this.me.id ) continue;
        if ( Utils.getDistance( player.position, this.me.position ) > this.viewRange ) {

            playersToRemove.push( player );

        }

    }

    for ( var i = 0, il = playersToRemove.length; i < il; i ++ ) {

        this.playerManager.remove( playersToRemove[ i ] );

    }

    // remove out of range towers

    var towersToRemove = [];

    for ( var i = 0, il = this.towerManager.towers.length; i < il; i ++ ) {

        var tower = this.towerManager.towers[ i ];
        if ( ! tower ) continue;

        if ( Utils.getDistance( tower.position, this.me.position ) > this.viewRange ) {

            towersToRemove.push( tower );

        }

    }

    for ( var i = 0, il = towersToRemove.length; i < il; i ++ ) {

        this.towerManager.remove( towersToRemove[ i ] );

    }

    // remove out of range boxes

    var boxesToRemove = [];

    for ( var i = 0, il = this.boxManager.boxes.length; i < il; i ++ ) {

        var box = this.boxManager.boxes[ i ];
        if ( ! box ) continue;

        if ( Utils.getDistance( box.position, this.me.position ) > this.viewRange ) {

            boxesToRemove.push( box );

        }

    }

    for ( var i = 0, il = boxesToRemove.length; i < il; i ++ ) {

        this.boxManager.remove( boxesToRemove[ i ] );

    }

};

Game.Arena.prototype.updateLeaderboard = function ( data ) {

    ui.updateLeaderboard( data.players );
    ui.updateTeamScore( data.teams );

};

//

Game.Arena.prototype.proxyEventToPlayer = function ( data, eventName ) {

    var playerId = ( data.player ) ? data.player.id : data[0];
    var player = this.playerManager.getById( playerId );
    if ( ! player ) return;

    player.dispatchEvent({ type: eventName, data: data });

};

Game.Arena.prototype.proxyEventToTower = function ( data, eventName ) {

    var tower = this.towerManager.getById( data[0] );
    if ( ! tower ) return;

    tower.dispatchEvent({ type: eventName, data: data });

};

Game.Arena.prototype.proxyEventToBox = function ( data, eventName ) {

    var boxId = ( data.id ) ? data.id : data[0];
    var box = this.boxManager.getBoxById( boxId );
    if ( ! box ) return;

    box.dispatchEvent({ type: eventName, data: data });

};

Game.Arena.prototype.addNetworkListeners = function () {

    network.addMessageListener( 'ArenaPlayerLeft', this.playerLeft.bind( this ) );
    network.addMessageListener( 'ArenaLeaderboardUpdate', this.updateLeaderboard.bind( this ) );
    network.addMessageListener( 'ArenaPlayerRespawn', this.proxyEventToPlayer.bind( this ) );

    network.addMessageListener( 'PlayersInRange', this.newPlayersInRange.bind( this ) );
    network.addMessageListener( 'TowersInRange', this.newTowersInRange.bind( this ) );
    network.addMessageListener( 'BoxesInRange', this.newBoxesInRange.bind( this ) );

    //

    network.addMessageListener( 'PlayerFriendlyFire', this.proxyEventToPlayer.bind( this ) );

    network.addMessageListener( 'PlayerTankRotateTop', this.proxyEventToPlayer.bind( this ) );
    network.addMessageListener( 'PlayerTankMove', this.proxyEventToPlayer.bind( this ) );
    network.addMessageListener( 'PlayerTankShoot', this.proxyEventToPlayer.bind( this ) );
    network.addMessageListener( 'PlayerTankUpdateHealth', this.proxyEventToPlayer.bind( this ) );
    network.addMessageListener( 'PlayerTankUpdateAmmo', this.proxyEventToPlayer.bind( this ) );

    //

    network.addMessageListener( 'TowerRotateTop', this.proxyEventToTower.bind( this ) );
    network.addMessageListener( 'TowerShoot', this.proxyEventToTower.bind( this ) );
    network.addMessageListener( 'TowerChangeTeam', this.proxyEventToTower.bind( this ) );
    network.addMessageListener( 'TowerUpdateHealth', this.proxyEventToTower.bind( this ) );

    //

    network.addMessageListener( 'BulletHit', this.showExplosion.bind( this ) );
    network.addMessageListener( 'BoxRemove', this.proxyEventToBox.bind( this ) );

};
