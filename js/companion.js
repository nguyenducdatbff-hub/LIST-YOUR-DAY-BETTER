/**
 * Companion Mascot & Celebration Engine
 */

const CompanionManager = (() => {
  const DEFAULT_QUOTES = [
    "Tuyệt vời quá! Cậu đã hoàn thành thêm một việc rồi! ✨",
    "Đỉnh chóp luôn! Tiếp tục giữ phong độ này nhé! 🔥",
    "Xong thêm 1 việc! Tự thưởng cho mình một ngụm nước/trà sữa đi nào! 🧋",
    "Cố lên siêu nhân, hôm nay năng suất vượt bậc rồi đấy! 🚀",
    "Tuyệt vời! Mỗi bước đi nhỏ đều dẫn tới thành công lớn! 🌟",
    "Woa, nhanh thoăn thoắt! Cậu giỏi thật sự luôn! 💖",
    "Chúc mừng nhé! Nghỉ ngơi vài phút rồi chiến tiếp nào! ☕"
  ];

  const DEFAULT_AVATARS = [
    {
      id: 'chibi_cat',
      name: 'Mèo Chibi',
      url: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 'anime_girl',
      name: 'Anime Companion',
      url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 'cozy_shiba',
      name: 'Cún Shiba',
      url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=200&auto=format&fit=crop'
    }
  ];

  let quotes = [];
  let companionSettings = {
    avatarType: 'preset', // 'preset' | 'custom'
    presetAvatarId: 'chibi_cat',
    customAvatarUrl: null
  };

  let hideTimeout = null;

  async function init() {
    quotes = Storage.get('companion_quotes', DEFAULT_QUOTES);
    const saved = Storage.get('companion_settings');
    if (saved) {
      companionSettings = { ...companionSettings, ...saved };
    }

    if (companionSettings.avatarType === 'custom') {
      const customImg = await Storage.getMedia('custom_companion_avatar');
      if (customImg) {
        companionSettings.customAvatarUrl = customImg;
      } else {
        companionSettings.avatarType = 'preset';
      }
    }

    updateAvatarDisplay();
    renderQuotesList();
  }

  function getAvatarUrl() {
    if (companionSettings.avatarType === 'custom' && companionSettings.customAvatarUrl) {
      return companionSettings.customAvatarUrl;
    }
    const found = DEFAULT_AVATARS.find(a => a.id === companionSettings.presetAvatarId);
    return found ? found.url : DEFAULT_AVATARS[0].url;
  }

  function updateAvatarDisplay() {
    const avatarUrl = getAvatarUrl();
    const widgetImg = document.getElementById('companion-img');
    const modalPreview = document.getElementById('current-avatar-preview');

    if (widgetImg) widgetImg.src = avatarUrl;
    if (modalPreview) modalPreview.src = avatarUrl;
  }

  async function setCustomAvatar(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      companionSettings.avatarType = 'custom';
      companionSettings.customAvatarUrl = dataUrl;
      await Storage.saveMedia('custom_companion_avatar', dataUrl);
      Storage.set('companion_settings', {
        avatarType: 'custom',
        presetAvatarId: companionSettings.presetAvatarId
      });
      updateAvatarDisplay();
    };
    reader.readAsDataURL(file);
  }

  function setPresetAvatar(presetId) {
    companionSettings.avatarType = 'preset';
    companionSettings.presetAvatarId = presetId;
    Storage.set('companion_settings', {
      avatarType: 'preset',
      presetAvatarId: presetId
    });
    updateAvatarDisplay();
  }

  function getRandomQuote() {
    if (!quotes || quotes.length === 0) {
      return "Làm tốt lắm cậu ơi! 💖";
    }
    const idx = Math.floor(Math.random() * quotes.length);
    return quotes[idx];
  }

  function addQuote(text) {
    if (!text || !text.trim()) return;
    quotes.push(text.trim());
    Storage.set('companion_quotes', quotes);
    renderQuotesList();
  }

  function removeQuote(index) {
    quotes.splice(index, 1);
    if (quotes.length === 0) {
      quotes = [...DEFAULT_QUOTES];
    }
    Storage.set('companion_quotes', quotes);
    renderQuotesList();
  }

  function renderQuotesList() {
    const container = document.getElementById('companion-quotes-list');
    if (!container) return;

    container.innerHTML = quotes.map((q, idx) => `
      <div class="quote-item">
        <span>${escapeHtml(q)}</span>
        <button class="btn-remove-quote" data-idx="${idx}" title="Xóa câu này">✕</button>
      </div>
    `).join('');

    container.querySelectorAll('.btn-remove-quote').forEach(btn => {
      btn.addEventListener('click', () => {
        removeQuote(parseInt(btn.dataset.idx, 10));
      });
    });
  }

  // Trigger standard celebration popup
  function celebrate(customMessage = null) {
    const bubble = document.getElementById('companion-speech-bubble');
    const bubbleText = document.getElementById('companion-quote-text');
    const avatarBox = document.getElementById('companion-avatar-box');

    if (bubble) {
      bubble.classList.remove('grand-milestone');
      bubble.innerHTML = `
        <span class="speech-bubble-tag">Bạn đồng hành</span>
        <p id="companion-quote-text"></p>
      `;
    }

    const message = customMessage || getRandomQuote();
    const updatedText = document.getElementById('companion-quote-text');
    if (updatedText) updatedText.textContent = message;

    if (avatarBox) avatarBox.classList.add('active');
    if (bubble) bubble.classList.add('active');

    // Confetti particles explosion
    launchConfetti();

    // Play Celebration Audio / Voice based on user preference
    SoundEngine.playCelebration(message);

    // Reset dismiss timer
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      dismiss();
    }, 4500);
  }

  // Trigger Grand 100% Milestone Celebration with Interactive Decision Buttons
  function celebrate100Percent() {
    const bubble = document.getElementById('companion-speech-bubble');
    const avatarBox = document.getElementById('companion-avatar-box');

    if (!bubble) return;

    if (hideTimeout) clearTimeout(hideTimeout);

    bubble.classList.add('grand-milestone');
    bubble.innerHTML = `
      <span class="badge-grand-milestone">🏆 100% TIẾN ĐỘ HOÀN THÀNH</span>
      <p id="companion-quote-text" style="font-size: 0.95rem; font-weight: 700; margin-bottom: 6px;">
        🎉 XUẤT SẮC! Cậu đã hoàn thành 100% mục tiêu hôm nay rồi! Thật phi thường!
      </p>
      <p style="font-size: 0.82rem; color: #e0e7ff; margin-bottom: 4px;">
        Cậu có muốn làm mới danh sách không?
      </p>
      <div class="speech-actions-group">
        <button class="btn-bubble-action action-uncheck" data-action="uncheck">
          <span>🔄</span> Bỏ tick làm lại (bắt đầu mới)
        </button>
        <button class="btn-bubble-action action-clear" data-action="clear">
          <span>🗑️</span> Xóa việc đã xong (dọn dẹp)
        </button>
        <button class="btn-bubble-action action-rest" data-action="rest">
          <span>☕</span> Nghỉ ngơi thôi (giữ nguyên)
        </button>
      </div>
    `;

    if (avatarBox) avatarBox.classList.add('active');
    bubble.classList.add('active');

    // Giant double Confetti explosion for 100% milestone
    launchConfetti(100);

    // Play Grand celebratory voice / chime
    SoundEngine.playCelebration("Xuất sắc! Cậu đã hoàn thành 100% mục tiêu hôm nay rồi! Cậu làm việc tuyệt vời lắm!");

    // Wire click actions for the 3 choices
    const btnUncheck = bubble.querySelector('[data-action="uncheck"]');
    const btnClear = bubble.querySelector('[data-action="clear"]');
    const btnRest = bubble.querySelector('[data-action="rest"]');

    if (btnUncheck) {
      btnUncheck.addEventListener('click', (e) => {
        e.stopPropagation();
        TaskManager.uncheckAllTasks();
        showFeedbackAndDismiss(
          "Tuyệt vời! Bắt đầu chu kỳ mới đầy năng lượng nhé! Cậu đỉnh thật sự! 🔥",
          "Tuyệt vời! Bắt đầu chu kỳ mới đầy năng lượng nhé!"
        );
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', (e) => {
        e.stopPropagation();
        TaskManager.clearCompletedTasks();
        showFeedbackAndDismiss(
          "Đã dọn dẹp sạch sẽ! Sẵn sàng đón nhận những mục tiêu mới toanh! ✨",
          "Đã dọn dẹp sạch sẽ! Sẵn sàng đón nhận những mục tiêu mới toanh!"
        );
      });
    }

    if (btnRest) {
      btnRest.addEventListener('click', (e) => {
        e.stopPropagation();
        showFeedbackAndDismiss(
          "Quá xứng đáng! Cậu đã làm việc rất chăm chỉ rồi, giờ hãy thư giãn và nghỉ ngơi thật thoải mái đi nhé! 💖☕",
          "Quá xứng đáng! Cậu đã làm việc rất chăm chỉ rồi, hãy nghỉ ngơi thật thoải mái đi nhé!"
        );
      });
    }

    // Auto dismiss after 20 seconds if user doesn't pick anything
    hideTimeout = setTimeout(() => {
      dismiss();
    }, 20000);
  }

  function showFeedbackAndDismiss(displayMessage, voiceMessage) {
    const bubble = document.getElementById('companion-speech-bubble');
    if (!bubble) return;

    if (hideTimeout) clearTimeout(hideTimeout);

    bubble.innerHTML = `
      <span class="speech-bubble-tag">Bạn đồng hành</span>
      <p id="companion-quote-text" style="font-size: 0.92rem; font-weight: 600;">${escapeHtml(displayMessage)}</p>
    `;

    SoundEngine.playCelebration(voiceMessage);

    hideTimeout = setTimeout(() => {
      dismiss();
    }, 4500);
  }

  function dismiss() {
    const bubble = document.getElementById('companion-speech-bubble');
    const avatarBox = document.getElementById('companion-avatar-box');
    if (bubble) {
      bubble.classList.remove('active');
      bubble.classList.remove('grand-milestone');
    }
    if (avatarBox) avatarBox.classList.remove('active');
  }

  // Pure Canvas Confetti Engine (Zero external dependencies)
  function launchConfetti(particleCount = 65) {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#a855f7', '#fbbf24', '#f43f5e'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: window.innerWidth * (0.3 + Math.random() * 0.65),
        y: window.innerHeight * 0.85,
        w: Math.random() * 9 + 5,
        h: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: -(Math.random() * 14 + 10),
        gravity: 0.35,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        opacity: 1
      });
    }
        vy: -(Math.random() * 12 + 10),
        gravity: 0.35,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        opacity: 1
      });
    }

    let animationFrame = null;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotSpeed;
        p.opacity -= 0.012;

        if (p.opacity > 0 && p.y < canvas.height + 50) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }

      if (alive) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    animate();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  return {
    init,
    celebrate,
    celebrate100Percent,
    dismiss,
    setCustomAvatar,
    setPresetAvatar,
    addQuote,
    removeQuote,
    DEFAULT_AVATARS
  };
})();
