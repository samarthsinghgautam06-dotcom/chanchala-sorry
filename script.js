/**
 * Main Interactive Logic for Chanchala's Apology Website 💖
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check if CONFIG exists
    if (typeof CONFIG === 'undefined') {
        console.error('CONFIG object not loaded!');
        return;
    }

    // 1. Populate Text & Content from CONFIG
    document.title = `For ${CONFIG.name} 💖 | I'm Sorry`;
    
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) heroTitle.innerText = CONFIG.hero.title;

    const apologyTitle = document.getElementById('apology-title');
    if (apologyTitle) apologyTitle.innerText = CONFIG.apologyLetter.title;

    const apologyText = document.getElementById('apology-text');
    if (apologyText) apologyText.innerText = CONFIG.apologyLetter.text;

    // 2. Render Reasons Grid
    const reasonsGrid = document.getElementById('reasons-grid');
    if (reasonsGrid && CONFIG.reasons) {
        reasonsGrid.innerHTML = CONFIG.reasons.map(r => `
            <div class="reason-item">
                <div class="reason-icon">${r.icon}</div>
                <h4>${r.title}</h4>
                <p>${r.description}</p>
            </div>
        `).join('');
    }

    // 3. Render Coupons Grid
    const couponsGrid = document.getElementById('coupons-grid');
    if (couponsGrid && CONFIG.coupons) {
        couponsGrid.innerHTML = CONFIG.coupons.map(c => `
            <div class="coupon-card" id="coupon-${c.id}">
                <div>
                    <h4>${c.title}</h4>
                    <p>${c.desc}</p>
                </div>
                <button class="claim-btn" onclick="claimCoupon(${c.id})">Claim Coupon 🎟️</button>
            </div>
        `).join('');
    }

    // 4. Typewriter Animation Engine
    const typewriterElement = document.getElementById('typewriter');
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const texts = CONFIG.hero.typewriterTexts;

    function typeEffect() {
        if (!typewriterElement || texts.length === 0) return;

        const currentText = texts[textIndex];
        if (isDeleting) {
            typewriterElement.innerText = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typewriterElement.innerText = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let speed = isDeleting ? 40 : 80;

        if (!isDeleting && charIndex === currentText.length) {
            speed = 2500; // Pause at full line
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            speed = 500;
        }

        setTimeout(typeEffect, speed);
    }
    typeEffect();

    // 5. Runaway "No" Button Logic
    const btnNo = document.getElementById('btn-no');
    const btnYes = document.getElementById('btn-yes');
    let noClickCount = 0;
    let yesScale = 1;

    function moveNoButton() {
        if (!btnNo || !btnYes) return;
        noClickCount++;

        // Grow YES button
        yesScale += 0.18;
        btnYes.style.transform = `scale(${yesScale})`;

        // Cycle funny runaway text
        const messages = CONFIG.runawayNoMessages;
        btnNo.innerText = messages[noClickCount % messages.length];

        // Calculate escape coordinates within screen
        const padding = 60;
        const maxX = window.innerWidth - btnNo.offsetWidth - padding;
        const maxY = window.innerHeight - btnNo.offsetHeight - padding;

        const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
        const randomY = Math.max(padding, Math.floor(Math.random() * maxY));

        btnNo.style.position = 'fixed';
        btnNo.style.left = `${randomX}px`;
        btnNo.style.top = `${randomY}px`;
        btnNo.style.zIndex = '999';

        playChimeSound(300 + noClickCount * 40, 'triangle');
    }

    if (btnNo) {
        btnNo.addEventListener('mouseover', moveNoButton);
        btnNo.addEventListener('touchstart', (e) => {
            e.preventDefault();
            moveNoButton();
        });
        btnNo.addEventListener('click', moveNoButton);
    }

    // 6. Celebration Modal & Confetti
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close');

    if (btnYes) {
        btnYes.addEventListener('click', () => {
            if (modalOverlay) {
                modalTitle.innerText = CONFIG.celebration.title;
                modalBody.innerText = CONFIG.celebration.message;
                modalCloseBtn.innerText = CONFIG.celebration.buttonText;
                modalOverlay.classList.add('active');
            }
            triggerConfetti();
            playVictoryMelody();
        });
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            if (modalOverlay) modalOverlay.classList.remove('active');
        });
    }

    // 7. Love & Forgiveness Meter Logic
    const meterSlider = document.getElementById('meter-slider');
    const meterStatus = document.getElementById('meter-status');

    if (meterSlider && meterStatus) {
        meterSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            if (val < 25) {
                meterStatus.innerText = `Still thinking... 🥺 (${val}%)`;
            } else if (val < 60) {
                meterStatus.innerText = `Getting warmer! 💕 (${val}%)`;
            } else if (val < 99) {
                meterStatus.innerText = `Almost forgiven! 🥰 (${val}%)`;
            } else {
                meterStatus.innerText = `FORGIVEN FOREVER! 💖💖💖 (${val * 100}%)`;
                triggerConfetti();
                playChimeSound(600, 'sine');
            }
        });
    }
});

// Coupon Claim Handler
function claimCoupon(id) {
    const couponCard = document.getElementById(`coupon-${id}`);
    if (!couponCard) return;

    const btn = couponCard.querySelector('.claim-btn');
    const couponData = CONFIG.coupons.find(c => c.id === id);

    if (btn && couponData && !btn.classList.contains('claimed')) {
        btn.classList.add('claimed');
        btn.innerText = 'Redeemed! 💕';
        
        // Show notification toast / alert
        alert(`${couponData.claimedText}`);
        playChimeSound(523.25, 'sine'); // C5 note
    }
}

// Web Audio API Synthesizer (No MP3 dependencies needed!)
let audioCtx = null;
let isAudioPlaying = false;
let ambientInterval = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playChimeSound(freq = 440, type = 'sine') {
    try {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
        console.log('Audio playback prevented');
    }
}

function playVictoryMelody() {
    initAudio();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C E G C E G
    notes.forEach((freq, idx) => {
        setTimeout(() => {
            playChimeSound(freq, 'sine');
        }, idx * 120);
    });
}

function toggleAudio() {
    initAudio();
    const btn = document.getElementById('audio-toggle');
    if (!isAudioPlaying) {
        isAudioPlaying = true;
        if (btn) btn.innerHTML = '🔊 Music: Playing ✨';
        
        // Soft romantic ambient chord progression (Cmaj7 -> Am7 -> Fmaj7 -> G7)
        const chords = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [220.00, 261.63, 329.63, 392.00], // Am7
            [174.61, 220.00, 261.63, 329.63], // Fmaj7
            [196.00, 246.94, 293.66, 349.23]  // G7
        ];
        let chordIdx = 0;

        ambientInterval = setInterval(() => {
            if (!isAudioPlaying) return;
            const currentChord = chords[chordIdx % chords.length];
            currentChord.forEach(freq => playChimeSound(freq * 0.5, 'sine'));
            chordIdx++;
        }, 2200);

    } else {
        isAudioPlaying = false;
        if (btn) btn.innerHTML = '🎵 Music: Soft Ambience';
        if (ambientInterval) clearInterval(ambientInterval);
    }
}

// Simple Canvas Confetti Burst
function triggerConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '300000';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ff4d8d', '#ff85a2', '#ffb3c6', '#ffffff', '#ffd166', '#06d6a0'];
    const shapes = ['❤️', '💖', '✨', '🌸', '🎉'];

    for (let i = 0; i < 80; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.8) * 16 - 4,
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            size: Math.random() * 20 + 14,
            alpha: 1,
            decay: Math.random() * 0.015 + 0.01
        });
    }

    function renderConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3; // gravity
            p.alpha -= p.decay;

            if (p.alpha > 0) {
                active = true;
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.font = `${p.size}px sans-serif`;
                ctx.fillText(p.shape, p.x, p.y);
                ctx.restore();
            }
        });

        if (active) {
            requestAnimationFrame(renderConfetti);
        } else {
            canvas.remove();
        }
    }
    renderConfetti();
}
