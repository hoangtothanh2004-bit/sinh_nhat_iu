/**
 * Birthday Application Logic for Ngọc Bích (14/09)
 * Full interaction flow, audio sync, chibi animation, fireworks and 3D cake
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const canvas = document.getElementById('cakeCanvas');
  const introStage = document.getElementById('intro-stage');
  const chibiChar = document.getElementById('chibi-character');
  const chibiAvatar = document.getElementById('chibi-avatar');
  const speechBubble = document.getElementById('speech-bubble');
  const openLetterCta = document.getElementById('open-letter-cta');
  const skipToCakeBtn = document.getElementById('skip-to-cake-btn');
  const letterModal = document.getElementById('letter-modal');
  const closeLetterBtn = document.getElementById('close-letter-btn');
  const makeWishBtn = document.getElementById('make-wish-btn');
  const cakeUiLayer = document.getElementById('cake-ui-layer');
  const giftModal = document.getElementById('gift-modal');
  const openGiftBtn = document.getElementById('open-gift-btn');
  const closeGiftBtn = document.getElementById('close-gift-btn');
  const reopenLetterBtn = document.getElementById('reopen-letter-btn');
  const blowCandleBtn = document.getElementById('blow-candle-btn');
  const fireworkBtn = document.getElementById('firework-btn');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioBtnLabel = document.getElementById('audio-btn-label');
  const cornerChibi = document.getElementById('corner-chibi');
  const bgAudio = document.getElementById('bgAudio');
  const lyricText = document.getElementById('lyric-text');
  const stardustField = document.getElementById('stardust-field');
  const themeButtons = document.querySelectorAll('.hud-btn[data-theme]');

  // Initialize 3D Particle Cake Engine
  const cakeEngine = new Cake3D(canvas);
  cakeEngine.start();

  let hasStartedCakeMode = false;
  let isCandleBlown = false;

  // =========================================================================
  // 1. CHIBI RUNNING & INTRO ANIMATION TIMELINE
  // =========================================================================

  // Generate trailing stardust particles behind chibi while running
  let stardustInterval = setInterval(() => {
    if (!chibiChar || !introStage.contains(chibiChar)) {
      clearInterval(stardustInterval);
      return;
    }
    const rect = chibiChar.getBoundingClientRect();
    if (rect.right > 0 && rect.left < window.innerWidth) {
      createStardust(rect.left + rect.width / 2, rect.bottom - 20);
    }
  }, 100);

  function createStardust(x, y) {
    const p = document.createElement('div');
    p.className = 'stardust-particle';
    p.style.left = `${x + (Math.random() - 0.5) * 40}px`;
    p.style.top = `${y + (Math.random() - 0.5) * 20}px`;
    stardustField.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }

  // When Chibi finishes running to center (~3.8s)
  setTimeout(() => {
    chibiChar.classList.remove('chibi-running');
    chibiChar.classList.add('chibi-idle');
    clearInterval(stardustInterval);

    // Show speech bubble with cheerful greeting
    setTimeout(() => {
      speechBubble.classList.add('show');
    }, 300);

    // Show Open Letter CTA button & Skip link
    setTimeout(() => {
      openLetterCta.classList.add('show');
      skipToCakeBtn.classList.add('show');
    }, 700);
  }, 3800);

  // Click on Chibi or Button to open secret letter
  openLetterCta.addEventListener('click', openSecretLetter);
  chibiAvatar.addEventListener('click', openSecretLetter);

  // Skip straight to Cake
  skipToCakeBtn.addEventListener('click', () => {
    enterCakeSceneDirectly();
  });

  // =========================================================================
  // 2. OPENING SECRET LETTER (THIỆP CHÚC MỪNG 14/09)
  // =========================================================================
  function openSecretLetter() {
    // Attempt to start sweet birthday music
    playMusic();

    // Spawn celebratory sparkles
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        cakeEngine.createFirework(
          window.innerWidth / 2 + (Math.random() - 0.5) * 250,
          window.innerHeight / 2 + (Math.random() - 0.5) * 250
        );
      }, i * 140);
    }

    letterModal.classList.add('active');
  }

  function closeLetterModal() {
    letterModal.classList.remove('active');
  }

  closeLetterBtn.addEventListener('click', closeLetterModal);

  // =========================================================================
  // 3. TRANSITION TO 3D PARTICLE CAKE & FULL CELEBRATION
  // =========================================================================
  function enterCakeSceneDirectly() {
    closeLetterModal();
    playMusic();

    if (!hasStartedCakeMode) {
      hasStartedCakeMode = true;

      // Dissolve intro stage
      introStage.classList.add('fade-out');

      // Show corner chibi buddy
      setTimeout(() => {
        cornerChibi.classList.add('show');
      }, 800);

      // Reveal Main 3D Cake HUD with the grand title
      cakeUiLayer.classList.add('active');

      // Fireworks fanfare!
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          cakeEngine.launchAutoFireworks();
        }, i * 260);
      }

      // Start Lyric Rotation
      startLyrics();
    }
  }

  makeWishBtn.addEventListener('click', enterCakeSceneDirectly);

  // Corner Chibi reopens the letter
  cornerChibi.addEventListener('click', () => {
    openSecretLetter();
  });

  reopenLetterBtn.addEventListener('click', () => {
    openSecretLetter();
  });

  // =========================================================================
  // 4. GIFT MODAL ("🎁 MỞ QUÀ" NHƯ VIDEO MẪU)
  // =========================================================================
  openGiftBtn.addEventListener('click', () => {
    giftModal.classList.add('active');
    cakeEngine.launchAutoFireworks();
  });

  closeGiftBtn.addEventListener('click', () => {
    giftModal.classList.remove('active');
  });

  // Modern Light-Dismiss for Modals: click backdrop or press ESC
  [letterModal, giftModal].forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      letterModal.classList.remove('active');
      giftModal.classList.remove('active');
    }
  });

  // =========================================================================
  // 5. INTERACTIVE BUTTONS: BLOW CANDLE & FIREWORKS
  // =========================================================================
  blowCandleBtn.addEventListener('click', () => {
    if (isCandleBlown) return;
    isCandleBlown = true;

    // Extinguish candle flame particles temporarily
    cakeEngine.flameParticles = [];

    // Show celebratory notification in lyrics bar
    updateLyricDirectly("✨ Đã ước một điều ước! Nguyện mọi mong ước của Ngọc Bích đều thành hiện thực! ✨");

    // Blow smoke / sparkles
    for (let i = 0; i < 25; i++) {
      cakeEngine.sparkles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.58 - 50,
        alpha: 1
      });
    }

    blowCandleBtn.textContent = "🕯️ Nến đang ước nguyện...";

    // Reignite candle magically after 4 seconds
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

  fireworkBtn.addEventListener('click', () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => cakeEngine.launchAutoFireworks(), i * 200);
    }
  });

  // =========================================================================
  // 6. COLOR THEME SWITCHERS
  // =========================================================================
  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      themeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const themeKey = btn.getAttribute('data-theme');
      cakeEngine.setTheme(themeKey);

      // Firework with new theme color
      cakeEngine.launchAutoFireworks();
    });
  });

  // =========================================================================
  // 7. BACKGROUND MUSIC PLAYBACK & SYNC
  // =========================================================================
  function playMusic() {
    if (bgAudio.paused) {
      bgAudio.play().then(() => {
        audioFloatingActive(true);
      }).catch((err) => {
        console.log('Audio autoplay prevented, will start on next interaction:', err);
      });
    }
  }

  function audioFloatingActive(isPlaying) {
    if (isPlaying) {
      audioToggleBtn.classList.remove('paused');
      audioBtnLabel.textContent = 'Nhạc: Đang phát';
    } else {
      audioToggleBtn.classList.add('paused');
      audioBtnLabel.textContent = 'Nhạc: Tạm dừng';
    }
  }

  audioToggleBtn.addEventListener('click', () => {
    if (bgAudio.paused) {
      bgAudio.play();
      audioFloatingActive(true);
    } else {
      bgAudio.pause();
      audioFloatingActive(false);
    }
  });

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
});
