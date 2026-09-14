/* ==========================================
   ROMANTIC INTERACTIVE JS FOR SPECIAL BIRTHDAY TEMPLATE
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const typingLine1 = document.getElementById('typingLine1');
    const typingLine2 = document.getElementById('typingLine2');
    const envelopeContainer = document.getElementById('envelopeContainer');
    const envelope = document.getElementById('envelope');
    const openBtn = document.getElementById('openBtn');
    const letterModal = document.getElementById('letterModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const replayBtn = document.getElementById('replayBtn');
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    // --- Particle Engine State (High Performance Optimized) ---
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const particles = [];
    const heartSymbols = ['❤️', '💖', '✨', '🌸', '💕', '⭐'];
    const MAX_AMBIENT_PARTICLES = 20;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Particle {
        constructor(x, y, isBurst = false) {
            this.x = x || Math.random() * width;
            this.y = y || (isBurst ? height / 2 + 50 : height + Math.random() * 50);
            this.symbol = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
            const rawSize = isBurst ? Math.random() * 20 + 14 : Math.random() * 14 + 10;
            this.sizeFont = Math.round(rawSize) + 'px sans-serif';
            this.speedY = isBurst ? (Math.random() - 0.7) * 4 : - (Math.random() * 1.2 + 0.4);
            this.speedX = isBurst ? (Math.random() - 0.5) * 5 : (Math.random() - 0.5) * 1.0;
            this.opacity = 1;
            this.fadeRate = isBurst ? Math.random() * 0.025 + 0.012 : Math.random() * 0.005 + 0.002;
            this.rotation = Math.random() * 360;
            this.rotSpeed = (Math.random() - 0.5) * 1.5;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.opacity -= this.fadeRate;
            this.rotation += this.rotSpeed;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.opacity);
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.font = this.sizeFont;
            ctx.fillText(this.symbol, 0, 0);
            ctx.restore();
        }
    }

    // Populate ambient particles
    for (let i = 0; i < MAX_AMBIENT_PARTICLES; i++) {
        particles.push(new Particle());
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();

            if (particles[i].opacity <= 0) {
                particles.splice(i, 1);
                if (particles.length < MAX_AMBIENT_PARTICLES) {
                    particles.push(new Particle());
                }
            }
        }

        requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // Burst Heart Particles on Interaction
    function createHeartBurst(x, y, count = 25) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, true));
        }
    }

    // Cursor / Touch Heart Trail
    let lastTrailTime = 0;
    window.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastTrailTime > 80) {
            particles.push(new Particle(e.clientX, e.clientY + 10, true));
            lastTrailTime = now;
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            particles.push(new Particle(touch.clientX, touch.clientY + 10, true));
        }
    });

    // --- Web Audio API Synth (Romantic Melody & Chimes) ---
    let audioCtx = null;
    let isPlayingMusic = false;
    let musicInterval = null;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Magical Sound Effect when Opening Letter
    function playChimeSound() {
        try {
            const ctx = getAudioContext();
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
            
            notes.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

                gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
                gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + index * 0.08 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.8);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + index * 0.08);
                osc.stop(ctx.currentTime + index * 0.08 + 0.85);
            });
        } catch (e) {
            console.log('Audio disabled or failed to init', e);
        }
    }

    // Soft Romantic Arpeggio Music Loop
    function toggleBackgroundMusic() {
        const ctx = getAudioContext();

        if (isPlayingMusic) {
            clearInterval(musicInterval);
            isPlayingMusic = false;
            musicToggleBtn.classList.remove('playing');
            musicToggleBtn.querySelector('.music-text').textContent = 'Play Melody';
        } else {
            isPlayingMusic = true;
            musicToggleBtn.classList.add('playing');
            musicToggleBtn.querySelector('.music-text').textContent = 'Pause Melody';

            const chords = [
                [261.63, 329.63, 392.00, 493.88], // Cmaj7
                [220.00, 261.63, 329.63, 392.00], // Am7
                [174.61, 220.00, 261.63, 329.63], // Fmaj7
                [196.00, 246.94, 293.66, 392.00]  // G7
            ];
            
            let step = 0;
            const playStep = () => {
                const currentChord = chords[Math.floor(step / 4) % chords.length];
                const note = currentChord[step % currentChord.length];

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(note * 1.5, ctx.currentTime);

                gain.gain.setValueAtTime(0.001, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 1.25);

                step++;
            };

            playStep();
            musicInterval = setInterval(playStep, 450);
        }
    }

    musicToggleBtn.addEventListener('click', toggleBackgroundMusic);

    // --- Envelope & Modal Opening Logic ---
    let isEnvelopeOpen = false;

    function openEnvelopeSequence(event) {
        if (event) event.stopPropagation();
        if (isEnvelopeOpen) {
            letterModal.classList.add('active');
            return;
        }

        isEnvelopeOpen = true;

        // Sound trigger
        playChimeSound();

        // Particle Burst from Envelope center
        const rect = envelope.getBoundingClientRect();
        createHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 30);

        // Add 3D open class to envelope
        envelope.classList.add('open');

        // Show Modal after envelope letter rises
        setTimeout(() => {
            letterModal.classList.add('active');
            createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 40);
        }, 1100);
    }

    // Attach Click Events to both Envelope and "Open It" Button
    openBtn.addEventListener('click', openEnvelopeSequence);
    envelopeContainer.addEventListener('click', openEnvelopeSequence);

    // Close Modal Button
    closeModalBtn.addEventListener('click', () => {
        letterModal.classList.remove('active');
    });

    // Close Modal on clicking outside card
    letterModal.addEventListener('click', (e) => {
        if (e.target === letterModal) {
            letterModal.classList.remove('active');
        }
    });

    // Replay Button
    replayBtn.addEventListener('click', () => {
        letterModal.classList.remove('active');
        envelope.classList.remove('open');
        isEnvelopeOpen = false;
        
        setTimeout(() => {
            openEnvelopeSequence();
        }, 400);
    });

    // Keyboard support (Escape to close)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && letterModal.classList.contains('active')) {
            letterModal.classList.remove('active');
        }
    });

});


