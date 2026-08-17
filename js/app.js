/**
 * Main Application Orchestrator
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Sub-modules
  await SoundEngine.init();
  await ThemeManager.init();
  await CompanionManager.init();
  TaskManager.init();

  // 2. Đăng ký Service Worker (bắt buộc để PWA Install hoạt động)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('[SW] Registered, scope:', reg.scope);
      })
      .catch((err) => console.warn('[SW] Registration failed:', err));
  }

  // 3. Setup Task Composer Form
  const composerForm = document.getElementById('task-composer-form');
  const taskInput = document.getElementById('task-input-field');
  const dueDateInput = document.getElementById('task-due-date');
  let selectedPriority = 'medium';

  // Priority selector buttons
  const prioButtons = document.querySelectorAll('.prio-opt');
  prioButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      prioButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedPriority = btn.dataset.prio;
    });
  });

  if (composerForm) {
    composerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = taskInput.value.trim();
      const dueDate = dueDateInput ? dueDateInput.value : '';

      if (title) {
        TaskManager.addTask(title, selectedPriority, dueDate);
        taskInput.value = '';
        taskInput.focus();
      }
    });
  }

  // 4. Setup Filter Chips
  const filterButtons = document.querySelectorAll('.chip-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      TaskManager.setFilter(btn.dataset.filter);
    });
  });

  // 5. Setup Header Action Buttons & Modals
  const btnOpenAudioModal = document.getElementById('btn-open-audio-modal');
  const btnThemeModal = document.getElementById('btn-open-theme-modal');
  const btnCompanionModal = document.getElementById('btn-open-companion-modal');
  const btnInstallPwa = document.getElementById('btn-install-pwa');

  const modalAudio = document.getElementById('modal-audio-settings');
  const modalTheme = document.getElementById('modal-theme-settings');
  const modalCompanion = document.getElementById('modal-companion-settings');

  // Modal Open / Close Logic
  function openModal(modal) {
    if (modal) modal.classList.add('open');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('open');
  }

  if (btnOpenAudioModal) btnOpenAudioModal.addEventListener('click', () => openModal(modalAudio));
  if (btnThemeModal) btnThemeModal.addEventListener('click', () => openModal(modalTheme));
  if (btnCompanionModal) btnCompanionModal.addEventListener('click', () => openModal(modalCompanion));

  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop');
      closeModal(modal);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  // 6. Setup Audio Studio UI & Controls
  const soundIconSpan = document.getElementById('sound-btn-icon');
  const soundLabelSpan = document.getElementById('sound-btn-label');
  const audioModeCards = document.querySelectorAll('.audio-mode-card');
  const customAudioFileInput = document.getElementById('custom-audio-file');
  const customAudioStatus = document.getElementById('custom-audio-status');
  const soundVolumeRange = document.getElementById('sound-volume-range');
  const soundVolumeVal = document.getElementById('sound-volume-val');
  const btnTestSound = document.getElementById('btn-test-sound');
  const btnResetAudio = document.getElementById('btn-reset-audio');

  function syncAudioUI() {
    const currentMode = SoundEngine.getMode();
    const currentVol = SoundEngine.getVolume();

    // Update Header Button
    if (soundIconSpan && soundLabelSpan) {
      if (currentMode === 'mute') {
        soundIconSpan.textContent = '🔇';
        soundLabelSpan.textContent = 'Tắt Âm';
        if (btnOpenAudioModal) btnOpenAudioModal.classList.remove('active');
      } else if (currentMode === 'voice') {
        soundIconSpan.textContent = '🗣️';
        soundLabelSpan.textContent = 'Giọng Nói';
        if (btnOpenAudioModal) btnOpenAudioModal.classList.add('active');
      } else if (currentMode === 'custom') {
        soundIconSpan.textContent = '🎵';
        soundLabelSpan.textContent = 'Âm Riêng';
        if (btnOpenAudioModal) btnOpenAudioModal.classList.add('active');
      } else {
        soundIconSpan.textContent = '🔔';
        soundLabelSpan.textContent = 'Chuông';
        if (btnOpenAudioModal) btnOpenAudioModal.classList.add('active');
      }
    }

    // Update Mode Cards in Modal
    audioModeCards.forEach(card => {
      card.classList.toggle('active', card.dataset.mode === currentMode);
    });

    // Update Volume Range
    if (soundVolumeRange && soundVolumeVal) {
      soundVolumeRange.value = currentVol;
      soundVolumeVal.textContent = `${Math.round(currentVol * 100)}%`;
    }

    // Update Custom Audio Status
    if (customAudioStatus) {
      if (SoundEngine.hasCustomAudio()) {
        customAudioStatus.innerHTML = '✅ <strong>Đã lưu 1 file âm thanh của bạn trong máy</strong>';
        customAudioStatus.style.color = '#34d399';
      } else {
        customAudioStatus.innerHTML = '(Hỗ trợ file MP3, WAV, M4A nhạc khích lệ hoặc giọng thu âm)';
        customAudioStatus.style.color = '#a5b4fc';
      }
    }
  }

  // Audio Mode Selection click
  audioModeCards.forEach(card => {
    card.addEventListener('click', () => {
      const mode = card.dataset.mode;
      if (mode === 'custom' && !SoundEngine.hasCustomAudio()) {
        // Prompt to upload file if none exists
        if (customAudioFileInput) customAudioFileInput.click();
        return;
      }
      SoundEngine.setMode(mode);
      syncAudioUI();
    });
  });

  // Custom Audio File Upload
  if (customAudioFileInput) {
    customAudioFileInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        await SoundEngine.setCustomAudio(file);
        syncAudioUI();
        SoundEngine.playCelebration("Chúc mừng cậu đã tải âm thanh thành công!");
      }
    });
  }

  // Volume Slider
  if (soundVolumeRange && soundVolumeVal) {
    soundVolumeRange.addEventListener('input', (e) => {
      SoundEngine.setVolume(e.target.value);
      soundVolumeVal.textContent = `${Math.round(e.target.value * 100)}%`;
    });
  }

  // Test Sound
  if (btnTestSound) {
    btnTestSound.addEventListener('click', () => {
      SoundEngine.playCelebration("Wow! Cậu giỏi quá, xong việc rồi nè! Tiếp tục phát huy nhé!");
    });
  }

  // Reset Audio to Default Chime
  if (btnResetAudio) {
    btnResetAudio.addEventListener('click', async () => {
      await SoundEngine.resetAudio();
      syncAudioUI();
      alert('Đã khôi phục âm thanh chuông Ting Ting mặc định! 🔔');
    });
  }

  // Initial Sync
  syncAudioUI();

  // 6. Setup Theme Studio Inputs
  const customWallpaperInput = document.getElementById('custom-wallpaper-file');
  const opacityRange = document.getElementById('setting-opacity-range');
  const blurRange = document.getElementById('setting-blur-range');

  if (customWallpaperInput) {
    customWallpaperInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        ThemeManager.setCustomWallpaper(e.target.files[0]);
      }
    });
  }

  if (opacityRange) {
    opacityRange.addEventListener('input', (e) => {
      ThemeManager.setOpacity(e.target.value);
      const valDisplay = document.getElementById('setting-opacity-val');
      if (valDisplay) valDisplay.textContent = `${Math.round(e.target.value * 100)}%`;
    });
  }

  if (blurRange) {
    blurRange.addEventListener('input', (e) => {
      ThemeManager.setBlur(e.target.value);
      const valDisplay = document.getElementById('setting-blur-val');
      if (valDisplay) valDisplay.textContent = `${e.target.value}px`;
    });
  }

  const btnResetTheme = document.getElementById('btn-reset-theme');
  if (btnResetTheme) {
    btnResetTheme.addEventListener('click', () => {
      ThemeManager.resetTheme();
      alert('Đã reset hình nền về mặc định rực rỡ và xóa cache cũ thành công! 🎉');
    });
  }

  // 7. Setup Companion Mascot Settings & Custom Quotes
  const customAvatarInput = document.getElementById('custom-avatar-file');
  const formAddQuote = document.getElementById('form-add-quote');
  const inputNewQuote = document.getElementById('input-new-quote');
  const btnTestCelebration = document.getElementById('btn-test-celebration');

  if (customAvatarInput) {
    customAvatarInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        CompanionManager.setCustomAvatar(e.target.files[0]);
      }
    });
  }

  if (formAddQuote && inputNewQuote) {
    formAddQuote.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = inputNewQuote.value.trim();
      if (val) {
        CompanionManager.addQuote(val);
        inputNewQuote.value = '';
      }
    });
  }

  const btnTest100Celebration = document.getElementById('btn-test-100-celebration');

  if (btnTestCelebration) {
    btnTestCelebration.addEventListener('click', () => {
      CompanionManager.celebrate("Đây là hiệu ứng chúc mừng mẫu nè! Siêu tuyệt vời luôn! 🎉");
    });
  }

  if (btnTest100Celebration) {
    btnTest100Celebration.addEventListener('click', () => {
      CompanionManager.celebrate100Percent();
    });
  }

  // Click companion speech bubble or avatar to dismiss
  const speechBubble = document.getElementById('companion-speech-bubble');
  const avatarBox = document.getElementById('companion-avatar-box');
  if (speechBubble) speechBubble.addEventListener('click', () => CompanionManager.dismiss());
  if (avatarBox) avatarBox.addEventListener('click', () => CompanionManager.dismiss());

  // 8. PWA Install Prompt for Desktop & Mobile
  let deferredPrompt = null;

  // Luôn hiển thị nút Cài App ngay từ đầu
  if (btnInstallPwa) {
    btnInstallPwa.style.display = 'inline-flex';
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Đánh dấu nút có thể install ngay (1-click)
    if (btnInstallPwa) {
      btnInstallPwa.title = 'Cài đặt ngay 1-Click!';
      btnInstallPwa.classList.add('active');
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (btnInstallPwa) {
      btnInstallPwa.innerHTML = '<span>✅</span> Đã Cài!';
      btnInstallPwa.disabled = true;
    }
  });

  if (btnInstallPwa) {
    btnInstallPwa.addEventListener('click', async () => {
      if (deferredPrompt) {
        // 1-click install nếu trình duyệt hỗ trợ
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          btnInstallPwa.innerHTML = '<span>✅</span> Đã Cài!';
          btnInstallPwa.disabled = true;
        }
        deferredPrompt = null;
      } else {
        // Hiển thị modal hướng dẫn thay vì alert thô
        showInstallGuideModal();
      }
    });
  }

  function showInstallGuideModal() {
    const existing = document.getElementById('modal-install-guide');
    if (existing) {
      existing.classList.add('open');
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'modal-install-guide';
    modal.className = 'modal-backdrop open';
    modal.innerHTML = `
      <div class="modal-card" style="max-width:480px;">
        <div class="modal-header">
          <h2><span>💻</span> Cài App Lên Máy Tính</h2>
          <button class="btn-close-modal" id="close-install-guide">✕</button>
        </div>
        <div class="modal-body" style="gap:16px;">
          <p style="color:var(--text-secondary);font-size:0.9rem;">Làm theo các bước sau để cài <strong>Aesthetic Focus To-Do</strong> thành app độc lập trên máy tính:</p>
          
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;align-items:flex-start;gap:14px;padding:14px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);border-radius:12px;">
              <div style="font-size:1.5rem;flex-shrink:0;">1️⃣</div>
              <div>
                <div style="font-weight:700;margin-bottom:4px;">Nhìn lên thanh địa chỉ URL</div>
                <div style="font-size:0.83rem;color:var(--text-secondary);">Trong Chrome hoặc Microsoft Edge, ở góc phải của thanh địa chỉ <code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;">localhost:3000</code> sẽ có biểu tượng máy tính nhỏ <strong>(⊕)</strong></div>
              </div>
            </div>
            
            <div style="display:flex;align-items:flex-start;gap:14px;padding:14px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);border-radius:12px;">
              <div style="font-size:1.5rem;flex-shrink:0;">2️⃣</div>
              <div>
                <div style="font-weight:700;margin-bottom:4px;">Bấm vào biểu tượng đó</div>
                <div style="font-size:0.83rem;color:var(--text-secondary);">Chọn <strong>"Cài đặt"</strong> hoặc <strong>"Install"</strong> trong popup hiện ra. App sẽ tự động thêm vào màn hình Desktop và thanh Taskbar!</div>
              </div>
            </div>
            
            <div style="display:flex;align-items:flex-start;gap:14px;padding:14px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:12px;">
              <div style="font-size:1.5rem;flex-shrink:0;">💡</div>
              <div>
                <div style="font-weight:700;margin-bottom:4px;">Nếu không thấy biểu tượng?</div>
                <div style="font-size:0.83rem;color:var(--text-secondary);">Tắt DevTools (F12) nếu đang mở → Reload trang bằng <code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;">Ctrl+F5</code> → Đợi 5 giây rồi nhìn lại góc phải thanh địa chỉ.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
    document.getElementById('close-install-guide').addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }
});

