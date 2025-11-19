
class AudioService {
  public ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public isMuted: boolean = false;

  constructor() {
    // Lazy init
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5; // Master volume
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    if (!this.ctx) {
      this.init();
      this.isMuted = false;
    } else {
      this.isMuted = !this.isMuted;
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.5, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  private checkContext() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
      }
  }

  playBGM() {
    // Background music disabled by user request.
    return;
  }

  // -- SFX --

  playHover() {
    if (this.isMuted) return;
    this.checkContext();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.05);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(t + 0.05);
  }

  playClick() {
    if (this.isMuted) return;
    this.checkContext();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(t + 0.1);
  }

  playSuccess() {
    if (this.isMuted) return;
    this.checkContext();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const playNote = (freq: number, timeOffset: number) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t + timeOffset);
        gain.gain.linearRampToValueAtTime(0.2, t + timeOffset + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + timeOffset + 0.5);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(t + timeOffset);
        osc.stop(t + timeOffset + 0.5);
    };
    playNote(440, 0);
    playNote(554.37, 0.1);
    playNote(659.25, 0.2);
    playNote(880, 0.3);
  }

  playError() {
    if (this.isMuted) return;
    this.checkContext();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(50, t + 0.3);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(t + 0.3);
  }

  playUnlock() {
    if (this.isMuted) return;
    this.checkContext();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.6);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(2000, t + 0.6);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + 0.6);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(t + 0.6);
  }

  playTurnStart() {
    if (this.isMuted) return;
    this.checkContext();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.4);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(t + 0.8);
  }

  playBattle() {
    if (this.isMuted) return;
    this.checkContext();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.linearRampToValueAtTime(100, t + 0.4);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }

  playConstruction() {
    if (this.isMuted) return;
    this.checkContext();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(t + 0.5);
  }

  playDataProcess() {
    if (this.isMuted) return;
    this.checkContext();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    for(let i = 0; i < 6; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 800 + Math.random() * 800;
        const startTime = t + i * 0.06;
        gain.gain.setValueAtTime(0.05, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(startTime);
        osc.stop(startTime + 0.05);
    }
  }
}

export const audioService = new AudioService();
