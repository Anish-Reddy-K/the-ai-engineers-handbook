(function() {
    'use strict';

    const SIDEBAR_STORAGE_KEY = 'arkr-sidebar-state';
    const MOBILE_BREAKPOINT = 768;
    const OVERLAP_BREAKPOINT = 1480; // exact calculation: (280px sidebar + 1200px container) = 1480px viewport

    let sidebarOpen = true;
    let isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    let isOverlap = window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < OVERLAP_BREAKPOINT;

    const body = document.body;
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarContent = document.querySelector('.sidebar-content');

    function updateSidebarState() {
        // update menu toggle active state
        if (menuToggle) {
            if (sidebarOpen) {
                menuToggle.classList.add('active');
            } else {
                menuToggle.classList.remove('active');
            }
        }
        
        if (isMobile || isOverlap) {
            // mobile or overlap: show/hide sidebar as overlay
            if (sidebarOpen) {
                body.classList.add('sidebar-open');
            } else {
                body.classList.remove('sidebar-open');
            }
            // remove desktop hidden class
            body.classList.remove('sidebar-hidden');
        } else {
            // desktop (above overlap): toggle visibility without overlay
            if (sidebarOpen) {
                body.classList.remove('sidebar-hidden');
            } else {
                body.classList.add('sidebar-hidden');
            }
            // remove overlay class
            body.classList.remove('sidebar-open');
        }
    }

    function toggleSidebar() {
        // play click sound
        if (window.playClickSound) {
            window.playClickSound();
        }
        
        sidebarOpen = !sidebarOpen;
        updateSidebarState();
        saveSidebarState();
    }

    function closeSidebar() {
        if (sidebarOpen) {
            sidebarOpen = false;
            updateSidebarState();
            saveSidebarState();
        }
    }

    function saveSidebarState() {
        try {
            localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify({
                open: sidebarOpen,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Could not save sidebar state to localStorage:', e);
        }
    }

    function loadSidebarState() {
        try {
            const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
            if (saved) {
                const state = JSON.parse(saved);
                sidebarOpen = state.open;
                return true; // return true if we loaded a saved state
            }
        } catch (e) {
            console.warn('Could not load sidebar state from localStorage:', e);
        }
        return false; // no saved state found
    }

    function handleResize() {
        const wasMobile = isMobile;
        const wasOverlap = isOverlap;
        const width = window.innerWidth;
        
        isMobile = width < MOBILE_BREAKPOINT;
        isOverlap = width >= MOBILE_BREAKPOINT && width < OVERLAP_BREAKPOINT;
        
        // if switching between breakpoints, adjust sidebar state
        if (wasMobile !== isMobile || wasOverlap !== isOverlap) {
            if (isMobile) {
                sidebarOpen = false; // start closed on mobile
            } else if (isOverlap) {
                sidebarOpen = false; // auto-hide at overlap breakpoint
            } else {
                sidebarOpen = true; // start open on desktop (above overlap)
            }
            updateSidebarState();
        }
    }


    function scrollToActiveItem() {
        const activeLink = document.querySelector('.sidebar-article-link.active');
        
        if (activeLink && sidebarContent) {
            // ensure parent chapter is expanded
            const activeChapter = activeLink.closest('.sidebar-chapter');
            if (activeChapter && !activeChapter.classList.contains('sidebar-chapter-expanded')) {
                activeChapter.classList.remove('sidebar-chapter-collapsed');
                activeChapter.classList.add('sidebar-chapter-expanded');
                const button = activeChapter.querySelector('.sidebar-chapter-toggle');
                if (button) button.setAttribute('aria-expanded', 'true');
            }
            
            // use scrollIntoView - simple, elegant, native browser API
            // 'nearest' means only scroll if not already visible
            // 'center' centers it in the viewport
            activeLink.scrollIntoView({
                behavior: 'auto', // instant, no animation
                block: 'center',  // center vertically in viewport
                inline: 'nearest' // don't scroll horizontally
            });
        }
    }

    function init() {
        // determine initial breakpoint state
        const width = window.innerWidth;
        isMobile = width < MOBILE_BREAKPOINT;
        isOverlap = width >= MOBILE_BREAKPOINT && width < OVERLAP_BREAKPOINT;
        
        // load saved sidebar state
        const savedState = loadSidebarState();
        
        // default behavior: open on desktop, closed on mobile/overlap (only if no saved state)
        if (!savedState) {
            if (isMobile || isOverlap) {
                sidebarOpen = false;
            } else {
                sidebarOpen = true; // desktop: open by default
            }
        }
        // if saved state exists, use it (respect user preference)
        
        // set initial state
        updateSidebarState();
        
        // initialize collapsible chapters IMMEDIATELY (synchronously)
        // this must happen before any rendering delays to prevent flash
        initCollapsibleChapters();
        
        // scroll to active item - use immediate execution, then RAF as backup
        scrollToActiveItem();
        requestAnimationFrame(function() {
            scrollToActiveItem();
        });
        
        // event listeners
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleSidebar);
        }
        
        // close sidebar on escape key (mobile and overlap)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebarOpen && (isMobile || isOverlap)) {
                closeSidebar();
            }
        });
        
        // close sidebar when clicking outside (mobile and overlap only)
        document.addEventListener('click', function(e) {
            // only handle click-outside on mobile/tablet when sidebar is open
            if (!sidebarOpen || (!isMobile && !isOverlap)) {
                return;
            }
            
            // don't close if clicking the menu toggle button (it handles its own toggle)
            if (menuToggle && menuToggle.contains(e.target)) {
                return;
            }
            
            // don't close if clicking inside the sidebar
            if (sidebar && sidebar.contains(e.target)) {
                return;
            }
            
            // click was outside sidebar - close it
            closeSidebar();
        });
        
        // handle window resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 150);
        });
        
        // initial resize check
        handleResize();
    }

    function toggleChapter(chapterElement) {
        const isExpanded = chapterElement.classList.contains('sidebar-chapter-expanded');
        const button = chapterElement.querySelector('.sidebar-chapter-toggle');
        
        // simple toggle - instant, no state saving
        if (isExpanded) {
            chapterElement.classList.remove('sidebar-chapter-expanded');
            chapterElement.classList.add('sidebar-chapter-collapsed');
            if (button) button.setAttribute('aria-expanded', 'false');
        } else {
            chapterElement.classList.remove('sidebar-chapter-collapsed');
            chapterElement.classList.add('sidebar-chapter-expanded');
            if (button) button.setAttribute('aria-expanded', 'true');
        }
    }

    function initCollapsibleChapters() {
        const chapters = document.querySelectorAll('.sidebar-chapter');
        
        // process chapters synchronously to prevent flash
        chapters.forEach(function(chapter) {
            const button = chapter.querySelector('.sidebar-chapter-toggle');
            if (!button) return;
            
            // check if this is the active chapter (marked as expanded in HTML)
            const isActiveChapter = chapter.classList.contains('sidebar-chapter-expanded');
            
            // simple logic: active chapter stays expanded, all others collapsed
            if (isActiveChapter) {
                // active chapter - ensure it's expanded
                chapter.classList.remove('sidebar-chapter-collapsed');
                chapter.classList.add('sidebar-chapter-expanded');
                button.setAttribute('aria-expanded', 'true');
            } else {
                // all other chapters - ensure they're collapsed
                chapter.classList.remove('sidebar-chapter-expanded');
                chapter.classList.add('sidebar-chapter-collapsed');
                button.setAttribute('aria-expanded', 'false');
            }
            
            // add click handler (only once)
            if (!button.dataset.handlerAttached) {
                button.dataset.handlerAttached = 'true';
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleChapter(chapter);
                });
            }
        });
    }

    // initialize IMMEDIATELY - don't wait for DOMContentLoaded
    // this prevents flash/jitter by running before paint
    if (document.readyState === 'loading') {
        // if still loading, run immediately when DOM is ready
        document.addEventListener('DOMContentLoaded', init, { once: true });
        // also try immediately in case DOM is ready but event hasn't fired
        if (document.body) {
            init();
        }
    } else {
        init();
    }
})();

