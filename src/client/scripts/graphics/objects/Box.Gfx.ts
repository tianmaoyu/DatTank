/*
 * @author ohmed
 * DatTank Box graphics class
*/

import * as THREE from 'three';

import { GfxCore } from '../Core.Gfx';
import { BoxObject } from '../../objects/core/Box.Object';
import { ResourceManager } from '../../managers/Resource.Manager';

//

export class BoxGfx {

    private animTime: number = 600 * Math.random() * Math.PI * 2;
    private mesh: THREE.Mesh;

    //

    public dispose () : void {

        GfxCore.coreObjects['boxes'].remove( this.mesh );

    };

    public pick () : void {

        const sound = new THREE.PositionalAudio( GfxCore.audioListener );
        sound.position.copy( this.mesh.position );
        sound.setBuffer( ResourceManager.getSound('box_pick.wav') as THREE.AudioBuffer );
        sound.setRefDistance( 200 );
        sound.play();

    };

    public update ( time: number, delta: number ) : void {

        this.animTime += delta;
        this.mesh.rotation.y = Math.sin( this.animTime / 600 );
        this.mesh.position.y = Math.sin( this.animTime / 300 ) + 20;
        this.mesh.updateMatrixWorld( true );

    };

    public init ( box: BoxObject ) : void {

        const boxModel = ResourceManager.getModel( 'boxes/' + box.type )!;

        this.mesh = new THREE.Mesh( boxModel.geometry, boxModel.material );
        this.mesh.material[0].map = ResourceManager.getTexture('Boxes.jpg');
        this.mesh.name = box.type;
        this.mesh.scale.set( 20, 20, 20 );

        this.mesh.position.x = box.position.x;
        this.mesh.position.y = box.position.y;
        this.mesh.position.z = box.position.z;
        this.mesh.updateMatrixWorld( true );

        //

        if ( ! GfxCore.coreObjects['boxes'] ) {

            GfxCore.coreObjects['boxes'] = new THREE.Object3D();
            GfxCore.coreObjects['boxes'].name = 'Boxes';
            GfxCore.scene.add( GfxCore.coreObjects['boxes'] );

        }

        GfxCore.coreObjects['boxes'].add( this.mesh );

    };

};
