/**
 * Birthday Application Logic for Ngọc Bích (14/09)
 * Full interaction flow: 3D Particle Cake, Side Wings HUD, Audio, Lyrics, Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Canvas & 3D Cake Engine Initialization
  const canvas = document.getElementById('cakeCanvas');
  const cakeEngine = new Cake3D(canvas);
  cakeEngine.showCake = true; // Bánh sinh nhật luôn luôn hiển thị 100%
  cakeEngine.start();

  // 2. DOM Elements
  const openLetterCta = document.getElementById('open-letter-cta');
  const letterModal = document.getElementById('letter-modal');
  const closeLetterBtn = document.getElementById('close-letter-btn');
  const makeWishBtn = document.getElementById('make-wish-btn');
  
  const giftModal = document.getElementById('gift-modal');
  const openGiftBtn = document.getElementById('open-gift-btn');
  const closeGiftBtn = document.getElementById('close-gift-btn');

  const blowCandleBtn = document.getElementById('blow-candle-btn');
  const fireworkBtn = document.getElementById('firework-btn');

  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioBtnLabel = document.getElementById('audio-btn-label');
  const bgAudio = document.getElementById('bgAudio');
  const lyricText = document.getElementById('lyric-text');
  const themeButtons = document.querySelectorAll('.hud-btn[data-theme]');

  let isCandleBlown = false;

  // =========================================================================
  // 3. LETTER MODAL (BỨC THƯ CHÚC MỪNG 14/09)
  // =========================================================================
  function openSecretLetter() {
    playMusic();
    if (letterModal) {
      letterModal.classList.add('active');
    }
    // Celebratory fireworks on opening letter
    for (let i = 0; i < 4; i++) {
      setTimeout(() => cakeEngine.launchAutoFireworks(), i * 200);
    }
  }

  function closeSecretLetter() {
    if (letterModal) {
      letterModal.classList.remove('active');
    }
  }

  if (openLetterCta) {
    openLetterCta.addEventListener('click', openSecretLetter);
  }
  if (closeLetterBtn) {
    closeLetterBtn.addEventListener('click', closeSecretLetter);
  }
  if (makeWishBtn) {
    makeWishBtn.addEventListener('click', () => {
      closeSecretLetter();
      for (let i = 0; i < 5; i++) {
        setTimeout(() => cakeEngine.launchAutoFireworks(), i * 220);
      }
    });
  }

  // =========================================================================
  // 4. GIFT MODAL (HỘP QUÀ KỶ NIỆM POLAROID)
  // =========================================================================
  function openGift() {
    playMusic();
    if (giftModal) {
      giftModal.classList.add('active');
    }
    cakeEngine.launchAutoFireworks();
  }

  function closeGift() {
    if (giftModal) {
      giftModal.classList.remove('active');
    }
  }

  if (openGiftBtn) {
    openGiftBtn.addEventListener('click', openGift);
  }
  if (closeGiftBtn) {
    closeGiftBtn.addEventListener('click', closeGift);
  }

  // Modern Light-Dismiss: click backdrop or press ESC
  [letterModal, giftModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSecretLetter();
      closeGift();
    }
  });

  // =========================================================================
  // 5. INTERACTIVE BUTTONS: THỔI NẾN & BẮN PHÁO HOA
  // =========================================================================
  if (blowCandleBtn) {
    blowCandleBtn.addEventListener('click', () => {
      if (isCandleBlown) return;
      isCandleBlown = true;

      // Dập tắt ngọn nến tạm thời
      cakeEngine.flameParticles = [];

      // Hiển thị thông điệp ước nguyện ở thanh chữ chạy
      updateLyricDirectly("✨ Đã ước một điều ước! Nguyện mọi mong ước của Ngọc Bích đều thành hiện thực! ✨");

      // Bắn tia khói lung linh
      for (let i = 0; i < 30; i++) {
        cakeEngine.sparkles.push({
          x: window.innerWidth / 2,
          y: window.innerHeight * 0.54 - 60,
          alpha: 1
        });
      }

      blowCandleBtn.textContent = "🕯️ Nến đang ước nguyện...";

      // Thắp sáng lại ngọn nến kỳ diệu sau 4 giây
      setTimeout(() => {
        cakeEngine.flameParticles = [];
        for (let i = 0; i < 60; i++) {
          cakeEngine.flameParticles.push(cakeEngine.createFlameParticle());
        }
        isCandleBlown = false;
        blowCandleBtn.textContent = "💨 Thổi nến ước nguyện";
        cakeEngine.launchAutoFireworks();
      }, 4200);
    });
  }

  if (fireworkBtn) {
    fireworkBtn.addEventListener('click', () => {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => cakeEngine.launchAutoFireworks(), i * 180);
      }
    });
  }

  // =========================================================================
  // 6. COLOR THEME SWITCHERS (HỒNG NGỌT, NGỌC BÍCH, HOÀNG KIM, TÍM VŨ TRỤ)
  // =========================================================================
  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      themeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const themeKey = btn.getAttribute('data-theme');
      cakeEngine.setTheme(themeKey);

      // Pháo hoa chào mừng đổi màu
      cakeEngine.launchAutoFireworks();
    });
  });

  // =========================================================================
  // 7. BACKGROUND MUSIC & USER INTERACTION TRIGGER
  // =========================================================================
  function playMusic() {
    if (bgAudio && bgAudio.paused) {
      bgAudio.play().then(() => {
        audioFloatingActive(true);
      }).catch((err) => {
        console.log('Audio autoplay prevented, will wait for user touch:', err);
      });
    }
  }

  function audioFloatingActive(isPlaying) {
    if (!audioToggleBtn || !audioBtnLabel) return;
    if (isPlaying) {
      audioToggleBtn.classList.remove('paused');
      audioBtnLabel.textContent = 'Nhạc: Đang phát';
    } else {
      audioToggleBtn.classList.add('paused');
      audioBtnLabel.textContent = 'Nhạc: Tạm dừng';
    }
  }

  if (audioToggleBtn && bgAudio) {
    audioToggleBtn.addEventListener('click', () => {
      if (bgAudio.paused) {
        bgAudio.play();
        audioFloatingActive(true);
      } else {
        bgAudio.pause();
        audioFloatingActive(false);
      }
    });
  }

  // Autoplay music on any first user click/tap anywhere on the screen
  const startAudioOnFirstTouch = () => {
    playMusic();
    window.removeEventListener('click', startAudioOnFirstTouch);
    window.removeEventListener('touchstart', startAudioOnFirstTouch);
  };
  window.addEventListener('click', startAudioOnFirstTouch, { once: true });
  window.addEventListener('touchstart', startAudioOnFirstTouch, { once: true });

  // =========================================================================
  // 8. HANDWRITTEN LYRICS ROTATION (GIỐNG VIDEO MẪU)
  // =========================================================================
  const lyricsList = [
    "\" Một bài hát chất chứa câu ca điệu chân thành... \"",
    "\" Mong em cảm thấy happy, happy... \"",
    "\" Happy birthday 1 2 3... \"",
    "\" Baby ơi hôm nay em xinh lung linh như muôn ngàn vì sao... \"",
    "\" Happy birthday, I love you... \"",
    "\" Anh xin tặng điều ngọt ngào nhất bên em đến cả cuộc đời... \"",
    "\" Happy birthday, birthday, birthday... to you! \"",
    "\" Nhìn nàng thắp sáng ngọn lửa nến nụ cười đẹp biết bao... \"",
    "\" Chúc mừng sinh nhật Ngọc Bích - 14/09 trọn vẹn yêu thương! ✨ \""
  ];

  let currentLyricIndex = 0;
  let lyricInterval = null;

  function updateLyricDirectly(text) {
    if (!lyricText) return;
    lyricText.style.animation = 'none';
    void lyricText.offsetWidth; // Trigger reflow
    lyricText.textContent = text;
    lyricText.style.animation = 'lyricPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
  }

  function nextLyric() {
    currentLyricIndex = (currentLyricIndex + 1) % lyricsList.length;
    updateLyricDirectly(lyricsList[currentLyricIndex]);
  }

  function startLyrics() {
    if (lyricInterval) clearInterval(lyricInterval);
    updateLyricDirectly(lyricsList[0]);
    lyricInterval = setInterval(nextLyric, 4200);
  }

  // Start lyrics right away
  startLyrics();

  // Initial celebratory fireworks
  setTimeout(() => cakeEngine.launchAutoFireworks(), 500);
  setTimeout(() => cakeEngine.launchAutoFireworks(), 1200);
});
