/**
 * Audio Synthesizer Module using Web Audio API
 * Generates sparkling chimes & positive fanfare without external MP3 files
 */

const SoundEngine = (() => {
  let audioCtx = null;
  let isMuted = Storage.get('app_sound_muted', false);

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Play sparkling chime chord (C6 -> E6 -> G6 -> C7)
  function playCelebrationChime() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [
        { freq: 1046.50, delay: 0 },    // C6
        { freq: 1318.51, delay: 0.08 }, // E6
        { freq: 1567.98, delay: 0.16 }, // G6
        { freq: 2093.00, delay: 0.24 }  // C7 (Sparkle)
      ];

      const now = ctx.currentTime;

      notes.forEach(({ freq, delay }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.65);
      });
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // Play a gentle pop sound when adding a task
  function playPopSound() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('Audio pop error', e);
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    Storage.set('app_sound_muted', isMuted);
    return isMuted;
  }

  function getMuted() {
    return isMuted;
  }

  return {
    playCelebrationChime,
    playPopSound,
    toggleMute,
    getMuted
  };
})();
