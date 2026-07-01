(function(){
    try {
        var uaMobile = /Mobi|Android|Tablet|iPad|iPhone/i.test(navigator.userAgent || '');
        var touchPoints = (navigator.maxTouchPoints || 0);
        var isTouch = touchPoints > 0;
        window.__isMobileOrTablet = uaMobile || (isTouch && window.innerWidth <= 1024);
    } catch (e) {
        window.__isMobileOrTablet = false;
    }
    if (window.__isMobileOrTablet) {
        var mob = document.getElementById('mobileBlock');
        if (mob) mob.style.display = 'flex';
        var gc = document.querySelector('.game-container');
        if (gc) gc.style.filter = 'blur(1px)';
    }
})();
