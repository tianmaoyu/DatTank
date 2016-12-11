/*
 * @author ohmed
 * DatTank Arena object
*/

var Arena = function () {

    this.id = Arena.numIds ++;

    this.players = [];
    this.teams = [];
    this.room = false;

    this.obstacles = [];
    this.bots = [];
    this.towers = [];

    this.boxManager = new DT.BoxManager( this, {} );

    this.updateInterval = false;

    //

    for ( var i = 0; i < 4; i ++ ) {

        this.teams.push( new DT.Team( i ) );

    }

    for ( var i = 0; i < 5; i ++ ) {

        for ( var j = 0; j < 5; j ++ ) {

            var x = ( 0.5 - i / 4 ) * 1900;
            var z = ( 0.5 - j / 4 ) * 1900;

            this.towers.push( new DT.Tower( this, { position: { x: x, y: 0, z: z } } ) );

        }

    }

    //

    this.resetTime = false;
    this.currentTime = false;
    this.resetInterval = false;

};

Arena.prototype = {};

Arena.prototype.reset = function ( isNew ) {

    var scope = this;

    if ( ! isNew ) {

        DT.Network.announce( this, 'resetArena', { winnerTeam: this.getWinnerTeamId(), arena: this.toPublicJSON() } );

    }

    //

    clearTimeout( this.resetTimeout );
    clearInterval( this.updateInterval );

    this.updateInterval = setInterval( this.update.bind( this ), 20 );

    this.resetTimeout = setTimeout( this.reset.bind( this ), 5 * 60 * 1000 );
    this.resetTime = Date.now();
    this.obstacles = [];

    //

    this.boxManager.reset();
    this.addObstacles( 190, 80 );

    //

    for ( var i = 0, il = this.teams.length; i < il; i ++ ) {

        this.teams[ i ].reset();

    }

    for ( var i = 0, il = this.bots.length; i < il; i ++ ) {

        this.bots[ i ].dispose();

    }

    for ( var i = 0, il = this.towers.length; i < il; i ++ ) {

        this.towers[ i ].reset();

    }

    this.players = [];
    this.bots = [];

    //

    setTimeout( function () {

        for ( var i = 0; i < 0 /*3 + Math.floor( Math.random() * 3 )*/; i ++ ) {

            scope.bots.push( new DT.Bot( scope ) );

        }

    }, 1000 );

};

Arena.prototype.addObstacles = function ( treeCount, rockCount ) {

    // tree obstacles

    var x, z;
    var scale, scaleH;
    var baseSize = 100;

    for ( var i = 0; i < treeCount; i ++ ) {

        scale = 20 * Math.random() + 25;
        scaleH = 20 * Math.random() + 25;

        x = 2000 * ( Math.random() - 0.5 );
        z = 2000 * ( Math.random() - 0.5 );

        if ( Math.sqrt( Math.pow( 500 - x, 2 ) + Math.pow( 500 - z, 2 ) ) < baseSize ) continue;
        if ( Math.sqrt( Math.pow( - 500 - x, 2 ) + Math.pow( 500 - z, 2 ) ) < baseSize ) continue;
        if ( Math.sqrt( Math.pow( 500 - x, 2 ) + Math.pow( - 500 - z, 2 ) ) < baseSize ) continue;
        if ( Math.sqrt( Math.pow( - 500 - x, 2 ) + Math.pow( - 500 - z, 2 ) ) < baseSize ) continue;

        this.obstacles.push({
            type:   'tree',
            position: {
                x:  x,
                y:  0,
                z:  z
            },
            scale: {
                x: scale,
                y: scaleH,
                z: scale
            },
            rotation: 2 * Math.PI * Math.random()
        });

    }

    // rock obstacles

    for ( var i = 0; i < rockCount; i ++ ) {

        scale = 30 * Math.random() + 20;
        x = 2000 * ( Math.random() - 0.5 );
        z = 2000 * ( Math.random() - 0.5 );

        if ( Math.sqrt( Math.pow( 500 - x, 2 ) + Math.pow( 500 - z, 2 ) ) < baseSize ) continue;
        if ( Math.sqrt( Math.pow( - 500 - x, 2 ) + Math.pow( 500 - z, 2 ) ) < baseSize ) continue;
        if ( Math.sqrt( Math.pow( 500 - x, 2 ) + Math.pow( - 500 - z, 2 ) ) < baseSize ) continue;
        if ( Math.sqrt( Math.pow( - 500 - x, 2 ) + Math.pow( - 500 - z, 2 ) ) < baseSize ) continue;

        this.obstacles.push({
            type:   'rock',
            position: {
                x:  x,
                y:  0,
                z:  z
            },
            scale: {
                x: scale,
                y: scale,
                z: scale
            },
            rotation: 2 * Math.PI * Math.random()
        });

    }

};

Arena.prototype.getWinnerTeamId = function () {

    var winnerTeam = this.teams[0];

    for ( var i = 1, il = this.teams.length; i < il; i ++ ) {

        if ( winnerTeam.kills < this.teams[ i ].kills ) {

            winnerTeam = this.teams[ i ];

        }

    }

    return winnerTeam.id;

};

Arena.prototype.detectWeakestTeam = function () {

    var weakestTeam = this.teams[0];

    for ( var i = 1, il = this.teams.length; i < il; i ++ ) {

        if ( weakestTeam.players.length > this.teams[ i ].players.length ) {

            weakestTeam = this.teams[ i ];

        }

    }

    return weakestTeam;

};

Arena.prototype.getPlayerById = function ( playerId ) {

    for ( var i = 0, il = this.players.length; i < il; i ++ ) {

        if ( this.players[ i ].id === playerId ) {

            return this.players[ i ];

        }

    }

    return false;

};


Arena.prototype.getTowerById = function ( towerId ) {

    for ( var i = 0, il = this.towers.length; i < il; i ++ ) {

        if ( this.towers[ i ].id === towerId ) {

            return this.towers[ i ];

        }

    }

    return false;

};

Arena.prototype.addPlayer = function ( player ) {

    var team = this.detectWeakestTeam();

    team.addPlayer( player );
    this.players.push( player );

    player.arena = this;
    player.team = team;

    switch ( team.id ) {

        case 0:

            player.position = [ 500, 1, 500 ];
            break;

        case 1:

            player.position = [ -500, 1, 500 ];
            break;

        case 2:

            player.position = [ 500, 1, -500 ];
            break;

        case 3:

            player.position = [ -500, 1, -500 ];
            break;

    }

    //

    if ( ! player.socket ) {

        DT.Network.announce( this, 'playerJoined', player.toPublicJSON() );

    } else {

        DT.Network.broadcast( player.socket, this, 'playerJoined', player.toPublicJSON() );

    }

};

Arena.prototype.removeBot = function ( player ) {

    var newBotList = [];

    for ( var i = 0, il = this.bots.length; i < il; i ++ ) {

        if ( this.bots[ i ].player.id === player.id ) continue;

        newBotList.push( this.bots[ i ] );

    }

    this.bots = newBotList;

};

Arena.prototype.removePlayer = function ( player ) {

    var newPlayersList = [];
    var removed = true;

    for ( var i = 0, il = this.players.length; i < il; i ++ ) {

        if ( this.players[ i ].id === player.id ) {

            removed = true;
            continue;

        }

        newPlayersList.push( this.players[ i ] );

    }

    this.players = newPlayersList;

    //

    if ( removed ) {

        player.team.removePlayer( player );
        DT.Network.announce( this, 'playerLeft', { id: player.id } );

    }

};

Arena.prototype.toPublicJSON = function () {

    var players = [];
    var teams = [];
    var boxes = [];
    var towers = [];

    for ( var i = 0, il = this.players.length; i < il; i ++ ) {

        players.push( this.players[ i ].toPublicJSON() );

    }

    for ( var i = 0, il = this.teams.length; i < il; i ++ ) {

        teams.push( this.teams[ i ].toPublicJSON() );

    }

    for ( var i = 0, il = this.boxManager.boxes.length; i < il; i ++ ) {

        boxes.push( this.boxManager.boxes[ i ].toPublicJSON() );

    }

    for ( var i = 0, il = this.towers.length; i < il; i ++ ) {

        towers.push( this.towers[ i ].toJSON() );

    }

    //

    return {

        id:             this.id,
        obstacles:      this.obstacles,
        towers:         towers,
        players:        players,
        teams:          teams,
        boxes:          boxes,
        resetTime:      this.resetTime,
        currentTime:    Date.now()

    };

};

Arena.prototype.update = (function () {

    var prevUpdateTime = false;

    return function () {

        var time = Date.now();
        var delta = ( prevUpdateTime !== false ) ? time - prevUpdateTime : 0;
        prevUpdateTime = time;

        // update towers

        for ( var i = 0, il = this.towers.length; i < il; i ++ ) {

            this.towers[ i ].update();

        }

        // update players position & rotation

        for ( var i = 0, il = this.players.length; i < il; i ++ ) {

            var player = this.players[ i ];

            if ( ! player.movePath.length ) continue;

            var progress = player.movementDurationMap.length - 1;

            for ( var j = 0, jl = player.movementDurationMap.length; j < jl; j ++ ) {

                if ( time - player.movementStart > player.movementDurationMap[ j ] ) {

                    progress --;

                } else {

                    break;

                }

            }

            if ( progress < 0 ) {

                player.movePath.length = 0;
                player.movementDurationMap.length = 0;
                continue;

            } else {

                if ( progress !== player.moveProgress ) {

                    var dx, dz;

                    if ( player.movePath[ 2 * ( progress - 30 ) ] ) {

                        dx = ( player.movePath[ 2 * ( progress - 30 ) + 0 ] + player.movePath[ 2 * ( progress - 29 ) + 0 ] + player.movePath[ 2 * ( progress - 28 ) + 0 ] ) / 3 - 2000 - player.position[0];
                        dz = ( player.movePath[ 2 * ( progress - 30 ) + 1 ] + player.movePath[ 2 * ( progress - 29 ) + 1 ] + player.movePath[ 2 * ( progress - 28 ) + 1 ] ) / 3 - 2000 - player.position[2];

                    } else {

                        dx = ( player.movePath[ 2 * progress + 0 ] - 2000 ) - player.position[0];
                        dz = ( player.movePath[ 2 * progress + 1 ] - 2000 ) - player.position[2];

                    }

                    player.position[0] = player.movePath[ 2 * progress + 0 ] - 2000;
                    player.position[2] = player.movePath[ 2 * progress + 1 ] - 2000;

                    //

                    if ( progress !== 0 ) {

                        var newRotation = ( dz === 0 && dx !== 0 ) ? ( Math.PI / 2 ) * Math.abs( dx ) / dx : Math.atan2( dx, dz );
                        newRotation = utils.formatAngle( newRotation );
                        var dRotation = newRotation - player.rotation;

                        if ( isNaN( dRotation ) ) dRotation = 0;

                        if ( dRotation > Math.PI ) {

                            dRotation -= 2 * Math.PI;

                        }

                        if ( dRotation < - Math.PI ) {

                            dRotation += 2 * Math.PI;

                        }

                        player.rotation = utils.formatAngle( player.rotation + dRotation );

                    }

                    //

                    player.moveProgress = progress;

                }

            }

        }

        this.boxManager.update( delta, this.players );

    };

}) ();

Arena.numIds = 0;

//

module.exports = Arena;
