<script lang="ts">
  import { onMount } from 'svelte';

  let canvasEl: HTMLCanvasElement;
  const colors = ['#2563eb', '#e11d48', '#d946ef'];
  const speed = 0.5;

  class Particle {
    color: string = colors[0];
    radius: number = 2;
    opacity: number = 1;
    x: number = 0;
    y: number = 0;
    vx: number = 0;
    vy: number = 0;
    vo: number = 0;

    constructor() {
      this.color = colors[Math.floor(Math.random() * 5)];
      this.opacity = Math.random();

      this.x = Math.floor(Math.random() * innerWidth);
      this.y = Math.floor(Math.random() * innerHeight);

      this.vx = speed * (Math.random() * 2 - 1) * Math.random();
      this.vy = speed * (Math.random() * 2 - 1) * Math.random();
      this.vo = (Math.random() * 2 - 1) * Math.random() * 0.02;
    }

    update(ctx: CanvasRenderingContext2D) {
      ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      // apply change
      const jitterX = (Math.random() * 2 - 1) * Math.random();
      const jitterY = (Math.random() * 2 - 1) * Math.random();
      this.x += this.vx + jitterX;
      this.y += this.vy + jitterY;
      this.opacity += this.vo;

      // bound checks
      if (this.y + this.vy > canvasEl.height - this.radius || this.y + this.vy < this.radius) {
        this.vy = -this.vy;
      }
      if (this.x + this.vx > canvasEl.width - this.radius || this.x + this.vx < this.radius) {
        this.vx = -this.vx;
      }
      if (this.opacity + this.vo >= 1 || this.opacity + this.vo <= 0) {
        this.vo = -this.vo;
      }
    }
  }

  let particles: Particle[] = [];

  function setSize() {
    if (!canvasEl) return;
    particles = [];
    let num = Math.floor((innerHeight + innerWidth) / 30);
    while (num--) {
      particles.push(new Particle());
    }
    canvasEl.height = innerHeight * devicePixelRatio;
    canvasEl.width = innerWidth * devicePixelRatio;
    canvasEl.style.width = innerWidth + 'px';
    canvasEl.style.height = innerHeight + 'px';
    canvasEl.getContext('2d')?.scale(devicePixelRatio, devicePixelRatio);
  }

  function draw() {
    const ctx = canvasEl?.getContext('2d');
    const { innerHeight, innerWidth } = window;
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, innerWidth * devicePixelRatio, innerHeight * devicePixelRatio);

    particles.forEach((p) => p.update(ctx));

    requestAnimationFrame(draw);
  }

  onMount(() => {
    addEventListener('resize', () => setSize());
    setSize();
    requestAnimationFrame(draw);
  });
</script>

<div class="min-h-screen w-full fixed z-1">
  <canvas bind:this={canvasEl} class="w-full h-full" />
</div>
