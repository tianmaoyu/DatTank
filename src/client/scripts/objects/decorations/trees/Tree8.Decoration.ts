/*
 * @author ohmed
 * DatTank Tree decoration
*/

import { DecorationObject } from "./../../../objects/core/Decoration.Object";

//

class Tree8Decoration extends DecorationObject {

    static title: string = 'Tree8';

    //

    constructor ( params ) {

        super( params );
        this.title = Tree8Decoration.title;
        this.uvOffset.set( 3, 2 );

    };

};

//

export { Tree8Decoration };
