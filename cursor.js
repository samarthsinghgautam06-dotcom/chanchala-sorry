/**
 * Interactive Sparkle & Floating Heart Cursor Engine 💖
 * Creates a magical trailing heart + sparkle effect following the mouse or touch.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Create Canvas Element for Cursor Trail
    const canvas = document.createElement('canvas');
    canvas.id = 'cursor-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // 2. Create Custom Glowing Cursor Pointer
    const cursorDot = document.createElement('div');
    cursorDot.id = 'custom-cursor-dot';
    cursorDot.innerHTML = '💖';
    cursorDot.style.position = 'fixed';
    cursorDot.style.pointerEvents = 'none';
    cursorDot.style.zIndex = '100000';
    cursorDot.style.fontSize = '24px';
    cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorDot.style.transition = 'transform 0.15s ease-out, filter 0.2s ease';
    cursorDot.style.filter = 'drop-shadow(0 0 8px rgba(255, 105, 180, 0.8))';
    document.body.appendChild(cursorDot);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetX = mouseX;
    let targetY = mouseY;
    let particles = [];
    const heartSymbols = ['💖', '💕', '💗', '✨', '🌸', '💓', '⭐'];

    // Smooth Cursor Physics
    function updateMousePos(x, y) {
        targetX = x;
        targetY = y;
        spawnParticles(x, y, 2);
    }

    window.addEventListener('mousemove', (e) => {
        updateMousePos(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    // Spawn Particles
    function spawnParticles(x, y, count = 1) {
        for (let i = 0; i < count; i++) {
            const isSymbol = Math.random() < 0.6;
            particles.push({
                x: x + (Math.random() - 0.5) * 12,
                y: y + (Math.random() - 0.5) * 12,
                symbol: isSymbol ? heartSymbols[Math.floor(Math.random() * heartSymbols.length)] : null,
                size: isSymbol ? Math.random() * 16 + 12 : Math.random() * 6 + 3,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.8) * 2 - 1, // float upwards
                alpha: 1,
                decay: Math.random() * 0.02 + 0.015,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.1,
                color: `hsl(${Math.random() * 40 + 330}, 100%, 70%)`
            });
        }
    }

    // Burst on click!
    window.addEventListener('click', (e) => {
        // Cursor bounce
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1.6)';
        setTimeout(() => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 150);

        // Click explosion particles
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            particles.push({
                x: e.clientX,
                y: e.clientY,
                symbol: heartSymbols[Math.floor(Math.random() * heartSymbols.length)],
                size: Math.random() * 20 + 14,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                alpha: 1,
                decay: Math.random() * 0.025 + 0.01,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.2,
                color: `hsl(${Math.random() * 50 + 320}, 100%, 65%)`
            });
        }
    });

    // Animation Loop
    function render() {
        ctx.clearRect(0, 0, width, height);

        // Smooth Lerp for Cursor Dot
        mouseX += (targetX - mouseX) * 0.35;
        mouseY += (targetY - mouseY) * 0.35;
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;

        // Render Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            p.rotation += p.rotSpeed;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            if (p.symbol) {
                ctx.font = `${p.size}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.symbol, 0, 0);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                ctx.fill();
            }

            ctx.restore();
        }

        requestAnimationFrame(render);
    }

    render();
});
