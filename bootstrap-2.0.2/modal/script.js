    // Allows scrolling on elements transform in Safari
    function fixSafariScrolling(event) {
        event.target.style.overflowY = 'hidden';
        setTimeout(function () { event.target.style.overflowY = 'auto'; });
    }

    // Add scrolling fix for every .modal element
    for (var i = 0 ; i < jQuery('.modal').length; i++) {
       jQuery('.modal')[i].addEventListener('webkitAnimationEnd', fixSafariScrolling);
    }

    var scrollPos = 0;
    jQuery('.modal')
        .on('show.bs.modal', function (){
            scrollPos = jQuery('body').scrollTop();
            jQuery('body').css({
                overflow: 'hidden',
                position: 'fixed',
                top : -scrollPos
            });
        })
        .on('hide.bs.modal', function (){
            jQuery('body').css({
                overflow: '',
                position: '',
                top: ''
            }).scrollTop(scrollPos);
        });
