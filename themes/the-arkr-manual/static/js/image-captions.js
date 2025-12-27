(function() {
    'use strict';

    function initImageCaptions() {
        // Find all images with title attributes in article content
        const images = document.querySelectorAll('.content-area article img[title]');
        
        images.forEach(function(img) {
            // Skip if already wrapped
            if (img.closest('figure.image-caption-wrapper')) {
                return;
            }
            
            const title = img.getAttribute('title');
            
            // Create figure wrapper
            const figure = document.createElement('figure');
            figure.className = 'image-caption-wrapper';
            
            // Create figcaption
            const figcaption = document.createElement('figcaption');
            figcaption.textContent = title;
            
            // Wrap image
            img.parentNode.insertBefore(figure, img);
            figure.appendChild(img);
            figure.appendChild(figcaption);
            
            // Remove title attribute (already shown in caption)
            img.removeAttribute('title');
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImageCaptions);
    } else {
        initImageCaptions();
    }
    
    // Also run after dynamic content loads
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                initImageCaptions();
            }
        });
    });
    
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        observer.observe(contentArea, {
            childList: true,
            subtree: true
        });
    }
})();




