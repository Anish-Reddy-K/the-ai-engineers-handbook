(function() {
    'use strict';

    const SOUND_STORAGE_KEY = 'arkr-sound-enabled';
    let soundEnabled = true;
    let soundToggle = null;
    let soundIcon = null;
    let clickSound = null;

    // initialize click sound audio element
    function initClickSound() {
        if (!clickSound) {
            clickSound = new Audio('/click.mp3');
            clickSound.volume = 0.8;
            clickSound.preload = 'auto';
        }
    }

    // play click sound only if sound is enabled
    function playClickSound() {
        if (!soundEnabled) {
            return; // don't play if sound is disabled
        }
        
        if (!clickSound) {
            initClickSound();
        }
        
        // reset audio to start and play
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(function(error) {
                // silently fail if audio can't play (e.g., user hasn't interacted with page)
                console.debug('Click sound playback prevented:', error);
            });
        }
    }

    // export playClickSound function globally so other scripts can use it
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
        
        // don't play sound on the toggle button itself to avoid feedback loop
        // the state change is visual (icon changes), which is sufficient feedback
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
        // default to enabled if no saved state
        soundEnabled = true;
        return false;
    }
    
    function init() {
        // initialize click sound
        initClickSound();
        
        // load saved state
        loadSoundState();
        
        // set initial active state
        updateSoundState();
        
        soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', toggleSound);
        }
    }

    // initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

