import { VoiceType } from '../types';

class SpeechService {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  private loadVoice(type: VoiceType) {
    const voices = this.synth.getVoices();
    // Simple heuristic: look for "male" or "female" in voice name or use defaults
    const filtered = voices.filter(v => v.lang.startsWith('en'));
    
    if (type === 'female') {
      this.voice = filtered.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('google uk english female')) || filtered[0];
    } else {
      this.voice = filtered.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('google uk english male')) || filtered[0];
    }
  }

  speak(text: string, type: VoiceType = 'female') {
    if (!this.synth) return;
    
    // Stop any current speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    this.loadVoice(type);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    
    utterance.pitch = 1.2; // Slightly higher pitch for kids
    utterance.rate = 0.9;  // Slightly slower for clarity
    
    this.synth.speak(utterance);
  }
}

export const speechService = new SpeechService();
