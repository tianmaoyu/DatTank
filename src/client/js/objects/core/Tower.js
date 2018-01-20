/*
 * @author ohmed
 * Tower object class
*/

Game.Tower = function ( arena, params ) {

    EventDispatcher.call( this );

    this.arena = arena;

    this.id = params.id;
    this.team = this.arena.teamManager.getById( params.team ) || false;
    this.health = params.health;

    this.bullets = [];
    this.object = new THREE.Object3D();
    this.rotation = params.rotation || 0;
    this.position = new THREE.Vector3( params.position.x, params.position.y, params.position.z );

    this.animations = {};
    this.healthBar = false;

    //

    this.initBullets();
    this.init();

    //

    this.changeTeam( this.team.id, true );

};

Game.Tower.prototype = Object.create( EventDispatcher.prototype );

Game.Tower.prototype.init = function () {

    var towerBaseModel = resourceManager.getModel('Tower_base.json');
    var towerTopModel = resourceManager.getModel('Tower_top.json');

    //

    var base = new THREE.Mesh( towerBaseModel.geometry, towerBaseModel.material );
    base.castShadow = true;
    base.rotation.y = 0;
    base.receiveShadow = true;
    base.scale.set( 27, 27, 27 );
    this.object.add( base );
    this.object.base = base;

    for ( var i = 0, il = base.material.length; i < il; i ++ ) {

        base.material[ i ] = base.material[ i ].clone();

    }

    //

    var materials = [];
    for ( var i = 0, il = towerTopModel.material.length; i < il; i ++ ) {

        materials.push( towerTopModel.material[ i ].clone() );
        materials[ materials.length - 1 ].morphTargets = true;

    }

    var top = new THREE.Mesh( towerTopModel.geometry, materials );
    top.castShadow = true;
    top.receiveShadow = true;
    top.position.y = 0;
    top.scale.set( 27, 27, 27 );

    this.object.add( top );
    this.object.top = top;

    //

    view.scene.add( this.object );

    this.object.position.set( this.position.x, this.position.y, this.position.z );

    //

    this.mixer = new THREE.AnimationMixer( top );

    var shotAction = this.mixer.clipAction( towerTopModel.geometry.animations[0], top );
    shotAction.setDuration( 0.5 ).setLoop( THREE.LoopOnce );
    this.animations.shotAction = shotAction;

    //

    this.updateHealthBar();
    this.rotateTop( this.rotation, this.rotation );

    this.addEventListeners();

};

Game.Tower.prototype.initBullets = function () {

    for ( var i = 0; i < 5; i ++ ) {

        var bullet = new THREE.Mesh( new THREE.SphereGeometry( 3.4, 10, 10 ), new THREE.MeshLambertMaterial({ color: 0x7A3EA8 }) );
        bullet.visible = false;
        bullet.active = false;

        this.bullets.push( bullet );
        view.scene.add( bullet );

        bullet.soundShooting = new THREE.PositionalAudio( view.sound.listener );
        bullet.soundShooting.setBuffer( resourceManager.getSound('tank_shooting.wav') );
        bullet.soundShooting.loop = false;
        bullet.soundShooting.setRefDistance( 30 );
        bullet.soundShooting.autoplay = false;
        bullet.soundShooting.setVolume(0.5);

        this.object.add( bullet.soundShooting );

    }

};

Game.Tower.prototype.updateHealthBar = function () {

    if ( ! this.healthBar ) {

        var bg = new THREE.Sprite( new THREE.SpriteMaterial( { color: 0xffffff, fog: true } ) );
        var healthBar = new THREE.Sprite( new THREE.SpriteMaterial( { color: 0x00ff00, fog: true } ) );
        healthBar.position.set( 0, 50, 0 );
        healthBar.scale.set( 50, 2, 1 );

        this.healthBar = {
            bg:     bg,
            health: healthBar
        };

        this.object.add( this.healthBar.health );

    }

    //

    this.healthBar.health.scale.x = 50 * this.health / 100;

};

Game.Tower.prototype.rotateTop = function ( oldAngle, newAngle ) {

    this.newRotation = newAngle;

    this.rotation = oldAngle;
    this.object.top.rotation.y = oldAngle;

};

Game.Tower.prototype.shoot = function ( shootId ) {

    var bullet = false;
    var hitCallback = false;
    var scope = this;

    for ( var i = 0, il = this.bullets.length; i < il; i ++ ) {

        bullet = this.bullets[ i ];
        if ( bullet.active === false ) break;

    }

    //

    this.animations.shotAction.stop();
    this.animations.shotAction.play();

    //

    bullet.position.set( this.object.position.x, 25, this.object.position.z );

    if ( bullet.soundShooting.buffer ) {

        if ( bullet.soundShooting.isPlaying ) {

            bullet.soundShooting.stop();
            bullet.soundShooting.startTime = 0;
            bullet.soundShooting.isPlaying = false;

        }

        if ( localStorage.getItem('sound') !== 'false' ) {

            bullet.soundShooting.play();

        }

    }

    //

    bullet.active = true;
    bullet['shotId'] = shootId;
    bullet['flytime'] = 5;

    return {

        onHit: function ( callback ) {

            hitCallback = callback;

        }

    };

};

Game.Tower.prototype.animate = function ( delta ) {

    if ( this.mixer ) {

        this.mixer.update( delta / 1000 );

    }

};

Game.Tower.prototype.changeTeam = function ( team, init ) {

    team = this.arena.teamManager.getById( team );
    if ( ! team ) return;

    this.team = team;

    this.object.top.material[1].color.setHex( + team.color.replace('#', '0x') );
    this.object.base.material[1].color.setHex( + team.color.replace('#', '0x') );

    if ( ! init ) this.health = 100;

    this.updateHealthBar();

    //

    team.kills ++;

};

Game.Tower.prototype.updateHealth = function ( health ) {

    this.health = health;
    this.updateHealthBar();

};

Game.Tower.prototype.hideBullet = function ( data ) {

    for ( var i = 0, il = this.bullets.length; i < il; i ++ ) {

        hidebullet = this.bullets[ i ];

        if ( data.bulletId === hidebullet.shotId ) {

            this.bullets[ i ].active = false;
            this.bullets[ i ].visible = false;

        }

    }

};

Game.Tower.prototype.update = function ( delta ) {

    this.animate( delta );

    //

    var deltaRot = Utils.formatAngle( this.newRotation ) - Utils.formatAngle( this.rotation );

    if ( deltaRot > Math.PI ) {

        if ( deltaRot > 0 ) {

            deltaRot = - 2 * Math.PI + deltaRot;

        } else {

            deltaRot = 2 * Math.PI + deltaRot;

        }

    }

    if ( Math.abs( deltaRot ) > 0.01 ) {

        this.rotation = Utils.formatAngle( this.rotation + Math.sign( deltaRot ) / 30 * ( delta / 50 ) );
        this.object.top.rotation.y = this.rotation;

    }

    for ( var bulletId in this.bullets ) {

        var bullet = this.bullets[ bulletId ];

        if ( bullet.active === true ) {

            var angle = - this.object.top.rotation.y - this.object.rotation.y - 1.57;

            bullet.flytime --;

            if ( bullet.flytime > 0 ) {

                for ( var j = 0; j < 4; j ++ ) {

                    var x = bullet.position.x + Math.cos( angle ) * delta;
                    var z = bullet.position.z + Math.sin( angle ) * delta;

                    bullet.position.set( x, bullet.position.y, z );
                    bullet.visible = true;

                }

            } else {

                bullet.visible = false;
                bullet.active = false;

            }

        }

    }

};

Game.Tower.prototype.dispose = function () {

    view.scene.remove( this.object );

};

Game.Tower.prototype.addEventListeners = function () {

    var scope = this;

    this.addEventListener( 'TowerRotateTop', function ( event ) { scope.rotateTop( event.data[1] / 1000, event.data[2] / 1000 ); });
    this.addEventListener( 'TowerShoot', function ( event ) { scope.shoot( event.data[1] ); });
    this.addEventListener( 'TowerChangeTeam', function ( event ) { scope.changeTeam( event.data[1] ); });
    this.addEventListener( 'TowerHit', function ( event ) { scope.updateHealth( event.data[1] ); });

};
