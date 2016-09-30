/*
 * @author ohmed
 * DatTank setting file
*/

'use strict';

var DT = {};

DT.Version = '2dev';
DT.Build = 3;
DT.local = false;

if ( DT.local ) {

    DT.socketHost = 'http://localhost:8086';

} else {

    DT.socketHost = 'http://188.166.164.236:8085';

}
