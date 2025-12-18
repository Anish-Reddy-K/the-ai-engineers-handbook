(function() {
    'use strict';

    const SIDEBAR_STORAGE_KEY = 'arkr-sidebar-state';
    const MOBILE_BREAKPOINT = 768;
    const OVERLAP_BREAKPOINT = 1480; // Exact calculation: (280px sidebar + 1200px container) = 1480px viewport

    let sidebarOpen = true;
    let isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    let isOverlap = window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < OVERLAP_BREAKPOINT;

    const body = document.body;
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menu-toggle');

    function updateSidebarState() {
        // Update menu toggle active state
        if (menuToggle) {
            if (sidebarOpen) {
                menuToggle.classList.add('active');
            } else {
                menuToggle.classList.remove('active');
            }
        }
        
        if (isMobile || isOverlap) {
            // Mobile or Overlap: show/hide sidebar as overlay
            if (sidebarOpen) {
                body.classList.add('sidebar-open');
            } else {
                body.classList.remove('sidebar-open');
            }
            // Remove desktop hidden class
            body.classList.remove('sidebar-hidden');
        } else {
            // Desktop (above overlap): toggle visibility without overlay
            if (sidebarOpen) {
                body.classList.remove('sidebar-hidden');
            } else {
                body.classList.add('sidebar-hidden');
            }
            // Remove overlay class
            body.classList.remove('sidebar-open');
        }
    }

    function toggleSidebar() {
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
                // Only restore if saved within last 24 hours
                const dayInMs = 24 * 60 * 60 * 1000;
                if (Date.now() - state.timestamp < dayInMs) {
                    sidebarOpen = state.open;
                    return true; // Return true if we loaded a saved state
                }
            }
        } catch (e) {
            console.warn('Could not load sidebar state from localStorage:', e);
        }
        return false; // No saved state found
    }

    function handleResize() {
        const wasMobile = isMobile;
        const wasOverlap = isOverlap;
        const width = window.innerWidth;
        
        isMobile = width < MOBILE_BREAKPOINT;
        isOverlap = width >= MOBILE_BREAKPOINT && width < OVERLAP_BREAKPOINT;
        
        // If switching between breakpoints, adjust sidebar state
        if (wasMobile !== isMobile || wasOverlap !== isOverlap) {
            if (isMobile) {
                sidebarOpen = false; // Start closed on mobile
            } else if (isOverlap) {
                sidebarOpen = false; // Auto-hide at overlap breakpoint
            } else {
                sidebarOpen = true; // Start open on desktop (above overlap)
            }
            updateSidebarState();
        }
    }

    function init() {
        // Determine initial breakpoint state
        const width = window.innerWidth;
        isMobile = width < MOBILE_BREAKPOINT;
        isOverlap = width >= MOBILE_BREAKPOINT && width < OVERLAP_BREAKPOINT;
        
        // Load saved sidebar state (only if user has explicitly set it)
        const savedState = loadSidebarState();
        
        // Default behavior: open on desktop, closed on mobile/overlap
        if (!savedState) {
            // No saved preference - use defaults
            if (isMobile || isOverlap) {
                sidebarOpen = false;
            } else {
                sidebarOpen = true; // Desktop: open by default
            }
        } else {
            // User has a saved preference, but respect breakpoint rules
            if (isOverlap && sidebarOpen) {
                sidebarOpen = false; // Auto-hide at overlap breakpoint
            }
        }
        
        // Set initial state
        updateSidebarState();
        
        // Event listeners
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleSidebar);
        }
        
        // Close sidebar on escape key (mobile and overlap)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebarOpen && (isMobile || isOverlap)) {
                closeSidebar();
            }
        });
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 150);
        });
        
        // Initial resize check
        handleResize();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

