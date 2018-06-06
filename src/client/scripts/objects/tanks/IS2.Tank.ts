/*
 * @author ohmed
 * DatTank Tank IS2
*/

import { TankObject } from "./../../objects/core/Tank.Object";

//

class IS2Tank extends TankObject {

    static title: string = 'IS2';
    static year: number = 1950;
    static speed: number = 37;
    static ammoCapacity: number = 36;
    static bullet: number = 122;
    static rpm: number = 4.88 * 10;
    static armour: number = 90;

    static tid = 0;

    //

    constructor ( params ) {

        super( params );

        //

        this.title = IS2Tank.title;
        this.year = IS2Tank.year;
        this.speed = IS2Tank.speed;
        this.ammoCapacity = IS2Tank.ammoCapacity;
        this.bullet = IS2Tank.bullet;
        this.rpm = IS2Tank.rpm;
        this.armour = IS2Tank.armour;

    };

};

//

export { IS2Tank };
