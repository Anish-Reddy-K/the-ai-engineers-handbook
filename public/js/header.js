// Zone A scrolls naturally with the page content
// Zone B is sticky and stays at the top

// Typewriter Effect Implementation
(function() {
  'use strict';

  const words = [
    "Computer Science.",
    "Software Engineering.",
    "Digital Systems.",
    "System Design."
  ];

  const typewriterElement = document.getElementById('typewriter-text');
  
  if (!typewriterElement) {
    return; // Exit if element doesn't exist
  }

  let currentWordIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100; // milliseconds per character
  let deletingSpeed = 50; // milliseconds per character deletion
  let pauseDuration = 2000; // pause at end of word (ms)

  function typeWriter() {
    const currentWord = words[currentWordIndex];
    
    if (isDeleting) {
      // Delete characters
      typewriterElement.textContent = currentWord.substring(0, currentCharIndex - 1);
      currentCharIndex--;
      
      if (currentCharIndex === 0) {
        // Finished deleting, switch to next word
        isDeleting = false;
        currentWordIndex = (currentWordIndex + 1) % words.length;
        setTimeout(typeWriter, 500); // Brief pause before typing next word
        return;
      }
      
      setTimeout(typeWriter, deletingSpeed);
    } else {
      // Type characters
      typewriterElement.textContent = currentWord.substring(0, currentCharIndex + 1);
      currentCharIndex++;
      
      if (currentCharIndex === currentWord.length) {
        // Finished typing word, pause then start deleting
        isDeleting = true;
        setTimeout(typeWriter, pauseDuration);
        return;
      }
      
      setTimeout(typeWriter, typingSpeed);
    }
  }

  // Start the typewriter effect
  typeWriter();
})();

