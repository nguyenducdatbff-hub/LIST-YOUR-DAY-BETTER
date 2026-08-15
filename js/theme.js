/**
 * Theme & Wallpaper Studio Manager
 */

const ThemeManager = (() => {
  // Built-in aesthetic presets (100% Offline-First CSS Gradients & High-res Visuals)
  const PRESET_WALLPAPERS = [
    {
      id: 'ghibli_nature',
      name: '🌿 Ghibli Forest',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop',
      gradient: 'radial-gradient(circle at 20% 20%, #2d6a4f 0%, #1b4332 40%, #081c15 100%)'
    },
    {
      id: 'cozy_lofi_cafe',
      name: '☕ Cozy Sunset',
      url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=2000&auto=format&fit=crop',
      gradient: 'linear-gradient(135deg, #4a154b 0%, #6b114d 35%, #b10059 70%, #ff5964 100%)'
    },
    {
      id: 'sunset_cloudscape',
      name: '🌅 Pastel Sky',
      url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop',
      gradient: 'linear-gradient(135deg, #2b1055 0%, #7597de 50%, #b8c0ff 100%)'
    },
    {
      id: 'cyberpunk_neon',
      name: '🌃 Neon City',
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2000&auto=format&fit=crop',
      gradient: 'radial-gradient(circle at 50% 30%, #3a0ca3 0%, #0f0c20 60%, #05050b 100%)'
    },
    {
      id: 'lavender_dream',
      name: '🪻 Lavender Chill',
      url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2000&auto=format&fit=crop',
      gradient: 'linear-gradient(135deg, #190933 0%, #3d1e6d 50%, #8447ff 100%)'
    },
    {
      id: 'emerald_aurora',
      name: '✨ Emerald Aurora',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop',
      gradient: 'linear-gradient(135deg, #022c22 0%, #065f46 50%, #10b981 100%)'
    }
  ];

  let currentTheme = {
    type: 'preset',
    presetId: 'ghibli_nature',
    customDataUrl: null,
    overlayOpacity: 0.25,
    blurAmount: 0
  };

  async function init() {
    const saved = Storage.get('app_theme_settings');
    if (saved) {
      currentTheme = { ...currentTheme, ...saved };
    }

    if (currentTheme.type === 'custom') {
      const customImg = await Storage.getMedia('custom_wallpaper');
      if (customImg) {
        currentTheme.customDataUrl = customImg;
      } else {
        currentTheme.type = 'preset';
      }
    }

    applyTheme();
    renderPresetsList();
    syncControls();
  }

  function applyTheme() {
    const layer = document.getElementById('wallpaper-layer');
    const overlay = document.getElementById('wallpaper-overlay');

    if (!layer) return;

    if (currentTheme.type === 'custom' && currentTheme.customDataUrl) {
      layer.style.backgroundImage = `url("${currentTheme.customDataUrl}")`;
    } else {
      const preset = PRESET_WALLPAPERS.find(p => p.id === currentTheme.presetId) || PRESET_WALLPAPERS[0];
      
      // Áp dụng gradient tức thì để màn hình có màu đẹp 100% không bị đen
      layer.style.backgroundImage = `url("${preset.url}"), ${preset.gradient}`;
    }

    if (overlay) {
      overlay.style.backgroundColor = `rgba(5, 7, 15, ${currentTheme.overlayOpacity})`;
    }
    document.documentElement.style.setProperty('--wallpaper-blur', `${currentTheme.blurAmount}px`);

    saveSettings();
  }

  function saveSettings() {
    const toSave = {
      type: currentTheme.type,
      presetId: currentTheme.presetId,
      overlayOpacity: currentTheme.overlayOpacity,
      blurAmount: currentTheme.blurAmount
    };
    Storage.set('app_theme_settings', toSave);
  }

  function setPreset(presetId) {
    currentTheme.type = 'preset';
    currentTheme.presetId = presetId;
    applyTheme();
    renderPresetsList();
  }

  async function setCustomWallpaper(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      currentTheme.type = 'custom';
      currentTheme.customDataUrl = dataUrl;
      await Storage.saveMedia('custom_wallpaper', dataUrl);
      applyTheme();
      renderPresetsList();
    };
    reader.readAsDataURL(file);
  }

  function setOpacity(val) {
    currentTheme.overlayOpacity = parseFloat(val);
    applyTheme();
  }

  function setBlur(val) {
    currentTheme.blurAmount = parseInt(val, 10);
    applyTheme();
  }

  function renderPresetsList() {
    const container = document.getElementById('preset-wallpapers-list');
    if (!container) return;

    container.innerHTML = PRESET_WALLPAPERS.map(p => {
      const isActive = currentTheme.type === 'preset' && currentTheme.presetId === p.id;
      return `
        <div class="preset-thumb ${isActive ? 'active' : ''}" 
             style="background-image: url('${p.url}')" 
             data-id="${p.id}"
             title="${p.name}">
          <div class="preset-label">${p.name}</div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.preset-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        setPreset(thumb.dataset.id);
      });
    });
  }

  function syncControls() {
    const opacityInput = document.getElementById('setting-opacity-range');
    const opacityVal = document.getElementById('setting-opacity-val');
    const blurInput = document.getElementById('setting-blur-range');
    const blurVal = document.getElementById('setting-blur-val');

    if (opacityInput && opacityVal) {
      opacityInput.value = currentTheme.overlayOpacity;
      opacityVal.textContent = `${Math.round(currentTheme.overlayOpacity * 100)}%`;
    }
    if (blurInput && blurVal) {
      blurInput.value = currentTheme.blurAmount;
      blurVal.textContent = `${currentTheme.blurAmount}px`;
    }
  }

  function resetTheme() {
    currentTheme = {
      type: 'preset',
      presetId: 'ghibli_nature',
      customDataUrl: null,
      overlayOpacity: 0.25,
      blurAmount: 0
    };
    Storage.remove('app_theme_settings');
    Storage.remove('media_custom_wallpaper');
    applyTheme();
    renderPresetsList();
    syncControls();
    
    // Clear Service Worker Caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
  }

  return {
    init,
    setPreset,
    setCustomWallpaper,
    setOpacity,
    setBlur,
    resetTheme,
    getPresets: () => PRESET_WALLPAPERS
  };
})();
