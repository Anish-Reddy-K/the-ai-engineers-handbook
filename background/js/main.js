(function() {
    'use strict';

    let currentTheme = 'dark';
    let starfieldCanvas = null;
    let gridContainer = null;

    function loadDarkStarfield() {
        // Remove grid background if it exists
        if (gridContainer) {
            gridContainer.remove();
            gridContainer = null;
        }

        // Ensure body has dark-mode class
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');

        // Create canvas for starfield if it doesn't exist
        if (!starfieldCanvas) {
            const container = document.getElementById('background-container');
            starfieldCanvas = document.createElement('canvas');
            starfieldCanvas.id = 'starfield-canvas';
            starfieldCanvas.className = 'starfield-background';
            container.appendChild(starfieldCanvas);
        }

        // Initialize starfield after a short delay to ensure canvas is ready
        setTimeout(() => {
            if (window.darkStarfieldBg && window.darkStarfieldBg.init) {
                window.darkStarfieldBg.init('starfield-canvas');
            }
        }, 10);
    }

    function loadLightGrid() {
        // Remove starfield canvas if it exists
        if (starfieldCanvas) {
            starfieldCanvas.remove();
            starfieldCanvas = null;
        }

        // Apply grid background to body
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        
        // Initialize grid background
        if (window.lightGridBg && window.lightGridBg.setTheme) {
            window.lightGridBg.setTheme('light');
        }
    }

    function switchTheme() {
        if (currentTheme === 'dark') {
            currentTheme = 'light';
            loadLightGrid();
            document.querySelector('.toggle-icon').textContent = '☀️';
        } else {
            currentTheme = 'dark';
            loadDarkStarfield();
            document.querySelector('.toggle-icon').textContent = '🌙';
        }
    }

    function init() {
        // Set up theme toggle button
        const toggleButton = document.getElementById('theme-toggle');
        toggleButton.addEventListener('click', switchTheme);

        // Load dark mode (starfield) by default
        loadDarkStarfield();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
