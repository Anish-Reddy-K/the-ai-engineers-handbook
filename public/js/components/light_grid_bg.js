(function() {
    'use strict';

    function setTheme(theme) {
        const body = document.body;
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(theme === 'light' ? 'light-mode' : 'dark-mode');
    }

    // Export functions for external use
    window.lightGridBg = {
        setTheme: setTheme
    };
})();
