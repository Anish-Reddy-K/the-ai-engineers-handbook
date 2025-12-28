// zone A scrolls naturally with the page content
// zone B is sticky and stays at the top

// typewriter effect implementation
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
    return; // exit if element doesn't exist
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
      // delete characters
      typewriterElement.textContent = currentWord.substring(0, currentCharIndex - 1);
      currentCharIndex--;
      
      if (currentCharIndex === 0) {
        // finished deleting, switch to next word
        isDeleting = false;
        currentWordIndex = (currentWordIndex + 1) % words.length;
        setTimeout(typeWriter, 500); // brief pause before typing next word
        return;
      }
      
      setTimeout(typeWriter, deletingSpeed);
    } else {
      // type characters
      typewriterElement.textContent = currentWord.substring(0, currentCharIndex + 1);
      currentCharIndex++;
      
      if (currentCharIndex === currentWord.length) {
        // finished typing word, pause then start deleting
        isDeleting = true;
        setTimeout(typeWriter, pauseDuration);
        return;
      }
      
      setTimeout(typeWriter, typingSpeed);
    }
  }

  // start the typewriter effect
  typeWriter();
})();

