(function() {
    'use strict';

    const SOUND_STORAGE_KEY = 'arkr-sound-enabled';
    let soundEnabled = true;
    let soundToggle = null;
    let soundIcon = null;
    let clickSound = null;

    // Initialize click sound audio element
    function initClickSound() {
        if (!clickSound) {
            clickSound = new Audio('/click.mp3');
            clickSound.volume = 0.8; // Set volume to 30% for subtlety
            clickSound.preload = 'auto';
        }
    }

    // Play click sound only if sound is enabled
    function playClickSound() {
        if (!soundEnabled) {
            return; // Don't play if sound is disabled
        }
        
        if (!clickSound) {
            initClickSound();
        }
        
        // Reset audio to start and play
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(function(error) {
                // Silently fail if audio can't play (e.g., user hasn't interacted with page)
                console.debug('Click sound playback prevented:', error);
            });
        }
    }

    // Export playClickSound function globally so other scripts can use it
    window.playClickSound = playClickSound;

    function updateSoundState() {
        if (!soundToggle) {
            soundToggle = document.getElementById('sound-toggle');
            soundIcon = soundToggle ? soundToggle.querySelector('.material-symbols-outlined') : null;
        }
        
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
    }

    function toggleSound() {
        soundEnabled = !soundEnabled;
        updateSoundState();
        saveSoundState();
        
        // Don't play sound on the toggle button itself to avoid feedback loop
        // The state change is visual (icon changes), which is sufficient feedback
    }

    function saveSoundState() {
        try {
            localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify({
                enabled: soundEnabled,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Could not save sound state to localStorage:', e);
        }
    }

    function loadSoundState() {
        try {
            const saved = localStorage.getItem(SOUND_STORAGE_KEY);
            if (saved) {
                const state = JSON.parse(saved);
                soundEnabled = state.enabled;
                return true;
            }
        } catch (e) {
            console.warn('Could not load sound state from localStorage:', e);
        }
        // Default to enabled if no saved state
        soundEnabled = true;
        return false;
    }
    
    function init() {
        // Initialize click sound
        initClickSound();
        
        // Load saved state
        loadSoundState();
        
        // Set initial active state
        updateSoundState();
        
        soundToggle = document.getElementById('sound-toggle');
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


