/*
 * @author ohmed
 * Tank Cannon part
*/

import * as OMath from '../../OMath/Core.OMath';
import { TankObject } from '../core/Tank.Object';
import { LaserBeamShotObject } from '../core/LaserBeamShot.Object';
import { BulletShotObject } from '../core/BulletShot.Object';

//

export class CannonTankPart {

    public static shotNumId: number = 1;

    public tank: TankObject;
    public nid: number;
    public title: string;

    public shootType: string;
    public rpm: number;
    public damage: number;
    public overheat: number;
    public range: number;

    public temperature: number;

    private shootTimeout: any;
    private shootingInterval: any;

    private lastShots: Array< LaserBeamShotObject | BulletShotObject >;
    private shotSpeed: number;

    private tempLimit: number = 2300;

    private sourceParam: any;
    private activeShotId: number | null;

    private shotDuration: number = 0;

    //

    constructor ( tank: TankObject, params: any, level: number ) {

        this.tank = tank;
        this.nid = params.nid;
        this.title = params.title;

        this.shootType = params.shootType;
        this.rpm = params.levels[ level ].rpm;
        this.damage = params.levels[ level ].damage;
        this.overheat = params.levels[ level ].overheat;
        this.range = params.levels[ level ].range;
        this.shotSpeed = params.shotSpeed;

        this.sourceParam = params;

        this.temperature = 0;
        this.lastShots = [];

    };

    //

    public update ( delta: number, time: number ) : void {

        if ( this.shootType !== 'bullet' && ( this.shootingInterval || this.activeShotId ) ) {

            this.temperature += Math.pow( this.temperature + 1, 0.1 ) * this.overheat * delta / 16;
            this.temperature = Math.min( this.temperature, this.tempLimit );

        } else if ( this.temperature > 0 ) {

            this.temperature -= 5 * delta / 16;
            this.temperature = Math.max( this.temperature, 0 );

        }

        if ( this.temperature > 0.998 * this.tempLimit && ( this.shootingInterval || this.activeShotId ) ) {

            this.stopShooting();

        }

        if ( this.tank.ammo <= 0 ) {

            this.stopShooting();

        }

        //

        this.shotDuration += delta;

        if ( this.activeShotId && this.shotDuration > 300 ) {

            this.tank.changeAmmo( - 1 );
            this.shotDuration = 0;

        }

    };

    public getShotId () : number {

        CannonTankPart.shotNumId = ( CannonTankPart.shotNumId > 1000 ) ? 1 : CannonTankPart.shotNumId + 1;
        return CannonTankPart.shotNumId;

    };

    public startShooting () : void {

        if ( this.temperature > 0.9 * this.tempLimit ) return;
        if ( this.shootingInterval || this.activeShotId ) return;
        clearInterval( this.shootingInterval );

        //

        if ( this.shootType === 'bullet' ) {

            this.shootingInterval = setInterval( () => {

                this.makeShot();

            }, 100 );

            this.makeShot();

        } else if ( this.shootType === 'laser' ) {

            if ( this.temperature >= 0.8 * this.tempLimit ) return;
            if ( this.tank.ammo <= 0 ) return;

            this.lastShots = [];
            const shotId = this.getShotId();

            for ( let i = 0, il = this.sourceParam.shootInfo.length; i < il; i ++ ) {

                const laserBeam = this.tank.arena.laserBeamShotManager.getInactiveLaserBeam();
                laserBeam.id = shotId;
                laserBeam.activate( this.sourceParam.shootInfo[ i ].offset, this.sourceParam.shootInfo[ i ].y, this.sourceParam.shootInfo[ i ].dAngle, this.range, this.shotSpeed, this.tank );
                this.lastShots.push( laserBeam );

            }

            this.activeShotId = shotId;
            this.tank.network.startShooting( shotId );

        }

    };

    public stopShooting () : void {

        if ( ! this.shootingInterval && ! this.activeShotId ) return;
        clearInterval( this.shootingInterval );
        this.shootingInterval = false;
        this.shotDuration = 0;

        if ( this.shootType !== 'bullet' && this.activeShotId ) {

            for ( let i = 0, il = this.lastShots.length; i < il; i ++ ) {

                this.lastShots[ i ].deactivate();

            }

            this.lastShots = [];
            this.tank.network.stopShooting( this.activeShotId );
            this.activeShotId = null;

        }

    };

    public makeShot () : void {

        if ( this.tank.health <= 0 ) return;
        if ( this.shootTimeout ) return;
        if ( this.tank.ammo <= 0 ) return;

        //

        this.shootTimeout = setTimeout( () => {

            this.shootTimeout = false;

        }, 1000 * 60 / this.rpm );

        // overheating

        if ( this.temperature >= 0.8 * this.tempLimit ) return;
        this.temperature *= 1.2;
        this.temperature += this.overheat;
        this.temperature = Math.min( this.temperature, 2300 );

        //

        const shotId = this.getShotId();
        this.lastShots = [];

        for ( let i = 0, il = this.sourceParam.shootInfo.length; i < il; i ++ ) {

            if ( this.tank.ammo <= 0 ) continue;

            const bullet = this.tank.arena.bulletShotManager.getInactiveBullet();
            bullet.id = shotId;

            // compute proper position of bullet

            const position = new OMath.Vec3( this.tank.position.x, this.tank.position.y + this.sourceParam.shootInfo[ i ].y, this.tank.position.z );
            const offset = this.sourceParam.shootInfo[ i ].offset;
            position.x += offset * Math.cos( Math.PI / 2 - this.tank.rotation + this.sourceParam.shootInfo[ i ].dAngle );
            position.z += offset * Math.sin( Math.PI / 2 - this.tank.rotation + this.sourceParam.shootInfo[ i ].dAngle );

            bullet.activate( position, this.tank.rotation, this.range, this.shotSpeed, this.tank );
            this.tank.ammo --;
            this.lastShots.push( bullet );

        }

        //

        this.tank.network.makeShoot( shotId );

    };

};
