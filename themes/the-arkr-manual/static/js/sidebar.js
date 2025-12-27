(function() {
    'use strict';

    const SIDEBAR_STORAGE_KEY = 'arkr-sidebar-state';
    const SIDEBAR_SCROLL_KEY = 'arkr-sidebar-scroll';
    const CHAPTER_STATE_KEY = 'arkr-chapter-states';
    const MOBILE_BREAKPOINT = 768;
    const OVERLAP_BREAKPOINT = 1480; // Exact calculation: (280px sidebar + 1200px container) = 1480px viewport

    let sidebarOpen = true;
    let isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    let isOverlap = window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < OVERLAP_BREAKPOINT;

    const body = document.body;
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarContent = document.querySelector('.sidebar-content');

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
                sidebarOpen = state.open;
                return true; // Return true if we loaded a saved state
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

    function saveScrollPosition() {
        if (sidebarContent) {
            try {
                localStorage.setItem(SIDEBAR_SCROLL_KEY, sidebarContent.scrollTop.toString());
            } catch (e) {
                // Ignore localStorage errors
            }
        }
    }

    function restoreScrollPosition() {
        if (sidebarContent) {
            try {
                const savedScroll = localStorage.getItem(SIDEBAR_SCROLL_KEY);
                if (savedScroll !== null) {
                    const scrollTop = parseInt(savedScroll, 10);
                    // Restore scroll position instantly (no animation)
                    sidebarContent.scrollTop = scrollTop;
                    return scrollTop;
                }
            } catch (e) {
                // Ignore localStorage errors
            }
        }
        return null;
    }

    function isElementVisible(element, container) {
        if (!element || !container) return false;
        
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Check if element is within the visible area of the container
        return (
            elementRect.top >= containerRect.top &&
            elementRect.bottom <= containerRect.bottom
        );
    }

    function scrollToActiveItemIfNeeded() {
        const activeLink = document.querySelector('.sidebar-article-link.active');
        
        if (activeLink && sidebarContent) {
            // Check if active item is already visible
            if (isElementVisible(activeLink, sidebarContent)) {
                // Already visible, no need to scroll
                return;
            }
            
            // Calculate scroll position to center the active item
            const linkTop = activeLink.offsetTop;
            const linkHeight = activeLink.offsetHeight;
            const sidebarHeight = sidebarContent.clientHeight;
            
            // Center the active item in the viewport
            const scrollPosition = linkTop - (sidebarHeight / 2) + (linkHeight / 2);
            
            // Scroll instantly (no animation) to avoid visible scrolling
            sidebarContent.scrollTop = Math.max(0, scrollPosition);
            
            // Save the new scroll position
            saveScrollPosition();
        }
    }

    function init() {
        // Determine initial breakpoint state
        const width = window.innerWidth;
        isMobile = width < MOBILE_BREAKPOINT;
        isOverlap = width >= MOBILE_BREAKPOINT && width < OVERLAP_BREAKPOINT;
        
        // Load saved sidebar state
        const savedState = loadSidebarState();
        
        // Default behavior: open on desktop, closed on mobile/overlap (only if no saved state)
        if (!savedState) {
            if (isMobile || isOverlap) {
                sidebarOpen = false;
            } else {
                sidebarOpen = true; // Desktop: open by default
            }
        }
        // If saved state exists, use it (respect user preference)
        
        // Set initial state
        updateSidebarState();
        
        // Scroll position was already restored by inline script in HTML
        // Just verify and adjust if needed
        if (sidebarContent && sidebarContent.scrollTop === 0) {
            // If still at top, try restoring again
            restoreScrollPosition();
        }
        
        // Check if we need to scroll to active item (after DOM is ready)
        requestAnimationFrame(function() {
            scrollToActiveItemIfNeeded();
        });
        
        // Save scroll position when user manually scrolls
        if (sidebarContent) {
            let scrollTimeout;
            sidebarContent.addEventListener('scroll', function() {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(saveScrollPosition, 150);
            });
        }
        
        // Save scroll position before page unload (when clicking links)
        window.addEventListener('beforeunload', saveScrollPosition);
        
        // Save scroll position when clicking sidebar links
        const sidebarLinks = document.querySelectorAll('.sidebar-article-link');
        sidebarLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Small delay to capture scroll position before navigation
                setTimeout(saveScrollPosition, 10);
            });
        });
        
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
        
        // Initialize collapsible chapters
        initCollapsibleChapters();
    }

    function getChapterStates() {
        try {
            const saved = localStorage.getItem(CHAPTER_STATE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load chapter states from localStorage:', e);
        }
        return {};
    }

    function saveChapterStates(states) {
        try {
            localStorage.setItem(CHAPTER_STATE_KEY, JSON.stringify(states));
        } catch (e) {
            console.warn('Could not save chapter states to localStorage:', e);
        }
    }

    function toggleChapter(chapterElement, chapterSlug) {
        const isExpanded = chapterElement.classList.contains('sidebar-chapter-expanded');
        const button = chapterElement.querySelector('.sidebar-chapter-toggle');
        
        if (isExpanded) {
            chapterElement.classList.remove('sidebar-chapter-expanded');
            chapterElement.classList.add('sidebar-chapter-collapsed');
            if (button) {
                button.setAttribute('aria-expanded', 'false');
            }
        } else {
            chapterElement.classList.remove('sidebar-chapter-collapsed');
            chapterElement.classList.add('sidebar-chapter-expanded');
            if (button) {
                button.setAttribute('aria-expanded', 'true');
            }
        }
        
        // Save state
        const states = getChapterStates();
        states[chapterSlug] = !isExpanded;
        saveChapterStates(states);
    }

    function initCollapsibleChapters() {
        const chapters = document.querySelectorAll('.sidebar-chapter');
        const savedStates = getChapterStates();
        const activeChapter = document.querySelector('.sidebar-chapter-expanded');
        
        chapters.forEach(function(chapter) {
            const button = chapter.querySelector('.sidebar-chapter-toggle');
            if (!button) return;
            
            const chapterSlug = chapter.getAttribute('data-chapter-slug');
            if (!chapterSlug) return;
            
            // Check if this is the active chapter (should be expanded)
            const isActiveChapter = chapter.classList.contains('sidebar-chapter-expanded');
            
            // Check saved state, but prioritize active chapter
            const savedState = savedStates[chapterSlug];
            
            if (!isActiveChapter && savedState === false) {
                // Collapse if saved state says so and it's not the active chapter
                chapter.classList.remove('sidebar-chapter-expanded');
                chapter.classList.add('sidebar-chapter-collapsed');
                button.setAttribute('aria-expanded', 'false');
            } else if (isActiveChapter) {
                // Always expand active chapter
                chapter.classList.remove('sidebar-chapter-collapsed');
                chapter.classList.add('sidebar-chapter-expanded');
                button.setAttribute('aria-expanded', 'true');
            } else if (savedState === undefined) {
                // No saved state - default to collapsed (except active chapter)
                chapter.classList.remove('sidebar-chapter-expanded');
                chapter.classList.add('sidebar-chapter-collapsed');
                button.setAttribute('aria-expanded', 'false');
            }
            
            // Add click handler
            button.addEventListener('click', function(e) {
                e.preventDefault();
                toggleChapter(chapter, chapterSlug);
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

