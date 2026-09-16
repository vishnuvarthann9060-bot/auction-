class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Wooden gavel / hammer strike sound
  playHammer() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Gavel thump (low frequency thud)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.18);

    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);

    // High snap of wooden gavel
    const snap = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snap.type = "sawtooth";
    snap.frequency.setValueAtTime(600, t);
    snap.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    snapGain.gain.setValueAtTime(0.6, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    snap.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snap.start(t);
    snap.stop(t + 0.1);
  }

  // Live Bid placed: energetic rising chime
  playBid() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + index * 0.04);
      
      gain.gain.setValueAtTime(0.2, t + index * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + index * 0.04 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + index * 0.04);
      osc.stop(t + index * 0.04 + 0.25);
    });
  }

  // Timer Tick: wooden clock tick
  playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.04);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // Warning tone when timer <= 5s
  playWarning() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(329.63, t); // E4

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Outbid alert tone
  playOutbid() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(330, t + 0.1);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // SOLD Fanfare: triumphant horn progression
  playSoldFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Triumphant fanfare notes: G4 -> C5 -> E5 -> G5
    const fanfare = [
      { freq: 392.00, time: 0.0, dur: 0.15 },
      { freq: 523.25, time: 0.15, dur: 0.15 },
      { freq: 659.25, time: 0.30, dur: 0.18 },
      { freq: 783.99, time: 0.48, dur: 0.6 }
    ];

    fanfare.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.freq, t + note.time);

      gain.gain.setValueAtTime(0.35, t + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.time + note.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + note.time);
      osc.stop(t + note.time + note.dur);
    });

    // Plus gavel hit right at start
    this.playHammer();
  }
}

export const sounds = new SoundEngine();
