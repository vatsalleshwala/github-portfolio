/**
 * Zero-Gravity Cosmic Mouse Trail
 * Adds a high-performance, premium canvas-based glowing particle trail that follows the cursor.
 * Adaptable to Light and Dark themes dynamically.
 */

(function () {
  // Create and append the canvas element
  const canvas = document.createElement('canvas');
  canvas.id = 'mouse-trail-canvas';
  
  // Apply base styling directly to prevent layout shifts
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  canvas.style.mixBlendMode = 'screen'; // Creates beautiful overlapping glowing blends
  
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  
  // Track mouse states
  const mouse = {
    x: undefined,
    y: undefined,
    lastX: undefined,
    lastY: undefined,
    speed: 0,
    active: false
  };
  
  const particles = [];
  
  // Color palettes based on theme variables
  const palettes = {
    light: [
      'rgba(2, 132, 199, ',   // Sky Blue (#0284c7)
      'rgba(124, 58, 237, ',  // Violet (#7c3aed)
      'rgba(225, 29, 72, '    // Rose (#e11d48)
    ],
    dark: [
      'rgba(74, 174, 255, ',  // Cyan/Light Blue (#4aaeff)
      'rgba(160, 124, 248, ', // Pastel Purple (#a07cf8)
      'rgba(255, 107, 157, '  // Pastel Pink (#ff6b9d)
    ]
  };
  
  // Resize handler
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  // Particle class
  class Particle {
    constructor(x, y, palette) {
      this.x = x;
      this.y = y;
      
      // Zero gravity drift physics (slow upward drift with slight side waves)
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = -Math.random() * 1.0 - 0.5; // Upward drift
      
      // Random starting size
      this.size = Math.random() * 4 + 2;
      this.startSize = this.size;
      
      // Life span
      this.maxLife = Math.random() * 30 + 20;
      this.life = this.maxLife;
      
      // Theme-specific color
      const baseColor = palette[Math.floor(Math.random() * palette.length)];
      this.colorBase = baseColor;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
      
      // Exponential size shrink
      this.size = this.startSize * (this.life / this.maxLife);
    }
    
    draw() {
      const alpha = this.life / this.maxLife;
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `${this.colorBase}${alpha * 0.75})`;
      
      // Soft glow blur (using canvas native shadows only for larger particles to optimize performance)
      if (this.size > 3) {
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = `${this.colorBase}${alpha})`;
      } else {
        ctx.shadowBlur = 0;
      }
      
      ctx.fill();
    }
  }
  
  // Check active theme (Dark / Light) dynamically and adjust blend mode for visibility
  function getActivePalette() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle && toggle.checked) {
      canvas.style.mixBlendMode = 'screen'; // glowing blends on dark backgrounds
      return palettes.dark;
    }
    canvas.style.mixBlendMode = 'normal'; // high-contrast alpha-blending on light backgrounds
    return palettes.light;
  }
  
  // Mouse listeners
  window.addEventListener('mousemove', (e) => {
    mouse.active = true;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    // Calculate speed of mouse to adjust particle spawning rate
    if (mouse.lastX !== undefined && mouse.lastY !== undefined) {
      const dx = mouse.x - mouse.lastX;
      const dy = mouse.y - mouse.lastY;
      mouse.speed = Math.sqrt(dx * dx + dy * dy);
    }
    
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    
    // Spawn particles based on movement
    const spawnCount = Math.min(Math.floor(mouse.speed / 4) + 1, 4);
    const palette = getActivePalette();
    
    for (let i = 0; i < spawnCount; i++) {
      // Add slight scatter to spawn origin
      const offsetX = (Math.random() - 0.5) * 8;
      const offsetY = (Math.random() - 0.5) * 8;
      particles.push(new Particle(mouse.x + offsetX, mouse.y + offsetY, palette));
    }
  });
  
  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.lastX = undefined;
    mouse.lastY = undefined;
  });
  
  // Touch screen support
  window.addEventListener('touchmove', (e) => {
    mouse.active = true;
    const touch = e.touches[0];
    mouse.x = touch.clientX;
    mouse.y = touch.clientY;
    
    const palette = getActivePalette();
    particles.push(new Particle(mouse.x, mouse.y, palette));
  });
  
  window.addEventListener('touchend', () => {
    mouse.active = false;
  });
  
  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Turn off shadowBlur global states for efficiency
    ctx.shadowBlur = 0;
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      
      if (p.life <= 0 || p.size <= 0.1) {
        particles.splice(i, 1);
      } else {
        p.draw();
      }
    }
    
    // Reset shadow state for other operations
    ctx.shadowBlur = 0;
    
    requestAnimationFrame(animate);
  }
  
  // Set up theme change persistence listener
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      localStorage.setItem('theme', toggle.checked ? 'dark' : 'light');
    });
  }
  
  // Initialize loop
  animate();
})();
