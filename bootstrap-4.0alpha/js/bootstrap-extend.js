// init bootstrap exention lib
var bootstrapExtend = bootstrapExtend || {};

/**
* Retrives device information for current user
* bootstrapExtend.device.currentBreakpoint() - returns user device by browser size (desktop/tablet/mobile)
* bootstrapExtend.device.breakpointStyleMap() - returns an object of CSS breakpoints mimicing what would be called in the CSS
*/
bootstrapExtend.device = (function () {
  // bootstrapExtend device range
  var mediaQueries = {
    mobile: 599,
    tablet: {min: 600, max: 1019},
    desktop: 1020
  };

  // settings to get passed into options
  var settings = {
    mediaQueries,
    breakpointStyleMap: {
			mobile: 'screen and (max-width: '+ mediaQueries.mobile +'px)',
			tablet: 'screen and (min-width: '+ mediaQueries.tablet.min +'x) and (max-width: '+ mediaQueries.tablet.max +'px)',
			desktop: 'screen and (min-width: '+ mediaQueries.desktop +'px)'
		}
	};

  //Returns a string of the current device based on browser width
  getBreakpoint = function() {
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    browserW  = w.innerWidth || e.clientWidth || g.clientWidth,
    browserH  = w.innerHeight|| e.clientHeight|| g.clientHeight,
    device    = null;

    // get the device range
    switch(true) {
        case (browserW < mediaQueries.tablet.min):
          device = 'mobile'
          break;
        case (browserW <= mediaQueries.tablet.max && browserW >= mediaQueries.tablet.min):
          device = 'tablet'
          break;
        default:
          device = 'desktop'
    }
    return device;
  };

  // Sets a list of public functions
  devicePublic = {};

  // static breakpoint
  devicePublic.currentBreakpoint = function() {
    return getBreakpoint();
  };

  // breakpoint CSS mapping
  devicePublic.breakpointStyleMap = function(size){
    return typeof size !== 'undefined' ? settings.breakpointStyleMap[size] : settings.breakpointStyleMap ;
  };

  // return public method
  return devicePublic;

}());


//--------------------------------------------//
/**
* Create a listener to scroll between a trigger and element
* When used, allows the window or a scrollable element to initiate an animated scroll
* Useage:
    $('a.smoothScroll').each( function () {
        new bootstrapExtend.smoothscroll({
            trigger : $(this), // required
            target : $(this).attr('href'),
            wrapper : $('.scrollable'),
            history: false,
            animateSpeed : 1250,
            bindOn : 'click',
            offset : 0,
            callback : function() {
                console.log('callback works');
            }
        });
    });
*/
bootstrapExtend.smoothscroll = function(settings) {

    // Get options settings
    var thatSmoothScroll = this;
    var _settings = this.settings = settings;

    // reform target from element
    _settings.target = $( _setTargetFromHref() );

    // make sure wrapper has the proper css to enable scrolling
    function _formatWrapper() {
        if ( _settings.wrapper && _settings.wrapper.children().length && _settings.wrapper.children().first().hasClass( 'smoothScrollContainer' ) ) {
            _settings.wrapper.find('.smoothScrollContainer').attr('style','position:relative; overflow:hidden;');
        }
    }

    // function called at end of animation
    function _scrollComplete() {
        if ( !_settings.wrapper ) {
            var currentHash = window.location.hash;
            var targetHash = '';

            if ( _settings.target && typeof _settings.target.attr( 'id' ) === 'string' && _settings.target.attr( 'id' ).length ) {
                targetHash = '#' + _settings.target.attr( 'id' );
            }

            // update hash at end of animation
            if ( _settings.history != false && targetHash.length > 0 && targetHash != currentHash ) {
                // if HTML5 history pushState is not supported then window.location.hash is used to modify the history
                if ( typeof history.pushState === 'undefined' ) {
                    window.location.hash = targetHash;
                }
                else {
                    history.pushState( {}, '', targetHash );
                }
            }
        }

        // if a callback was supplied, fire it now
        if ( typeof _settings.callback === 'function' ) {
            _settings.callback.call( thatSmoothScroll );
        }
    }

    // calculate the current y coordinates of window or wrapper
    function _calcCurrentPos() {
        return _settings.wrapper ? Math.ceil( _settings.wrapper.scrollTop() ) : Math.ceil( $( window ).scrollTop() );
    }

    // calculate the y coordinates to scroll to
    function _calcTargetPos() {

        // document height/widths
        var contentHeight = _settings.wrapper ? _settings.wrapper.children('.smoothScrollContainer').outerHeight() : $( document ).outerHeight();
        var wrapperHeight = _settings.wrapper ? _settings.wrapper.outerHeight() : $( window ).outerHeight();
        var targetPos = _settings.wrapper ? _settings.target.position().top : _settings.target.offset().top;

        if ( targetPos > (contentHeight - wrapperHeight) ) {
            targetPos = contentHeight - wrapperHeight;
        }

        // set scroll length
        targetPos = targetPos < 0 ? 0 : Math.ceil( targetPos );

        // offset
        targetPos = typeof _settings.offset === 'number' ? targetPos + _settings.offset : targetPos;

        // return scroll position
        return targetPos;
    }

    // attempts to set target from the trigger href
    function _setTargetFromHref() {
        if ( !_settings.target ) {
            if ( _settings.trigger && _settings.trigger.is( 'a, button' ) && _settings.trigger.attr( 'href' ).length ) {
                var triggerHref = _settings.trigger.attr( 'href' );
                return triggerHref;
            }
        } else {
            return _settings.target;
        }
    }

    // bind event to trigger which invokes a scroll
    function _bindTriggerEvent(){
        if ( _settings.trigger ) {
            _settings.bindOn = ( _settings.bindOn === 'hover' ? 'mouseover' : _settings.bindOn );
            var triggerEvent = ( typeof _settings.bindOn === 'string' && _settings.bindOn.length ) ? _settings.bindOn : 'click';

            _settings.trigger.on( triggerEvent, function ( e ) {
                e.preventDefault();
                thatSmoothScroll.scrollNow();
            });
        }
    }

    // set animation arguments
    this.scrollNow = function() {
        var callbackCount = 0;
        var wrapperEl = _settings.wrapper ? _settings.wrapper : $( 'html, body' );
        var animateArgs = {
            duration : typeof _settings.animateSpeed == 'number' ? _settings.animateSpeed : 800,
            easing : 'swing',
            complete : function () {
                // make sure callback is only called once if there is more than one wrapper
                callbackCount++;
                if ( callbackCount === wrapperEl.length ) {
                    _scrollComplete();
                }
            }
        }

        // do scroll animation
        wrapperEl.stop().animate({
            scrollTop : _calcTargetPos()
        }, animateArgs);
    }

    // function to set the trigger
    this.setTrigger = function ( newTrigger ) {
        _formatWrapper();
        _bindTriggerEvent();
        return _settings.trigger;
    };

    // finalize setup
    thatSmoothScroll.setTrigger( _settings.target );

}; // END smoothscroll

// Usefull Functions
//--------------------------------------------//
defaultSmoothScroll = function(selector) {
    
    $(selector).each( function () {

        new bootstrapExtend.smoothscroll({
            trigger : $(this),
            history: false,
            animateSpeed : 1250,
            bindOn : 'click',
            offset : -75,
            callback : function() {
                //console.log('finished smoothscroll');
            }
        });
    });
}

navigationFixedCheck = function(wrapper, target, cssrule) {
    // add up total height of wrapper elements regardless of position style
    var outerHeight = 0;
    $(wrapper).children().each(function() {
      outerHeight += $(this).outerHeight();
    });
    
    // set targets css rule
    $(target).css(cssrule, outerHeight);
}

navigationFixedCheck_multiuse = function() {
    return navigationFixedCheck(
        'header',
        'header',
        'min-height'
    );
}

// Window Resize Events
//--------------------------------------------//
var old_var = '';
$(window).on('load resize',function() {

    // get device setting
    var bootstrapDevice = bootstrapExtend.device.currentBreakpoint();

    // only do stuff if bootstrapExtend has changed value
    if ( bootstrapDevice != old_var ) {
        // update h1 BG color
        switch(bootstrapDevice) {
            case ('mobile'):
                // mobile stuff
                break;
            case ('tablet'):
                // tablet stuff
                break;
            default:
                // desktop stuff
                break;
        };

        // add breakpoint to body class
        //------------------------- //
        $('body').attr('data-device', bootstrapExtend.device.currentBreakpoint() );
        
    }
    // set previous value to test with
    old_var = bootstrapDevice;

});

// jQuery
//--------------------------------------------//
// Document Ready
$(document).ready(function() {
    
    // create smoothscroll default links
    defaultSmoothScroll('.smoothscroll');
    
    // if navigation is fixed; move body content down
    navigationFixedCheck_multiuse();
    
}); // END document ready