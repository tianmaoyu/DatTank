/*
 * @author ohmed
 * DatTank Tree decoration
*/

import { DecorationObject } from "./../../../objects/core/Decoration.Object";

//

class Tree5Decoration extends DecorationObject {

    static title: string = 'Tree5';

    //

    constructor ( params ) {

        super( params );
        this.title = Tree5Decoration.title;
        this.uvOffset.set( 2, 2 );

    };

};

//

export { Tree5Decoration };
