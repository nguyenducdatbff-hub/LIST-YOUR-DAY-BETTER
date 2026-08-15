/**
 * Comprehensive Audio & Voice Studio Module
 * Supports: Web Audio Synth (Chime), Vietnamese Voice TTS (Speech), Custom Upload Audio (MP3/WAV) & Volume control
 */

const SoundEngine = (() => {
  let audioCtx = null;
  let customAudioElement = null;
  let customAudioDataUrl = null;

  // Default settings
  let settings = {
    mode: 'chime', // 'chime' | 'voice' | 'custom' | 'mute'
    volume: 0.8,
    speechRate: 1.0,
    speechPitch: 1.1
  };

  async function init() {
    const saved = Storage.get('app_sound_settings');
    if (saved) {
      settings = { ...settings, ...saved };
    }

    // Load custom audio from IndexedDB if in custom mode or available
    const savedAudio = await Storage.getMedia('custom_celebration_audio');
    if (savedAudio) {
      customAudioDataUrl = savedAudio;
      prepareCustomAudio(savedAudio);
    }

    // Preload speech synthesis voices (especially Vietnamese)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }

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

  function saveSettings() {
    Storage.set('app_sound_settings', settings);
  }

  function prepareCustomAudio(dataUrl) {
    if (!customAudioElement) {
      customAudioElement = new Audio();
    }
    customAudioElement.src = dataUrl;
    customAudioElement.volume = settings.volume;
  }

  // 1. Play Sparkling Chime (Web Audio API)
  function playCelebrationChime() {
    if (settings.mode === 'mute' || settings.volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [
        { freq: 1046.50, delay: 0 },    // C6
        { freq: 1318.51, delay: 0.08 }, // E6
        { freq: 1567.98, delay: 0.16 }, // G6
        { freq: 2093.00, delay: 0.24 }  // C7
      ];

      const now = ctx.currentTime;
      const vol = settings.volume;

      notes.forEach(({ freq, delay }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.25 * vol, now + delay + 0.02);
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

  // 2. Play Vietnamese Speech (Web Speech API)
  function playSpeech(text) {
    if (settings.mode === 'mute' || settings.volume <= 0) return;
    if (!('speechSynthesis' in window) || !text) {
      playCelebrationChime();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech

      // Clean text (remove emoji for clean pronunciation)
      const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F0F5}\u{1F200}-\u{1F2FF}]/gu, '').trim();

      const utterance = new SpeechSynthesisUtterance(cleanText || text);
      utterance.volume = settings.volume;
      utterance.rate = settings.speechRate || 1.0;
      utterance.pitch = settings.speechPitch || 1.1;

      // Find best Vietnamese voice
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang && (v.lang.includes('vi') || v.lang.includes('VIE') || v.lang.includes('VN')));
      if (viVoice) {
        utterance.voice = viVoice;
      }
      utterance.lang = 'vi-VN';

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error, fallback to chime', e);
      playCelebrationChime();
    }
  }

  // 3. Play Custom Uploaded Audio (HTML5 Audio)
  function playCustomAudio() {
    if (settings.mode === 'mute' || settings.volume <= 0) return;
    if (!customAudioDataUrl) {
      playCelebrationChime();
      return;
    }

    try {
      if (!customAudioElement) {
        prepareCustomAudio(customAudioDataUrl);
      }
      customAudioElement.currentTime = 0;
      customAudioElement.volume = settings.volume;
      customAudioElement.play().catch((err) => {
        console.warn('Custom audio play blocked or failed:', err);
        playCelebrationChime();
      });
    } catch (e) {
      console.warn('Custom audio playback error:', e);
      playCelebrationChime();
    }
  }

  // Master Celebration Play Trigger
  function playCelebration(quoteText = "Tuyệt vời, hoàn thành thêm một việc rồi!") {
    if (settings.mode === 'mute') return;

    if (settings.mode === 'voice') {
      playSpeech(quoteText);
    } else if (settings.mode === 'custom' && customAudioDataUrl) {
      playCustomAudio();
    } else {
      playCelebrationChime();
    }
  }

  // Gentle Pop Sound for adding task
  function playPopSound() {
    if (settings.mode === 'mute' || settings.volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.15 * settings.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('Audio pop error', e);
    }
  }

  // Setters & Uploader
  function setMode(mode) {
    settings.mode = mode;
    saveSettings();
  }

  function getMode() {
    return settings.mode;
  }

  function setVolume(vol) {
    settings.volume = Math.max(0, Math.min(1, parseFloat(vol)));
    if (customAudioElement) {
      customAudioElement.volume = settings.volume;
    }
    saveSettings();
  }

  function getVolume() {
    return settings.volume;
  }

  async function setCustomAudio(file) {
    if (!file) return;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;
        customAudioDataUrl = dataUrl;
        prepareCustomAudio(dataUrl);
        await Storage.saveMedia('custom_celebration_audio', dataUrl);
        settings.mode = 'custom';
        saveSettings();
        resolve(true);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function resetAudio() {
    settings.mode = 'chime';
    settings.volume = 0.8;
    customAudioDataUrl = null;
    if (customAudioElement) {
      customAudioElement.pause();
      customAudioElement.src = '';
    }
    await Storage.saveMedia('custom_celebration_audio', null);
    Storage.remove('app_sound_settings');
  }

  function hasCustomAudio() {
    return !!customAudioDataUrl;
  }

  return {
    init,
    playCelebration,
    playCelebrationChime,
    playSpeech,
    playCustomAudio,
    playPopSound,
    setMode,
    getMode,
    setVolume,
    getVolume,
    setCustomAudio,
    resetAudio,
    hasCustomAudio
  };
})();
