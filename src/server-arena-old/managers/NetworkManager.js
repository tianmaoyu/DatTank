/*
 * @author ohmed
 * DatTank Networking
*/

NetworkManager.prototype.init = function () {

    // register events

    this.registerEvent( 'ArenaJoinRequest', 'in', 'json', 0 );
    this.registerEvent( 'ArenaJoinResponse', 'out', 'json', 1 );
    this.registerEvent( 'ArenaPlayerJoined', 'out', 'json', 2 );
    this.registerEvent( 'ArenaPlayerLeft', 'out', 'json', 6 );
    this.registerEvent( 'ArenaLeaderboardUpdate', 'out', 'json', 7 );
    this.registerEvent( 'ArenaPlayersInRange', 'out', 'bin', 50 );
    this.registerEvent( 'ArenaTowersInRange', 'out', 'bin', 60 );
    this.registerEvent( 'ArenaBoxesInRange', 'out', 'bin', 70 );

    //

    this.registerEvent( 'PlayerRespawn', 'out', 'json', 3 );
    this.registerEvent( 'PlayerRespawn', 'in', 'json', 4 );

    this.registerEvent( 'PlayerNewLevel', 'out', 'bin', 90 );
    this.registerEvent( 'PlayerTankUpdateStats', 'in', 'bin', 91 );

    //

    this.registerEvent( 'TankFriendlyFire', 'out', 'bin', 80 );

    this.registerEvent( 'TankRotateTop', 'out', 'bin', 100 );
    this.registerEvent( 'TankRotateTop', 'in', 'bin', 101 );

    this.registerEvent( 'TankMove', 'out', 'bin', 111 );
    this.registerEvent( 'TankMove', 'in', 'bin', 112 );

    this.registerEvent( 'TankStartShooting', 'in', 'bin', 115 );
    this.registerEvent( 'TankStopShooting', 'in', 'bin', 116 );
    this.registerEvent( 'TankMakeShot', 'out', 'bin', 117 );

    this.registerEvent( 'TankSetHealth', 'out', 'bin', 118 );
    this.registerEvent( 'TankSetAmmo', 'out', 'bin', 119 );

    //

    this.registerEvent( 'TowerRotateTop', 'out', 'bin', 200 );
    this.registerEvent( 'TowerMakeShot', 'out', 'bin', 201 );
    this.registerEvent( 'TowerChangeTeam', 'out', 'bin', 202 );
    this.registerEvent( 'TowerSetHealth', 'out', 'bin', 203 );

    //

    this.registerEvent( 'ArenaBulletHit', 'out', 'bin', 300 );
    this.registerEvent( 'ArenaBoxRemove', 'out', 'bin', 301 );

    //

    this.registerEvent( 'PING', 'in', 'bin', 1000 );
    this.registerEvent( 'PONG', 'out', 'bin', 1001 );

    //

    this.addMessageListener( 'PING', this.gotPing.bind( this ) );

};

NetworkManager.prototype.registerEvent = function ( eventName, ioType, dataType, eventId ) {

    if ( ! this.events[ ioType ] ) {

        console.error( 'Wrong event IO type.' );
        return;

    }

    if ( ioType === 'out' ) {

        this.events.out[ eventName ] = {
            id:         eventId,
            name:       eventName,
            dataType:   dataType
        };

    } else {

        this.events.in[ eventId ] = {
            id:         eventId,
            name:       eventName,
            dataType:   dataType
        };

    }

};

NetworkManager.prototype.addMessageListener = function ( eventName, callback ) {

    this.messageListeners[ eventName ] = this.messageListeners[ eventName ] || [];
    this.messageListeners[ eventName ].push( callback );

};

NetworkManager.prototype.triggerMessageListener = function ( eventId, data, socket ) {

    if ( ! this.events.in[ eventId ] ) {

        console.warn( '[NETWORK] Event with ID:' + eventId + ' not found.' );
        return;

    }

    //

    var eventName = this.events.in[ eventId ].name;
    var eventType = this.events.in[ eventId ].dataType;
    var listeners = this.messageListeners[ eventName ] || [];

    if ( eventType === 'json' ) {

        data = TextEncoder.decode( data );
        data = JSON.parse( data );

    }

    for ( var i = 0, il = listeners.length; i < il; i ++ ) {

        if ( listeners[ i ] ) {

            listeners[ i ]( data, socket, eventName );

        }

    }

};

NetworkManager.prototype.onConnect = function ( socket ) {

    socket.on( 'message', this.onMessage.bind( this, socket ) );
    socket.on( 'error', this.onError.bind( this, socket ) );
    socket.on( 'close', this.onDisconnect.bind( this, socket ) );

};

NetworkManager.prototype.onDisconnect = function ( socket ) {

    if ( socket.arena && socket.player ) {

        socket.player.socket = 'disconnected';

        setTimeout( function () {

            socket.arena.removePlayer( socket.player );

        }, 4000 );

    }

};

NetworkManager.prototype.onMessage = function ( socket, data ) {

    var arrayBuffer = data.buffer.slice( data.byteOffset, data.byteOffset + data.byteLength );
    var eventId = new Int16Array( arrayBuffer, 0, 1 )[ 0 ];
    var content = new Int16Array( arrayBuffer, 2 );

    this.triggerMessageListener( eventId, content, socket );

};

NetworkManager.prototype.onError = function ( socket, error ) {

    console.log( error );

};

NetworkManager.prototype.send = function ( eventName, socket, data, view ) {

    if ( ! socket || socket.readyState !== 1 ) return;

    if ( ! this.events.out[ eventName ] ) {

        console.error( '[NETWORK:SEND_MESSAGE] No event "' + eventName + '" registered.' );
        return false;

    }

    if ( ! data ) {

        data = JSON.stringify( view );
        data = TextEncoder.encode( data );

        var newData = new Int16Array( data.length + 1 );

        for ( var i = 0, il = data.length; i < il; i ++ ) {

            newData[ i + 1 ] = data[ i ];

        }

        data = newData;
        data[0] = this.events.out[ eventName ].id;

    } else {

        view[0] = this.events.out[ eventName ].id;

    }

    socket.send( data, { binary: true } );

};

NetworkManager.prototype.gotPing = function ( data, socket ) {

    var buffer = new ArrayBuffer( 4 );
    var bufferView = new Uint16Array( buffer );
    bufferView[1] = data[0];
    this.send( 'PONG', socket, buffer, bufferView );

};
