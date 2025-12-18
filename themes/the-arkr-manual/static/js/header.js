(function() {
    'use strict';

    let lastScrollTop = 0;
    let isScrollingDown = false;
    const zoneA = document.querySelector('.header-zone-a');
    let ticking = false;

    function updateHeader() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Determine scroll direction
        if (scrollTop > lastScrollTop && scrollTop > 50) {
            // Scrolling down - hide Zone A
            if (!isScrollingDown) {
                isScrollingDown = true;
                if (zoneA) {
                    zoneA.classList.add('hidden');
                }
            }
        } else if (scrollTop < lastScrollTop) {
            // Scrolling up (even 1px) - show Zone A immediately
            if (isScrollingDown) {
                isScrollingDown = false;
                if (zoneA) {
                    zoneA.classList.remove('hidden');
                }
            }
        }
        
        lastScrollTop = scrollTop;
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }

    function init() {
        // Initialize scroll position
        lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scroll listener
        window.addEventListener('scroll', onScroll, { passive: true });
        
        // Initial check
        updateHeader();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

