/*
 * @author ohmed
 * DatTank UI file
*/

Game.UI = function () {

    // nothing here

};

Game.UI.prototype = {};

//

Game.UI.prototype.init = function () {

    if ( localStorage.getItem('hq') === 'true' ) {

        this.changeQuality( true, true );

    }

    if ( localStorage.getItem('sound') === 'true' ) {

        this.changeSound( true, true );

    }

    $('#settings-wrapper').hide();

    localStorage.setItem( 'gear', false );

    // ui binding

    $('#gear_btn').click( this.openSettings.bind( this ) );
    $('#exit-btn').click( this.openSettings.bind( this ) );
    $('#soundon').click( this.changeSound.bind( this ) );
    $('#qualityon').click( this.changeQuality.bind( this ) );

    //

    setTimeout( function () { $('.fb-like').animate( { opacity: 1 }, 500 ); }, 1000 );
    setTimeout( function () { $('.folow-btn').animate( { opacity: 1 }, 500 ); }, 1200 );

};

Game.UI.prototype.changeQuality = function ( value, withoutSound ) {

    value = ( typeof value === 'boolean' ) ? value : $( value.currentTarget ).attr('hq') !== 'true';
    $('#graphics-quality').attr( 'hq', value );
    $('#viewport-graphics-quality').attr( 'hq', value );
    localStorage.setItem( 'hq', value );

    view.updateRenderer();

    if ( ! withoutSound ) {

        soundManager.playMenuSound();

    }

};

Game.UI.prototype.changeSound = function ( value, withoutSound ) {

    value = ( typeof value === 'boolean' ) ? value : $( value.currentTarget ).attr('sound') !== 'true';
    $('#sound-on-off').attr( 'sound', value );
    $('#viewport-sound-on-off').attr( 'sound', value );
    localStorage.setItem( 'sound', value );
    soundManager.toggleMute( ! value );

    if ( ! withoutSound ) {

        soundManager.playMenuSound();

    }

};

Game.UI.prototype.changeFullScreen = function ( value, withoutSound ) {

    value = ( typeof value === 'boolean' ) ? value : $( value.currentTarget ).attr('screen') !== 'true';
    $('#fullscreen-on-off').attr( 'screen', value );
    $('#viewport-fullscreen-on-off').attr( 'screen', value );

    view.updateRenderer();

    if ( ! withoutSound ) {

        soundManager.playMenuSound();

    }

};

Game.UI.prototype.hideSignInPopup = function () {

    $('#signin-box-wrapper').hide();
    $('#graphics-quality').hide();
    $('#sound-on-off').hide();
    $('#share-btn').hide();
    $('.top-left-like-btns').hide();
    $('.new-features-box').hide();

};

Game.UI.prototype.openSettings = function (value) {

    value = ( typeof value === 'boolean' ) ? value : $('#gear_btn').attr('gear') !== 'true';
    $('#gear_btn').attr( 'gear', value );
    localStorage.setItem( 'gear', value );
    soundManager.playMenuSound();

    if ( localStorage.getItem( 'gear' ) === 'true' ) {

        $('#settings-wrapper').show();

    }

    if ( localStorage.getItem( 'gear' ) === 'false' ) {

        $('#settings-wrapper').hide();

    }

};

Game.UI.prototype.hideFooter = function () {

    $('#footer').hide();

};

Game.UI.prototype.showViewport = function () {

    $('#viewport').show();

};

Game.UI.prototype.setCursor = function () {

    $('#viewport').addClass('properCursor');

};

Game.UI.prototype.showDisconectMessage = function () {

    $('.disconnect-warning').show();

};

Game.UI.prototype.updateHealth = function ( value ) {

    $('#health-number').html( value );
    $('#empty-health-image').css( 'height', ( 100 - value ) + '%' );

};

Game.UI.prototype.updateAmmo = function ( value ) {

    $('#ammo-number').html( value );

};

Game.UI.prototype.showContinueBox = function ( playerlogin, playerColor ) {

    $('#continue-box-wrapper #continue-btn').off();
    this.hideTankStatsUpdate();

    $('#continue-box-wrapper #continue-btn').click( function () {

        Game.arena.me.respawn( false );

    });

    $('#continue-box-wrapper').show();
    $('#continue-box-wrapper #continue-box-wrapper-title').html('<p>Killed by <span style="color:'+ playerColor + '">' + playerlogin +'</span></p>');
    $('#continue-box-wrapper #change-tank').click( ui.showChoiceWindow.bind( ui ) );

    setTimeout( function () {

        $('#continue-box-wrapper').css( 'opacity', 1 );

    }, 100 );

};

Game.UI.prototype.showKills = function ( killer, killed ) {

    var killerName = ( killer instanceof Game.Tower ) ? 'Tower' : killer.login;

    $('#kill-events').append( '<p><span style="color:' + killer.team.color + '">' + killerName +'</span> killed <span style="color:' + killed.team.color + '">' + killed.login + '</span>!</p>');

    if ( $('#kill-events').children().length > 5 ) {

        $('#kill-events p').first().remove();

    }

};

Game.UI.prototype.hideContinueBox = function () {

    $('#continue-box-wrapper').css( 'opacity', 0 );

    setTimeout( function () {

        $('#continue-box-wrapper').hide();

    }, 200);

};

Game.UI.prototype.updateTeamScore = function ( teams ) {

    var list = $( '#team-params .team-number' );

    for ( var i = 0, il = list.length; i < il; i ++ ) {

        $( list[ i ] ).html( teams[ i ].score + '%' );

    }

};

Game.UI.prototype.updateLeaderboard = function ( players ) {

    var me = game.arena.me;
    var names = $('#top-killers .player-name');
    var kills = $('#top-killers .kills');
    var teams = $('#top-killers .players-team-image');

    var rows = $('#top-killers .killer-outer');

    rows.removeClass('myplace');

    var meInTop = false;

    for ( var i = 0; i < 5; i ++ ) {

        if ( i < players.length ) {

            $( names[ i ] ).html( players[ i ].login );
            $( kills[ i ] ).html( players[ i ].score + '/' + players[ i ].kills );
            $( teams[ i ] ).css( 'background-color', Game.Team.colors[ players[ i ].team ] );
            $( rows[ i ] ).show();

            if ( me && players[ i ].id === me.id ) {

                $( rows[ i ] ).addClass('myplace');
                meInTop = true;
                me.score = players[ i ].score;
                me.kills = players[ i ].kills;

            }

        } else {

            $( rows[ i ] ).hide();

        }

    }

    //

    if ( ! meInTop ) {

        var rank = 0;

        for ( var i = 0, il = players.length; i < il; i ++ ) {

            if ( me && players[ i ].id === me.id ) {

                rank = i + 1;
                me.score = players[ i ].score;
                me.kills = players[ i ].kills;
                break;

            }

        }

        if ( rank === 0 ) return;

        $('#top-killers .killer-outer.last .player-counter').html( '#' + rank );
        $('#top-killers .killer-outer.last .player-name').html( me.login );
        $('#top-killers .killer-outer.last .kills').html( me.score + '/' + me.kills );
        $('#top-killers .killer-outer.last .players-team-image').css( 'background-color', me.team.color );

        $('#top-killers #divider').show();
        $('#top-killers .killer-outer.last').show();
        setTimeout( function () {
            $('#top-killers .killer-outer.last').addClass('myplace');
        }, 10 );

    } else {

        $('#top-killers #divider').hide();
        $('#top-killers .killer-outer.last').hide();

    }

    this.updateLevelProgress();

};

Game.UI.prototype.updateLevelProgress = function () {

    var levels = [ 0, 5, 15, 250, 380, 500, 650, 900, 1300, 1700, 2500 ];
    var level = 0;

    while ( levels[ level ] <= game.arena.me.score ) {

        level ++;

    }

    level --;

    var levelProgress = 100 * ( game.arena.me.score - levels[ level ] ) / ( levels[ level + 1 ] - levels[ level ] );
    $('.level-indicator-block .title').html( 'Level ' + level );
    $('.level-indicator-block .progress-bar .progress-indicator').css( 'width', levelProgress + '%' );

};

Game.UI.prototype.showTankStatsUpdate = function ( bonusLevels ) {

    var tank = game.arena.me.tank;

    $('.stats-update-block .bonus.speed .bonus-title span').html( tank.speed + ' -> ' + ( tank.speed + 1 ) );
    $('.stats-update-block .bonus.reload .bonus-title span').html( tank.rpm + ' -> ' + ( tank.rpm + 1 ) );
    $('.stats-update-block .bonus.armour .bonus-title span').html( tank.armour + ' -> ' + ( tank.armour + 1 ) );
    $('.stats-update-block .bonus.gun .bonus-title span').html( tank.bullet + ' -> ' + ( tank.bullet + 1 ) );
    $('.stats-update-block .bonus.ammo-capacity .bonus-title span').html( tank.ammoCapacity + ' -> ' + ( tank.ammoCapacity + 1 ) );

    $('.stats-update-block').show();
    $('.level-indicator-block').hide();
    $('.stats-update-block .title').html( 'You have ' + bonusLevels + ' bonus levels.' );

};

Game.UI.prototype.hideTankStatsUpdate = function () {

    $('.stats-update-block').hide();
    $('.level-indicator-block').show();

};

Game.UI.prototype.showLoaderScreen = function () {

    $('#loader-wrapper').show();

    setTimeout( function () {

        $('#loader-wrapper').css( 'opacity', 1 );

    }, 50 );

};

Game.UI.prototype.hideLoaderScreen = function () {

    setTimeout( function () {

        $('#loader-wrapper').hide();

    }, 200 );

    $('#loader-wrapper').css( 'opacity', 0 );

};

Game.UI.prototype.showChoiceWindow = function () {

    $('.tank-skins').show();
    $('#signin-box').css('opacity', 0);

    garage.open();
    soundManager.playMenuSound();

};

Game.UI.prototype.closeChoiceWindow = function ( event ) {

    if ( event ) {

        event.stopPropagation();

    }

    $('#signin-box #username').focus();
    $('#signin-box').css('opacity', 1);
    garage.close();

};

Game.UI.prototype.selectTankAndcloseChoiceWindow = function () {

    $('#signin-box').css('opacity', 1);
    garage.close();

    if ( game.arena ) {

        game.arena.me.respawn( false );

    } else {

        game.play();

    }

};
