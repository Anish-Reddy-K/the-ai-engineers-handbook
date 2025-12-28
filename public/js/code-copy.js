(function() {
    'use strict';

    function initCodeCopyButtons() {
        const codeBlocks = document.querySelectorAll('.content-area article pre code');
        
        codeBlocks.forEach((codeElement, index) => {
            // skip if already has a copy button
            if (codeElement.closest('.code-block-wrapper')) {
                return;
            }
            
            const preElement = codeElement.parentElement;
            
            // create wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';
            
            // create copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'code-copy-button';
            copyButton.setAttribute('aria-label', 'Copy code to clipboard');
            copyButton.innerHTML = '<span class="material-symbols-outlined copy-icon">content_copy</span><span class="copy-text">Copy</span>';
            
            // wrap pre element
            preElement.parentNode.insertBefore(wrapper, preElement);
            wrapper.appendChild(preElement);
            wrapper.appendChild(copyButton);
            
            // add click handler
            copyButton.addEventListener('click', function() {
                const codeText = codeElement.textContent || codeElement.innerText;
                
                // copy to clipboard
                navigator.clipboard.writeText(codeText).then(function() {
                    // success feedback
                    const originalText = copyButton.innerHTML;
                    copyButton.innerHTML = '<span class="material-symbols-outlined copy-icon">check</span><span class="copy-text">Copied!</span>';
                    copyButton.classList.add('copied');
                    
                    // reset after 2 seconds
                    setTimeout(function() {
                        copyButton.innerHTML = originalText;
                        copyButton.classList.remove('copied');
                    }, 2000);
                }).catch(function(err) {
                    // fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = codeText;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    
                    try {
                        document.execCommand('copy');
                        const originalText = copyButton.innerHTML;
                        copyButton.innerHTML = '<span class="material-symbols-outlined copy-icon">check</span><span class="copy-text">Copied!</span>';
                        copyButton.classList.add('copied');
                        
                        setTimeout(function() {
                            copyButton.innerHTML = originalText;
                            copyButton.classList.remove('copied');
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy code:', err);
                    }
                    
                    document.body.removeChild(textArea);
                });
            });
        });
    }

    // initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCodeCopyButtons);
    } else {
        initCodeCopyButtons();
    }
    
    // also run after dynamic content loads (if using AJAX)
    // this ensures copy buttons are added even if content is loaded dynamically
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                initCodeCopyButtons();
            }
        });
    });
    
    // observe the content area for changes
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        observer.observe(contentArea, {
            childList: true,
            subtree: true
        });
    }
})();

