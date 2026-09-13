/**
 * Cake3D - Interactive 3D Particle Birthday Cake Engine
 * Crafted specifically for Ngọc Bích (14/09)
 */

class Cake3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.flameParticles = [];
    this.fireworks = [];
    this.sparkles = [];
    
    this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = window.innerHeight;

    // 3D Camera & Rotation
    this.rotX = 0.35; // Initial tilt angle (looking slightly down at cake)
    this.rotY = 0;
    this.targetRotX = 0.35;
    this.targetRotY = 0;
    this.autoRotateSpeed = 0.007;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.fov = 500;
    this.scale = 1.0;

    // Theme Color Palettes
    this.themes = {
      rose: {
        name: 'Hồng Thạch Anh',
        cake1: ['#ff75a0', '#ff9ebb', '#fbc2eb', '#ffffff'],
        cake2: ['#f72585', '#b5179e', '#7209b7', '#f783ac'],
        frosting: ['#ffffff', '#fff0f5', '#ffe3e3', '#ffd1dc'],
        candle: ['#ffffff', '#ffccd5'],
        flame: ['#fff475', '#ffa41b', '#ff5722', '#ffffff']
      },
      gold: {
        name: 'Hoàng Kim',
        cake1: ['#ffd700', '#ffb703', '#fff3b0', '#ffffff'],
        cake2: ['#fb8500', '#d4af37', '#e9c46a', '#f4a261'],
        frosting: ['#ffffff', '#fffbe6', '#ffe8a1'],
        candle: ['#ffffff', '#fff3cd'],
        flame: ['#ffffff', '#ffe600', '#ff5400', '#ff0054']
      },
      emerald: {
        name: 'Ngọc Bích',
        cake1: ['#2ec4b6', '#a8dadc', '#b5e2fa', '#ffffff'],
        cake2: ['#00b4d8', '#0077b6', '#48cae4', '#90e0ef'],
        frosting: ['#ffffff', '#e0fbfc', '#cbf3f0'],
        candle: ['#ffffff', '#ccffec'],
        flame: ['#fff475', '#ff9f1c', '#ff5722', '#ffffff']
      },
      galaxy: {
        name: 'Tím Huyền Ảo',
        cake1: ['#a370f7', '#7b2cbf', '#e0aaff', '#ffffff'],
        cake2: ['#5a189a', '#9d4edd', '#c77dff', '#e0aaff'],
        frosting: ['#ffffff', '#f3e8ff', '#e9d5ff'],
        candle: ['#ffffff', '#e2d4f0'],
        flame: ['#ffe66d', '#ff6b6b', '#ffffff', '#ff9f1c']
      }
    };

    this.currentThemeKey = 'rose'; // Default to Rose Pink theme as in sample video!
    this.theme = this.themes[this.currentThemeKey];
    this.showCake = true; // Bánh sinh nhật luôn luôn hiển thị 100%!

    this.initEvents();
    this.buildCakeModel();
    this.initBackgroundStars();
  }

  setTheme(key) {
    if (this.themes[key]) {
      this.currentThemeKey = key;
      this.theme = this.themes[key];
      this.recolorParticles();
    }
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth || document.documentElement.clientWidth || 1920;
    this.height = this.canvas.height = window.innerHeight || document.documentElement.clientHeight || 1080;

    const isMobile = this.width <= 768;
    if (isMobile) {
      this.scale = Math.min(this.width, this.height) / 530;
      if (this.scale < 0.70) this.scale = 0.70;
      if (this.scale > 0.90) this.scale = 0.90;
    } else {
      this.scale = Math.min(this.width, this.height) / 720;
      if (this.scale < 0.85) this.scale = 0.85;
    }
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());
    this.resize();

    const startDrag = (x, y) => {
      this.isDragging = true;
      this.lastMouseX = x;
      this.lastMouseY = y;
    };

    const doDrag = (x, y) => {
      if (!this.isDragging) return;
      const dx = x - this.lastMouseX;
      const dy = y - this.lastMouseY;
      this.targetRotY += dx * 0.008;
      this.targetRotX += dy * 0.008;

      // Clamp vertical tilt to prevent looking completely from underside
      this.targetRotX = Math.max(-0.2, Math.min(0.8, this.targetRotX));

      this.lastMouseX = x;
      this.lastMouseY = y;
    };

    const stopDrag = () => {
      this.isDragging = false;
    };

    this.canvas.addEventListener('mousedown', (e) => {
      startDrag(e.clientX, e.clientY);
      this.createFirework(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => doDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', stopDrag);

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
        this.createFirework(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        doDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', stopDrag);
  }

  initBackgroundStars() {
    this.stars = [];
    for (let i = 0; i < 180; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.6 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
        twinkleSpeed: Math.random() * 0.05 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  buildCakeModel() {
    this.particles = [];
    const rnd = (min, max) => Math.random() * (max - min) + min;
    const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Center offset of cake
    const baseY = 80;

    // 1. Base Plate / Plate Glow Ring
    const plateRadius = 180;
    for (let i = 0; i < 280; i++) {
      const angle = (i / 280) * Math.PI * 2 + rnd(-0.02, 0.02);
      const r = plateRadius + rnd(-6, 6);
      this.particles.push({
        x0: Math.cos(angle) * r,
        y0: baseY + 55 + rnd(-3, 3),
        z0: Math.sin(angle) * r,
        colorType: 'frosting',
        color: choose(this.theme.frosting),
        baseSize: rnd(1.5, 2.8),
        pulse: Math.random() * Math.PI * 2
      });
    }

    // 2. Bottom Tier (Tier 1) - Cylinder
    const t1Radius = 150;
    const t1Height = 65;
    const t1Y = baseY + 50;

    // Bottom tier outer cylinder walls
    for (let i = 0; i < 750; i++) {
      const angle = Math.random() * Math.PI * 2;
      const y = t1Y - Math.random() * t1Height;
      const r = t1Radius + rnd(-4, 4);
      this.particles.push({
        x0: Math.cos(angle) * r,
        y0: y,
        z0: Math.sin(angle) * r,
        colorType: 'cake2',
        color: choose(this.theme.cake2),
        baseSize: rnd(1.4, 2.6),
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Bottom tier top surface & cream drips
    for (let i = 0; i < 480; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * t1Radius;
      const y = t1Y - t1Height + rnd(-2, 2);
      this.particles.push({
        x0: Math.cos(angle) * r,
        y0: y,
        z0: Math.sin(angle) * r,
        colorType: 'frosting',
        color: choose(this.theme.frosting),
        baseSize: rnd(1.2, 2.4),
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Decorative cream beads around bottom tier rim
    for (let i = 0; i < 220; i++) {
      const angle = (i / 220) * Math.PI * 2;
      const wave = Math.sin(angle * 12) * 5;
      const r = t1Radius + 2;
      this.particles.push({
        x0: Math.cos(angle) * r,
        y0: (t1Y - t1Height) + wave,
        z0: Math.sin(angle) * r,
        colorType: 'frosting',
        color: '#ffffff',
        baseSize: rnd(2.2, 3.4),
        pulse: Math.random() * Math.PI * 2
      });
    }

    // 3. Top Tier (Tier 2) - Cylinder
    const t2Radius = 100;
    const t2Height = 55;
    const t2Y = t1Y - t1Height - 4;

    // Top tier outer cylinder walls
    for (let i = 0; i < 600; i++) {
      const angle = Math.random() * Math.PI * 2;
      const y = t2Y - Math.random() * t2Height;
      const r = t2Radius + rnd(-3, 3);
      this.particles.push({
        x0: Math.cos(angle) * r,
        y0: y,
        z0: Math.sin(angle) * r,
        colorType: 'cake1',
        color: choose(this.theme.cake1),
        baseSize: rnd(1.4, 2.5),
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Top tier top surface
    for (let i = 0; i < 400; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * t2Radius;
      const y = t2Y - t2Height + rnd(-2, 2);
      this.particles.push({
        x0: Math.cos(angle) * r,
        y0: y,
        z0: Math.sin(angle) * r,
        colorType: 'frosting',
        color: choose(this.theme.frosting),
        baseSize: rnd(1.3, 2.4),
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Cream piping around top tier rim
    for (let i = 0; i < 180; i++) {
      const angle = (i / 180) * Math.PI * 2;
      const wave = Math.sin(angle * 10) * 4;
      const r = t2Radius + 2;
      this.particles.push({
        x0: Math.cos(angle) * r,
        y0: (t2Y - t2Height) + wave,
        z0: Math.sin(angle) * r,
        colorType: 'frosting',
        color: '#ffffff',
        baseSize: rnd(2.2, 3.5),
        pulse: Math.random() * Math.PI * 2
      });
    }

    // 4. Center Birthday Candle
    const candleRadius = 8;
    const candleHeight = 55;
    const candleY = t2Y - t2Height;

    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const y = candleY - Math.random() * candleHeight;
      const r = candleRadius * Math.sqrt(Math.random());
      this.particles.push({
        x0: Math.cos(angle) * r,
        y0: y,
        z0: Math.sin(angle) * r,
        colorType: 'candle',
        color: choose(this.theme.candle),
        baseSize: rnd(1.4, 2.5),
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Candle wick
    for (let y = candleY - candleHeight; y >= candleY - candleHeight - 8; y -= 1.5) {
      this.particles.push({
        x0: 0,
        y0: y,
        z0: 0,
        colorType: 'candle',
        color: '#ffddaa',
        baseSize: 1.8,
        pulse: 0
      });
    }

    // Candle flame position reference
    this.flameTipY = candleY - candleHeight - 12;

    // Init flame particles
    this.flameParticles = [];
    for (let i = 0; i < 60; i++) {
      this.flameParticles.push(this.createFlameParticle());
    }

    // Swirling stardust galaxy around the cake
    this.ambientSwirl = [];
    for (let i = 0; i < 220; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = rnd(120, 260);
      this.ambientSwirl.push({
        angle: angle,
        radius: r,
        y: rnd(baseY - 120, baseY + 80),
        speed: rnd(0.005, 0.02),
        size: rnd(1.0, 2.6),
        alpha: rnd(0.3, 0.9),
        color: choose([...this.theme.cake1, ...this.theme.cake2, '#ffffff'])
      });
    }
  }

  createFlameParticle() {
    return {
      x: (Math.random() - 0.5) * 6,
      y: this.flameTipY + (Math.random() - 0.5) * 4,
      z: (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 1.2 - 0.4,
      vz: (Math.random() - 0.5) * 0.4,
      life: Math.random() * 25 + 15,
      maxLife: 40,
      size: Math.random() * 3.5 + 2.5,
      color: this.theme.flame[Math.floor(Math.random() * this.theme.flame.length)]
    };
  }

  recolorParticles() {
    const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];
    for (let p of this.particles) {
      if (this.theme[p.colorType]) {
        p.color = choose(this.theme[p.colorType]);
      }
    }
  }

  createFirework(x, y) {
    const colors = [...this.theme.cake1, ...this.theme.cake2, '#ffffff', '#ffd700', '#ff75a0'];
    const count = 45;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.fireworks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 1.5,
        alpha: 1,
        decay: Math.random() * 0.025 + 0.015,
        gravity: 0.08
      });
    }
  }

  launchAutoFireworks() {
    const x = Math.random() * (this.width * 0.8) + (this.width * 0.1);
    const y = Math.random() * (this.height * 0.45) + (this.height * 0.1);
    this.createFirework(x, y);
  }

  update() {
    // Smooth camera rotation
    if (!this.isDragging) {
      this.targetRotY += this.autoRotateSpeed;
    }
    this.rotX += (this.targetRotX - this.rotX) * 0.08;
    this.rotY += (this.targetRotY - this.rotY) * 0.08;

    // Update Flame Particles
    for (let i = 0; i < this.flameParticles.length; i++) {
      const p = this.flameParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.life--;
      p.size *= 0.96;
      if (p.life <= 0 || p.size < 0.5) {
        this.flameParticles[i] = this.createFlameParticle();
      }
    }

    // Update Ambient Swirling Dust
    for (let s of this.ambientSwirl) {
      s.angle += s.speed;
      s.y -= 0.15;
      if (s.y < 80 - 150) {
        s.y = 80 + 80;
      }
    }

    // Update Fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];
      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.vy += fw.gravity;
      fw.vx *= 0.98;
      fw.alpha -= fw.decay;
      if (fw.alpha <= 0) {
        this.fireworks.splice(i, 1);
      }
    }

    // Background Stars Twinkle
    for (let star of this.stars) {
      star.twinklePhase += star.twinkleSpeed;
    }

    // Periodic random firework in the background
    if (Math.random() < 0.018) {
      this.launchAutoFireworks();
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Background Stars
    for (let star of this.stars) {
      const currentAlpha = star.alpha + Math.sin(star.twinklePhase) * 0.3;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, currentAlpha)})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);

    const isMobile = this.width <= 768;
    const centerX = this.width / 2;
    const centerY = isMobile ? this.height * 0.35 : this.height * 0.54;

    // 2. Project Cake Particles & Sort by Depth Z (Luôn hiển thị 100% không bao giờ ẩn)
    const projected = [];
    const scaleFactor = this.scale;

    // Helper for 3D rotation & projection
    const project = (x, y, z) => {
      // Rotate around Y axis
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;

      // Rotate around X axis
      const y2 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;

      // Perspective projection
      const distance = this.fov + z2;
      if (distance <= 10) return null;
      const pScale = (this.fov / distance) * scaleFactor;
      const projX = centerX + x1 * pScale;
      const projY = centerY + y2 * pScale;

      return { x: projX, y: projY, z: z2, pScale: pScale };
    };

    // Cake solid particles
    const time = performance.now() * 0.003;
    for (let p of this.particles) {
      const pr = project(p.x0, p.y0, p.z0);
      if (!pr) continue;
      const pulseSize = p.baseSize + Math.sin(time + p.pulse) * 0.4;
      projected.push({
        x: pr.x,
        y: pr.y,
        z: pr.z,
        radius: Math.max(1.8, pulseSize * pr.pScale * 1.35),
        color: p.color,
        alpha: Math.min(1, Math.max(0.75, 0.75 + (pr.z + 250) / 600))
      });
    }

    // Ambient Swirl Particles
    for (let s of this.ambientSwirl) {
      const sx = Math.cos(s.angle) * s.radius;
      const sz = Math.sin(s.angle) * s.radius;
      const pr = project(sx, s.y, sz);
      if (!pr) continue;
      projected.push({
        x: pr.x,
        y: pr.y,
        z: pr.z,
        radius: Math.max(1.2, s.size * pr.pScale * 1.2),
        color: s.color,
        alpha: Math.min(1, s.alpha * pr.pScale * 1.3)
      });
    }

    // Flame Particles
    for (let fp of this.flameParticles) {
      const pr = project(fp.x, fp.y, fp.z);
      if (!pr) continue;
      projected.push({
        x: pr.x,
        y: pr.y,
        z: pr.z,
        radius: Math.max(3.0, fp.size * pr.pScale * 1.4),
        color: fp.color,
        alpha: Math.min(1, (fp.life / fp.maxLife) * 1.5),
        isFlame: true
      });
    }

    // Sort back-to-front
    projected.sort((a, b) => a.z - b.z);

    // Render 3D Projected Particles
    ctx.save();
    for (let p of projected) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.isFlame) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Render Fireworks Over Canvas
    ctx.save();
    for (let fw of this.fireworks) {
      ctx.globalAlpha = fw.alpha;
      ctx.fillStyle = fw.color;
      ctx.shadowColor = fw.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(fw.x, fw.y, fw.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  animate() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.animate());
  }

  revealCake() {
    this.showCake = true;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => this.launchAutoFireworks(), i * 220);
    }
  }

  start() {
    this.animate();
  }
}

window.Cake3D = Cake3D;
