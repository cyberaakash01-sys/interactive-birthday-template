/* ==========================================
   CHAPTER 2 INTERACTIVE JS FOR SPECIAL BIRTHDAY TEMPLATE
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    // Section Cards
    const cardSurprise = document.getElementById('cardSurprise');
    const cardMessage = document.getElementById('cardMessage');
    const cardMore = document.getElementById('cardMore');

    // Modal Overlays
    const modalSurpriseOverlay = document.getElementById('modalSurpriseOverlay');
    const modalMessageOverlay = document.getElementById('modalMessageOverlay');
    const modalMoreOverlay = document.getElementById('modalMoreOverlay');

    // Close Buttons
    const closeSurpriseBtn = document.getElementById('closeSurpriseBtn');
    const closeMessageBtn = document.getElementById('closeMessageBtn');
    const closeMoreBtn = document.getElementById('closeMoreBtn');

    // --- Particle Engine (High Performance Optimized) ---
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const particles = [];
    const heartSymbols = ['❤️', '💖', '✨', '🌸', '💕', '⭐', '🎁', '💌'];
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

    function createHeartBurst(x, y, count = 25) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, true));
        }
    }

    // --- Web Audio API Synth ---
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

    function playChimeSound() {
        try {
            const ctx = getAudioContext();
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];

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

    // --- Modal Handlers & Chapter 3 Unlock Tracking ---
    const nextBtnChapter2 = document.getElementById('nextBtnChapter2');
    const unlockCounter = document.getElementById('unlockCounter');
    const openedCards = new Set();

    function trackCardUnlock(cardKey, element) {
        if (!openedCards.has(cardKey)) {
            openedCards.add(cardKey);
            if (element) {
                element.classList.add('unlocked');
            }

            if (unlockCounter) {
                if (openedCards.size < 3) {
                    unlockCounter.textContent = `Explore all 3 boxes to unlock Chapter 3 (${openedCards.size}/3 unlocked) ✨`;
                } else {
                    unlockCounter.textContent = `🎉 All 3 unlocked! Continue to Chapter 3 below 🎂 ✨`;
                    unlockCounter.classList.add('completed');
                }
            }

            // Reveal Chapter 3 button ONLY AFTER all 3 cards clicked at least once!
            if (openedCards.size === 3 && nextBtnChapter2) {
                setTimeout(() => {
                    nextBtnChapter2.classList.add('fade-in');
                    createHeartBurst(window.innerWidth / 2, window.innerHeight - 80, 45);
                }, 400);
            }
        }
    }

    function openModal(overlay, element, cardKey) {
        if (!overlay) return;
        playChimeSound();
        const rect = element ? element.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
        createHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);
        overlay.classList.add('active');

        if (cardKey) {
            trackCardUnlock(cardKey, element);
        }
    }

    function closeModal(overlay) {
        if (!overlay) return;
        overlay.classList.remove('active');
    }

    // Card Event Listeners
    if (cardSurprise) {
        cardSurprise.addEventListener('click', () => openModal(modalSurpriseOverlay, cardSurprise, 'surprise'));
    }
    if (cardMessage) {
        cardMessage.addEventListener('click', () => openModal(modalMessageOverlay, cardMessage, 'message'));
    }
    if (cardMore) {
        cardMore.addEventListener('click', () => openModal(modalMoreOverlay, cardMore, 'more'));
    }

    // Close Button Listeners
    const closeButtons = [
        { btn: closeSurpriseBtn, modal: modalSurpriseOverlay },
        { btn: closeMessageBtn, modal: modalMessageOverlay },
        { btn: closeMoreBtn, modal: modalMoreOverlay }
    ];

    closeButtons.forEach(({ btn, modal }) => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal(modal);
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal(modal);
            });
        }
    });

    // Fallback: Global close modal listener for any .close-modal-btn
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const parentModal = btn.closest('.letter-modal-overlay');
            if (parentModal) {
                closeModal(parentModal);
            }
        });
    });

    // Overlay Background Click to Close
    [modalSurpriseOverlay, modalMessageOverlay, modalMoreOverlay].forEach(overlay => {
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeModal(overlay);
                }
            });
        }
    });

});
