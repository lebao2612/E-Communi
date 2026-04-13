/**
 * Play a notification sound using Web Audio API
 * Creates a simple "ting" bell sound
 */
export const playNotificationSound = (volume: number = 0.3) => {
  try {
    // Use AudioContext to create a beep/ting sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for the sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set sound parameters for a pleasant "ting"
    oscillator.frequency.value = 800; // Hz - higher pitch for notification
    oscillator.type = 'sine';
    
    // Set volume
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    
    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // Play for 500ms
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('Failed to play notification sound:', error);
  }
};
