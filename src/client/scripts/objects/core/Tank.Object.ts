/*
 * @author ohmed
 * DatTank Tank Object class
*/

import * as OMath from '../../OMath/Core.OMath';

import { Logger } from '../../utils/Logger';
import { Arena } from '../../core/Arena.Core';
import { UI } from '../../ui/Core.UI';
import { PlayerCore } from '../../core/Player.Core';

import { TankNetwork } from '../../network/Tank.Network';
import { TankGfx } from '../../graphics/objects/Tank.Gfx';
import { HealthChangeLabelManager } from '../../managers/HealthChangeLabel.Manager';
import { BulletManager } from '../../managers/Bullet.Manager';
import { CollisionManager } from '../../managers/Collision.Manager';
import { GfxCore } from '../../graphics/Core.Gfx';

//

export class TankObject {

    public id: number;
    public player: PlayerCore;

    public title: string;
    public year: number;
    public speed: number;
    public ammoCapacity: number;
    public bullet: number;
    public rpm: number;
    public armour: number;

    public overheating: number = -1;
    public health: number;
    public ammo: number;

    public moveDirection = new OMath.Vec2();
    public positionCorrection = new OMath.Vec3();
    public positionCorrectionDelta = new OMath.Vec3();
    public rotationCorrection: number = 0;
    public acceleration: number = 0;

    public position: OMath.Vec3 = new OMath.Vec3();
    public rotation: number = 0;
    public size: OMath.Vec3 = new OMath.Vec3( 30, 25, 70 );

    public posChange: OMath.Vec3 = new OMath.Vec3();
    public rotChange: number = 0;
    public deltaT: number = 0;

    public prevForwardVelocity: number = 0;

    protected network: TankNetwork = new TankNetwork();
    public gfx: TankGfx = new TankGfx();

    public collisionBox: any;
    public readonly type: string = 'Tank';

    //

    public startShooting () : void {

        this.network.startShooting();

    };

    public stopShooting () : void {

        this.network.stopShooting();

    };

    public makeShot ( bulletId: number, position: OMath.Vec3, directionRotation: number, overheating: number ) : void {

        if ( this.health <= 0 ) return;

        if ( Arena.meId === this.player.id ) {

            this.overheating = overheating;
            this.gfx.label.update( this.health, this.armour, this.player.team.color, this.overheating, this.player.username );

        }

        BulletManager.showBullet( bulletId, position, directionRotation );
        this.gfx.shoot();

        if ( this.player.id === Arena.me.id ) {

            Logger.newEvent( 'Shot', 'game' );
            this.setAmmo( this.ammo - 1 );
            UI.InGame.setAmmoReloadAnimation( 60 * 1000 / this.rpm );

        }

    };

    public move ( directionX: number, directionZ: number ) : void {

        this.network.move( directionX, directionZ );

    };

    public die () : void {

        this.gfx.destroy();

        if ( this.player.id === Arena.me.id ) {

            Logger.newEvent( 'Kill', 'game' );
            GfxCore.addCameraShake( 1000, 1.5 );
            UI.InGame.hideTankStatsUpdate();

        }

    };

    //

    public setMovement ( directionX: number, directionZ: number, positionX: number, positionZ: number, rotation: number ) : void {

        this.moveDirection.x = directionX;
        this.moveDirection.y = directionZ;

        this.positionCorrection.x = positionX - this.position.x;
        this.positionCorrection.y = 0;
        this.positionCorrection.z = positionZ - this.position.z;

        this.rotationCorrection = rotation / 1000.0 - this.rotation;

    };

    public setAmmo ( value: number ) : void {

        if ( this.health <= 0 ) return;

        this.ammo = value;

        if ( this.player.id === Arena.me.id ) {

            UI.InGame.updateAmmo( this.ammo );

        }

    };

    public setHealth ( value: number ) : void {

        if ( this.health <= 0 ) return;

        if ( Arena.me.id === this.player.id ) {

            if ( value < this.health ) {

                GfxCore.addCameraShake( 300, 3 );

            }

            UI.InGame.updateHealth( value );

        }

        if ( this.health - value !== 0 ) {

            HealthChangeLabelManager.showHealthChangeLabel( new OMath.Vec3( this.position.x + 5 * ( Math.random() - 0.5 ), this.position.y, this.position.z + 5 * ( Math.random() - 0.5 ) ), value - this.health );

        }

        this.health = value;
        this.gfx.label.update( this.health, this.armour, this.player.team.color, this.overheating, this.player.username );

        if ( this.health <= 0 ) {

            this.die();

        } else if ( this.health <= 50 ) {

            this.gfx.damageSmoke.show();

        } else {

            this.gfx.damageSmoke.hide();

        }

    };

    public updateMovement ( delta: number, newPosition: OMath.Vec3 ) : void {

        const dx = this.positionCorrection.x * delta / 300;
        const dz = this.positionCorrection.z * delta / 300;
        const dr = this.rotationCorrection * delta / 100;

        if ( Math.abs( dr ) > 0.001 ) {

            this.rotationCorrection -= dr;
            this.rotation += dr;

        }

        if ( Math.abs( dx ) > 0.1 || Math.abs( dz ) > 0.1 ) {

            this.positionCorrectionDelta.set( dx, 0, dz );

        }

        if ( this.moveDirection.x !== 0 || this.moveDirection.y !== 0 ) {

            this.gfx.toggleMovementSound( true );

            if ( this.moveDirection.y > 0 ) {

                this.rotation += 0.001 * delta;

            } else if ( this.moveDirection.y < 0 ) {

                this.rotation -= 0.001 * delta;

            }

        } else {

            this.gfx.toggleMovementSound( false );

        }

        if ( this.rotation > 2 * Math.PI ) {

            this.rotation -= 2 * Math.PI;

        } else if ( this.rotation < -2 * Math.PI ) {

            this.rotation += 2 * Math.PI;

        }

        this.gfx.rotateTankXAxis( this.acceleration );

        this.rotChange = ( this.rotation - this.gfx.object.rotation.y ) / CollisionManager.updateRate;
        this.posChange.set( newPosition.x - this.gfx.object.position.x, newPosition.y - this.gfx.object.position.y, newPosition.z - this.gfx.object.position.z );
        this.posChange.x /= CollisionManager.updateRate;
        this.posChange.y /= CollisionManager.updateRate;
        this.posChange.z /= CollisionManager.updateRate;
        this.deltaT = CollisionManager.updateRate;

        this.position.copy( newPosition );

    };

    public friendlyFire () : void {

        this.gfx.friendlyFireLabel.show();

    };

    public update ( time: number, delta: number ) : void {

        this.gfx.update( time, delta );

        if ( this.health <= 0 ) return;

        if ( this.overheating > 0 ) {

            this.overheating -= 0.2 * delta / 16;
            this.gfx.label.update( this.health, this.armour, this.player.team.color, this.overheating, this.player.username );

        }

    };

    public dispose () : void {

        this.gfx.dispose();
        this.network.dispose();
        CollisionManager.removeObject( this );

    };

    public init () : void {

        if ( Arena.meId === this.player.id ) {

            this.overheating = 0;

        }

        this.gfx.init( this );
        this.network.init( this );

        if ( this.health <= 50 ) {

            this.gfx.damageSmoke.show();

        }

        if ( this.health <= 0 ) {

            this.gfx.makeTankDestroyed();

        }

        CollisionManager.addObject( this, 'box', true );

    };

    //

    constructor ( params: any ) {

        this.id = params.id;

        this.position.set( params.position.x, params.position.y, params.position.z );
        this.gfx.setPosition( this.position );

        this.health = params.health;
        this.ammo = params.ammo;

        this.rotation = params.rotation % ( 2 * Math.PI );
        this.rotationCorrection = 0;

        this.moveDirection.set( params.moveDirection.x, params.moveDirection.y );

    };

};
