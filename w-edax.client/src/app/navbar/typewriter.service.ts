import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TypewriterService {
  private textArray: string[] = [
    "World-wide Ethical Defense & Attack Exchange."
  ];

  private textIndex: number = 0;
  private charIndex: number = 0;
  private currentText: string = '';
  private isDeleting: boolean = false;
  private typingSpeed: number = 20;  // Faster typing speed
  private deletingSpeed: number = 20;  // Faster deleting speed
  private delayBetweenTexts: number = 2000; // Reduced delay after typing out a full text

  private stopChar: string = "W"; // Character where backspacing should stop

  // Function to start or resume the typewriter effect
  startTypewriterEffect(typewriterTextElement: HTMLElement | null) {
    if (!typewriterTextElement) return;

    const currentTextToDisplay = this.textArray[this.textIndex];

    // Typing effect
    if (!this.isDeleting) {
      this.currentText = currentTextToDisplay.substring(0, this.charIndex++);

      // If fully typed, start deleting after a delay
      if (this.charIndex > currentTextToDisplay.length) {
        setTimeout(() => {
          this.isDeleting = true;
          this.charIndex = currentTextToDisplay.length;
        }, this.delayBetweenTexts);
      }
    } else {
      // Backspace effect until the specific character (like "W") or start
      const stopCharIndex = currentTextToDisplay.indexOf(this.stopChar);
      if (this.charIndex > stopCharIndex) {
        this.currentText = currentTextToDisplay.substring(0, this.charIndex--);
      } else {
        // Ensure the character "W" stays visible
        this.currentText = currentTextToDisplay.substring(0, stopCharIndex + 1);
        this.charIndex = stopCharIndex + 1; // Stop deleting
        this.isDeleting = false;
        this.textIndex = (this.textIndex + 1) % this.textArray.length; // Move to the next text
      }
    }

    typewriterTextElement.textContent = this.currentText;

    // Call the function recursively with appropriate speed
    setTimeout(() => this.startTypewriterEffect(typewriterTextElement), this.isDeleting ? this.deletingSpeed : this.typingSpeed);
  }
}
