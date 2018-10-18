/*
 * @author ohmed
 * DatTank Arena bullet manager
*/

import { BulletGfx } from '../graphics/effects/Bullet.Gfx';
import * as OMath from '../OMath/Core.OMath';

//

class BulletManagerCore {

    private static instance: BulletManagerCore;
    private pool: BulletGfx[] = [];
    private poolSize: number = 30;

    //

    private getNewBullet () : BulletGfx | undefined {

        for ( let i = 0, il = this.pool.length; i < il; i ++ ) {

            if ( this.pool[ i ].active === false ) {

                return this.pool[ i ];

            }

        }

        return undefined;

    };

    public update ( time: number, delta: number ) : void {

        for ( let i = 0, il = this.pool.length; i < il; i ++ ) {

            this.pool[ i ].update( time, delta );

        }

    };

    public showBullet ( bulletId: number, position: OMath.Vec3, directionRotation: number ) : void {

        const bullet = this.getNewBullet();

        if ( bullet ) {

            bullet.setActive( bulletId, position, directionRotation );

        }

    };

    public hideBullet ( bulletId: number ) : void {

        for ( let i = 0, il = this.pool.length; i < il; i ++ ) {

            if ( this.pool[ i ].id === bulletId ) {

                this.pool[ i ].deactivate();

            }

        }

    };

    public init () : void {

        for ( let i = 0; i < this.poolSize; i ++ ) {

            const bullet = new BulletGfx();
            bullet.init();
            this.pool.push( bullet );

        }

    };

    //

    constructor () {

        if ( BulletManagerCore.instance ) {

            return BulletManagerCore.instance;

        }

        BulletManagerCore.instance = this;

    };

};

//

export let BulletManager = new BulletManagerCore();
