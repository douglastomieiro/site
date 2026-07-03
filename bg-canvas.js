(() => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  let mouse = { x: -9999, y: -9999, active: false };
  let points = [];
  let waves = [];
  let time = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const CONFIG = {
    gridSpacing: 80,
    pointRadius: 1.2,
    pointColor: 'rgba(138, 138, 146, 0.35)',
    lineColor: 'rgba(70, 72, 79, 0.08)',
    connectionDist: 130,
    mouseRadius: 200,

    waveCount: 4,
    waveSpeed: 0.0003,
    waveAmplitude: 30,

    particleCount: 35,
    particleMinSize: 0.5,
    particleMaxSize: 2,
    particleSpeed: 0.15,
  };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initGrid();
    initWaves();
  }

  function initGrid() {
    points = [];
    const sp = CONFIG.gridSpacing;
    const cols = Math.ceil(W / sp) + 2;
    const rows = Math.ceil(H / sp) + 2;
    const offsetX = (W - (cols - 1) * sp) / 2;
    const offsetY = (H - (rows - 1) * sp) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        points.push({
          baseX: offsetX + c * sp,
          baseY: offsetY + r * sp,
          x: offsetX + c * sp,
          y: offsetY + r * sp,
          vx: 0,
          vy: 0,
          col: c,
          row: r,
          cols: cols,
          rows: rows,
          phase: Math.random() * Math.PI * 2,
          drift: 0.3 + Math.random() * 0.4,
        });
      }
    }
  }

  function initWaves() {
    waves = [];
    for (let i = 0; i < CONFIG.waveCount; i++) {
      waves.push({
        y: H * (0.25 + (i / CONFIG.waveCount) * 0.55),
        amplitude: CONFIG.waveAmplitude * (0.5 + Math.random() * 0.5),
        frequency: 0.002 + Math.random() * 0.003,
        speed: CONFIG.waveSpeed * (0.6 + Math.random() * 0.8),
        phase: Math.random() * Math.PI * 2,
        alpha: 0.015 + (i / CONFIG.waveCount) * 0.02,
        lineWidth: 0.5 + Math.random() * 0.5,
      });
    }
  }

  const particles = [];
  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(createParticle());
    }
  }

  function createParticle() {
    return {
      x: Math.random() * (W || 1920),
      y: Math.random() * (H || 1080),
      size: CONFIG.particleMinSize + Math.random() * (CONFIG.particleMaxSize - CONFIG.particleMinSize),
      speedX: (Math.random() - 0.5) * CONFIG.particleSpeed,
      speedY: (Math.random() - 0.5) * CONFIG.particleSpeed * 0.6,
      alpha: 0.05 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
    };
  }

  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.active = false;
  });

  function update(dt) {
    time += dt;
    const mr = CONFIG.mouseRadius;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];

      const driftX = Math.sin(time * 0.0004 + p.phase) * p.drift;
      const driftY = Math.cos(time * 0.0003 + p.phase * 1.3) * p.drift;

      let targetX = p.baseX + driftX;
      let targetY = p.baseY + driftY;

      if (mouse.active) {
        const dx = p.baseX - mouse.x;
        const dy = p.baseY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mr && dist > 0) {
          const force = (1 - dist / mr) * 18;
          targetX += (dx / dist) * force;
          targetY += (dy / dist) * force;
        }
      }

      p.vx += (targetX - p.x) * 0.06;
      p.vy += (targetY - p.y) * 0.06;
      p.vx *= 0.82;
      p.vy *= 0.82;
      p.x += p.vx;
      p.y += p.vy;
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY + Math.sin(time * 0.001 + p.phase) * 0.03;

      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20;
      if (p.y > H + 20) p.y = -20;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#26272b');
    bgGrad.addColorStop(0.5, '#2b2c30');
    bgGrad.addColorStop(1, '#202124');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    drawWaves();
    drawConnections();
    drawPoints();
    drawParticles();

    if (mouse.active) {
      drawCursorGlow();
    }
  }

  function drawWaves() {
    for (let w = 0; w < waves.length; w++) {
      const wave = waves[w];
      ctx.beginPath();
      ctx.strokeStyle = `rgba(122, 122, 132, ${wave.alpha})`;
      ctx.lineWidth = wave.lineWidth;

      for (let x = 0; x <= W; x += 4) {
        const y = wave.y +
          Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 0.7) * wave.amplitude * 0.4;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  function drawConnections() {
    const mr = CONFIG.mouseRadius;

    ctx.lineWidth = 0.5;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];

      if (p.col < p.cols - 1) {
        const neighbor = points[i + 1];
        drawLine(p, neighbor, mr);
      }

      if (p.row < p.rows - 1) {
        const neighbor = points[i + p.cols];
        drawLine(p, neighbor, mr);
      }
    }
  }

  function drawLine(a, b, mr) {
    if (!mouse.active) {
      ctx.strokeStyle = CONFIG.lineColor;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      return;
    }

    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = mx - mouse.x;
    const dy = my - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < mr) {
      const t = 1 - dist / mr;
      const alpha = 0.06 + t * 0.18;
      ctx.strokeStyle = `rgba(138, 138, 146, ${alpha})`;
      ctx.lineWidth = 0.5 + t * 0.8;
    } else {
      ctx.strokeStyle = CONFIG.lineColor;
      ctx.lineWidth = 0.5;
    }

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function drawPoints() {
    const mr = CONFIG.mouseRadius;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      let radius = CONFIG.pointRadius;
      let color = CONFIG.pointColor;

      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mr) {
          const t = 1 - dist / mr;
          radius = CONFIG.pointRadius + t * 2;
          const alpha = 0.35 + t * 0.55;
          const lightness = 120 + t * 70;
          color = `rgba(${lightness}, ${lightness}, ${lightness + 5}, ${alpha})`;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.3, radius), 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const flicker = 0.7 + Math.sin(time * 0.002 + p.phase) * 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.2, p.size), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(138, 138, 146, ${p.alpha * flicker})`;
      ctx.fill();
    }
  }

  function drawCursorGlow() {
    const grad = ctx.createRadialGradient(
      mouse.x, mouse.y, 0,
      mouse.x, mouse.y, CONFIG.mouseRadius * 0.8
    );
    grad.addColorStop(0, 'rgba(138, 138, 146, 0.04)');
    grad.addColorStop(0.5, 'rgba(122, 122, 130, 0.015)');
    grad.addColorStop(1, 'rgba(90, 91, 96, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(
      mouse.x - CONFIG.mouseRadius,
      mouse.y - CONFIG.mouseRadius,
      CONFIG.mouseRadius * 2,
      CONFIG.mouseRadius * 2
    );
  }

  let lastTime = 0;

  function loop(timestamp) {
    const dt = Math.min(timestamp - lastTime, 50);
    lastTime = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  initParticles();
  requestAnimationFrame(loop);
})();
