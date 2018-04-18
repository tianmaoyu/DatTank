/*
 * @author ohmed
 * DatTank Tank general class
*/

import * as THREE from 'three';
import * as OMath from "./../../OMath/Core.OMath";

import { Arena } from "./../Arena.Core";
import { UI } from "./../../ui/Core.UI";
import { PlayerCore } from "./../Player.Core";

import { TankNetwork } from "./../../network/Tank.Network";
import { TankGfx } from "./../../graphics/objects/Tank.Gfx";

//

class TankCore {

    public id: number;
    public player: PlayerCore;

    public title: string;
    public year: number;
    public speed: number;
    public ammoCapacity: number;
    public bullet: number;
    public rpm: number;
    public armour: number;

    public health: number;
    public ammo: number;

    public topRotation: number = 0;
    public moveDirection = { x: 0, y: 0, z: 0 };
    public positionCorrection = { x: 0, y: 0, z: 0 };
    public rotationCorrection: number = 0;

    public position: OMath.Vec3 = new OMath.Vec3();
    public rotation: number = 0;

    protected network: TankNetwork = new TankNetwork();
    protected gfx: TankGfx = new TankGfx();

    //

    public get2DPosition () {

        return this.gfx.get2DPosition();

    };

    public startShooting () {

        // todo

    };

    public stopShooting () {

        // todo

    };

    public makeShot ( id: number ) {

        if ( this.health <= 0 ) return;

        if ( this.player.id === Arena.me.id ) {

            this.setAmmo( this.ammo - 1 );
            UI.InGame.updateAmmo( 60 * 1000 / this.rpm );

        }

    };

    public move ( directionX: number, directionZ: number ) {

        this.network.move( directionX, directionZ );

    };

    public rotateTop ( angle: number ) {

        angle -= this.rotation;
        this.network.rotateTop( angle );

    };

    //

    public setMovement ( directionX: number, directionZ: number, positionX: number, positionZ: number, rotation: number ) {

        this.moveDirection.x = directionX;
        this.moveDirection.y = directionZ;

        this.positionCorrection.x = positionX - this.position.x;
        this.positionCorrection.y = 0;
        this.positionCorrection.z = positionZ - this.position.z;

        this.rotationCorrection = rotation / 1000.0 - this.rotation;

    };

    public setTopRotation ( angle: number ) {

        this.topRotation = angle;
        this.gfx.setTopRotation( angle );

    };

    public setAmmo ( value: number ) {

        if ( this.health <= 0 ) return;

        this.ammo = value;
        UI.InGame.updateAmmo( this.ammo );

    };

    public setHealth ( value: number, trigger: any ) {

        if ( this.health <= 0 ) return;

        // this.tank.addHealthChangeLabel( health - this.health );

        if ( Arena.me.id === this.id ) {

            if ( value < this.health ) {

                // view.addCameraShake( 300, 3 );

            }

            UI.InGame.updateHealth( value );

        }

        this.health = value;
        this.gfx.label.update( this.health, this.armour, this.player.team.color, this.player.username );

        // if ( this.health === 0 ) {

        //     this.die( killerId );

        // } else if ( this.health <= 50 ) {

        //     this.showSmoke();

        // } else {

        //     this.hideSmoke();

        // }

    };

    private updateMovement ( time: number, delta: number ) {

        let speed = 0.09 * this.speed / 40;

        if ( this.moveDirection.x !== 0 || this.moveDirection.y !== 0 ) {

            this.gfx.toggleMovementSound( true );

            if ( this.moveDirection.x > 0 ) {

                this.position.x += ( speed * Math.sin( this.rotation ) * delta );
                this.position.z += ( speed * Math.cos( this.rotation ) * delta );

            } else if ( this.moveDirection.x < 0 ) {

                this.position.x -= ( speed * Math.sin( this.rotation ) * delta );
                this.position.z -= ( speed * Math.cos( this.rotation ) * delta );

            }

            this.rotation = this.rotation;

            if ( this.moveDirection.y > 0 ) {

                this.rotation += 0.001 * delta;

            } else if ( this.moveDirection.y < 0 ) {

                this.rotation -= 0.001 * delta;

            }

            this.gfx.setRotation( this.rotation );

        } else {

            this.gfx.toggleMovementSound( false );

        }

        this.gfx.setPosition( this.position );

    };

    public friendlyFire () {

        // todo

    };

    public update ( time: number, delta: number ) {

        if ( this.health <= 0 ) return;

        //

        let dx = this.positionCorrection.x * delta / 300;
        let dz = this.positionCorrection.z * delta / 300;
        let dr = this.rotationCorrection * delta / 100;

        if ( Math.abs( dr ) > 0.001 ) {

            this.rotationCorrection -= dr;
            this.rotation += dr;
            this.gfx.setRotation( this.rotation );

        }

        if ( Math.abs( dx ) > 0.1 || Math.abs( dz ) > 0.1 ) {

            this.positionCorrection.x -= dx;
            this.positionCorrection.z -= dz;

            this.position.x += dx;
            this.position.z += dz;

        }

        //

        this.updateMovement( time, delta );
        this.gfx.update( time, delta );

    };

    public dispose () {

        // todo

    };

    public init () {

        this.gfx.init( this );
        this.network.init( this );

    };

    //

    constructor ( params ) {

        this.position.set( params.position.x, params.position.y, params.position.z );
        this.gfx.setPosition( this.position );

        this.health = params.health;

        this.rotation = params.rotation;
        this.rotationCorrection = 0;
        this.topRotation = params.rotationTop;

    };

};

// get all tanks and put into 'TanksList' object

import { IS2Tank } from "./../../objects/tanks/IS2.Tank";
import { T29Tank } from "./../../objects/tanks/T29.Tank";
import { T44Tank } from "./../../objects/tanks/T44.Tank";
import { T54Tank } from "./../../objects/tanks/T54.Tank";
import { GfxCore } from '../../graphics/Core.Gfx';

let TankList = {
    IS2:    IS2Tank,
    T29:    T29Tank,
    T44:    T44Tank,
    T54:    T54Tank,
    getById: function ( tankId ) {

        for ( let item in TankList ) {

            if ( typeof item === "string" ) {

                if ( TankList[ item ].tid === tankId ) {

                    return item;

                }

            }

        }

        return null;

    }
};

//

export { TankCore };
export { TankList };
