(function() {
    'use strict';

    let soundEnabled = true;
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = soundToggle ? soundToggle.querySelector('.material-symbols-outlined') : null;

    function toggleSound() {
        soundEnabled = !soundEnabled;
        
        if (soundToggle) {
            if (soundEnabled) {
                soundToggle.classList.add('active');
            } else {
                soundToggle.classList.remove('active');
            }
        }
        
        if (soundIcon) {
            soundIcon.textContent = soundEnabled ? 'volume_up' : 'volume_off';
        }
        
        // Placeholder for future sound functionality
        console.log('Sound', soundEnabled ? 'enabled' : 'disabled');
    }
    
    function init() {
        // Set initial active state
        if (soundToggle && soundEnabled) {
            soundToggle.classList.add('active');
        }
        
        if (soundToggle) {
            soundToggle.addEventListener('click', toggleSound);
        }
    }


    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

