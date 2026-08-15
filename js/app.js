/**
 * Main Application Orchestrator
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Sub-modules
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

  // 5. Setup Header Action Buttons (Modals & Sound)
  const btnThemeModal = document.getElementById('btn-open-theme-modal');
  const btnCompanionModal = document.getElementById('btn-open-companion-modal');
  const btnMuteSound = document.getElementById('btn-toggle-sound');
  const btnInstallPwa = document.getElementById('btn-install-pwa');

  const modalTheme = document.getElementById('modal-theme-settings');
  const modalCompanion = document.getElementById('modal-companion-settings');

  // Sound Mute Toggle
  function updateSoundButtonUI() {
    if (!btnMuteSound) return;
    const isMuted = SoundEngine.getMuted();
    btnMuteSound.innerHTML = isMuted ? '<span>🔇</span> Tắt Âm' : '<span>🔔</span> Bật Âm';
    btnMuteSound.classList.toggle('active', !isMuted);
  }

  if (btnMuteSound) {
    updateSoundButtonUI();
    btnMuteSound.addEventListener('click', () => {
      SoundEngine.toggleMute();
      updateSoundButtonUI();
    });
  }

  // Modal Open / Close Logic
  function openModal(modal) {
    if (modal) modal.classList.add('open');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('open');
  }

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

  if (btnTestCelebration) {
    btnTestCelebration.addEventListener('click', () => {
      CompanionManager.celebrate("Đây là hiệu ứng chúc mừng mẫu nè! Siêu tuyệt vời luôn! 🎉");
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

