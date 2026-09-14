/* ==========================================
   ROMANTIC SECRET PASSCODE GATE JS (DEFAULT CODE: 1234)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');
    const passcodeInput = document.getElementById('passcodeInput');
    const passcodeWrapper = document.getElementById('passcodeWrapper');
    const unlockBtn = document.getElementById('unlockBtn');
    const loginFeedback = document.getElementById('loginFeedback');
    const togglePasscodeVisibility = document.getElementById('togglePasscodeVisibility');
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    const SECRET_CODE = '1234'; // Configurable 4-digit passcode
    let isSubmitting = false;

    // Auto focus on input when page opens
    if (passcodeInput) {
        setTimeout(() => passcodeInput.focus(), 300);
    }

    // --- Particle Engine (High Performance Optimized) ---
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const particles = [];
    const heartSymbols = ['❤️', '💖', '✨', '🌸', '💕', '⭐', '🔒', '🗝️'];
    const MAX_AMBIENT_PARTICLES = 20;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Particle {
        constructor(x, y, isBurst = false) {
            this.x = x || Math.random() * width;
            this.y = y || (isBurst ? height / 2 + 30 : height + Math.random() * 50);
            this.symbol = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
            const rawSize = isBurst ? Math.random() * 22 + 14 : Math.random() * 14 + 10;
            this.sizeFont = Math.round(rawSize) + 'px sans-serif';
            this.speedY = isBurst ? (Math.random() - 0.7) * 5 : - (Math.random() * 1.2 + 0.4);
            this.speedX = isBurst ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 1.0;
            this.opacity = 1;
            this.fadeRate = isBurst ? Math.random() * 0.025 + 0.012 : Math.random() * 0.005 + 0.002;
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

    function triggerHeartBurst(x, y, count = 55) {
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

    function playSuccessChime() {
        try {
            const ctx = getAudioContext();
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];

            notes.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

                gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
                gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + index * 0.08 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.7);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + index * 0.08);
                osc.stop(ctx.currentTime + index * 0.08 + 0.75);
            });
        } catch (e) {
            console.log('Audio error:', e);
        }
    }

    function playErrorBuzz() {
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.28);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }

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
                [261.63, 329.63, 392.00, 493.88],
                [220.00, 261.63, 329.63, 392.00],
                [174.61, 220.00, 261.63, 329.63],
                [196.00, 246.94, 293.66, 392.00]
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

    // Toggle Passcode Visibility (👁️ / 🙈)
    if (togglePasscodeVisibility && passcodeInput) {
        togglePasscodeVisibility.addEventListener('click', () => {
            if (passcodeInput.type === 'password') {
                passcodeInput.type = 'text';
                togglePasscodeVisibility.textContent = '🙈';
            } else {
                passcodeInput.type = 'password';
                togglePasscodeVisibility.textContent = '👁️';
            }
        });
    }

    // --- SECRET CODE VALIDATION LOGIC ---
    function checkPasscode() {
        if (isSubmitting) return;
        const enteredCode = passcodeInput.value.trim();

        if (enteredCode === '') {
            passcodeInput.focus();
            return;
        }

        if (enteredCode === SECRET_CODE) {
            isSubmitting = true;
            playSuccessChime();
            triggerHeartBurst(width / 2, height / 2, 60);

            passcodeInput.classList.remove('error-border');
            passcodeInput.classList.add('success-border');

            if (loginFeedback) {
                loginFeedback.innerHTML = '<span class="success-text">Correct Code! Unlocking with love... 💕✨</span>';
            }

            try {
                sessionStorage.setItem('birthday_unlocked', 'true');
            } catch (e) { }

            setTimeout(() => {
                window.location.href = 'main.html';
            }, 750);

        } else {
            playErrorBuzz();

            // Add shake animation and error border
            if (passcodeWrapper) {
                passcodeWrapper.classList.remove('shake-error');
                void passcodeWrapper.offsetWidth; // Trigger reflow for re-animation
                passcodeWrapper.classList.add('shake-error');
            }

            passcodeInput.classList.add('error-border');

            if (loginFeedback) {
                loginFeedback.innerHTML = '<span class="error-text">Oopsie! Wrong code 🙈 Try again with love! 💕</span>';
            }

            setTimeout(() => {
                passcodeInput.value = '';
                passcodeInput.classList.remove('error-border');
                if (passcodeWrapper) {
                    passcodeWrapper.classList.remove('shake-error');
                }
                passcodeInput.focus();
            }, 1000);
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            checkPasscode();
        });
    }

    // Auto submit when 4 digits entered
    if (passcodeInput) {
        passcodeInput.addEventListener('input', () => {
            if (passcodeInput.value.length === 4) {
                checkPasscode();
            }
        });
    }

});
