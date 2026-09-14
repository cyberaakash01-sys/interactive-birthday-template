/* ==========================================
   CHAPTER 3 INTERACTIVE JS FOR SPECIAL BIRTHDAY TEMPLATE
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    // Cake & Revelation Elements
    const cakeOverlay = document.getElementById('cakeOverlay');
    const candleFlameArea = document.getElementById('candleFlameArea');
    const candleFlame = document.getElementById('candleFlame');
    const revelationScreen = document.getElementById('revelationScreen');
    const replayCandleBtn = document.getElementById('replayCandleBtn');

    let isCandleBlown = false;

    // --- Particle Engine (High Performance Optimized) ---
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const particles = [];
    const romanticSymbols = ['❤️', '💖', '✨', '🌸', '💕', '⭐', '🎂', '🎉', '💐'];
    const MAX_AMBIENT_PARTICLES = 20;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Particle {
        constructor(x, y, isBurst = false) {
            this.x = x || Math.random() * width;
            this.y = y || (isBurst ? height / 2 : height + Math.random() * 50);
            this.symbol = romanticSymbols[Math.floor(Math.random() * romanticSymbols.length)];
            const rawSize = isBurst ? Math.random() * 22 + 14 : Math.random() * 14 + 10;
            this.sizeFont = Math.round(rawSize) + 'px sans-serif';
            this.speedY = isBurst ? (Math.random() - 0.7) * 5 : - (Math.random() * 1.2 + 0.4);
            this.speedX = isBurst ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 1.0;
            this.opacity = 1;
            this.fadeRate = isBurst ? Math.random() * 0.022 + 0.01 : Math.random() * 0.005 + 0.002;
            this.rotation = Math.random() * 360;
            this.rotSpeed = (Math.random() - 0.5) * 2;
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

    function triggerConfettiBurst(x, y, count = 70) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, true));
        }
    }

    // --- Web Audio API Synthesizer ---
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

    // Gentle Wind / Blowing Sound Effect
    function playWindBlowSound() {
        try {
            const ctx = getAudioContext();
            const bufferSize = ctx.sampleRate * 0.8;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(400, ctx.currentTime);
            filter.Q.setValueAtTime(3.0, ctx.currentTime);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.75);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start();
            noise.stop(ctx.currentTime + 0.8);
        } catch (e) {
            console.log('Audio blow error:', e);
        }
    }

    // Celebratory Chime Melody Sound
    function playVictoryChime() {
        try {
            const ctx = getAudioContext();
            // Happy Birthday melody notes snippet
            const notes = [523.25, 523.25, 587.33, 523.25, 698.46, 659.25, 783.99, 1046.50];

            notes.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);

                gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.12);
                gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + index * 0.12 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.7);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + index * 0.12);
                osc.stop(ctx.currentTime + index * 0.12 + 0.75);
            });
        } catch (e) {
            console.log('Chime error:', e);
        }
    }

    // Background Romantic Music Loop
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

    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', toggleBackgroundMusic);
    }

    // Create Rising Smoke Effect
    function createSmokeEffect(parentEl) {
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const smoke = document.createElement('div');
                smoke.className = 'smoke-trail';
                smoke.style.left = `${(Math.random() - 0.5) * 10}px`;
                parentEl.appendChild(smoke);
                setTimeout(() => smoke.remove(), 1600);
            }, i * 150);
        }
    }

    // --- CANDLE BLOW HANDLER ---
    function blowOutCandle() {
        if (isCandleBlown) return;
        isCandleBlown = true;

        // 1. Play blowing audio & victory chime
        playWindBlowSound();
        setTimeout(playVictoryChime, 300);

        // 2. Extinguish flame animation
        if (candleFlame) {
            candleFlame.classList.add('blown-out');
        }

        // 3. Spawn wisps of smoke
        if (candleFlameArea) {
            createSmokeEffect(candleFlameArea);
        }

        // 4. Trigger massive full screen particle celebration burst
        const flameRect = candleFlameArea ? candleFlameArea.getBoundingClientRect() : { left: width / 2, top: height / 2 };
        triggerConfettiBurst(flameRect.left, flameRect.top, 85);

        // Auto-enable melody if not playing
        if (!isPlayingMusic && musicToggleBtn) {
            setTimeout(toggleBackgroundMusic, 600);
        }

        // 5. Fade out Cake overlay & show Fullscreen Revelation
        setTimeout(() => {
            if (cakeOverlay) {
                cakeOverlay.classList.add('fade-out');
            }

            setTimeout(() => {
                if (revelationScreen) {
                    revelationScreen.classList.add('active');
                    triggerConfettiBurst(width / 2, height / 3, 60);
                }
            }, 500);

        }, 700);
    }

    // Event listeners on Click Me fire area
    if (candleFlameArea) {
        candleFlameArea.addEventListener('click', blowOutCandle);
        candleFlameArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                blowOutCandle();
            }
        });
    }

    // Replay Candle Blow Handler
    if (replayCandleBtn) {
        replayCandleBtn.addEventListener('click', () => {
            isCandleBlown = false;

            // Hide revelation screen
            if (revelationScreen) {
                revelationScreen.classList.remove('active');
            }

            // Restore flame & cake overlay
            if (candleFlame) {
                candleFlame.classList.remove('blown-out');
            }

            if (cakeOverlay) {
                cakeOverlay.classList.remove('fade-out');
            }

            triggerConfettiBurst(width / 2, height / 2, 40);
        });
    }

});
