document.addEventListener('DOMContentLoaded', () => {
    // Initial hero load animation
    setTimeout(() => {
        document.querySelector('.hero-bg img').style.transform = 'scale(1)';
        document.querySelector('.hero-content').classList.add('visible');
    }, 100);

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px', // Trigger slightly before the element enters the bottom of the viewport
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // We don't unobserve here so it stays animated or we let it trigger repeatedly
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up, .scale-up');
    animatedElements.forEach(el => observer.observe(el));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // -----------------------------------------
    // Audio Visualizer Generation and Control
    // -----------------------------------------
    const audioControl = document.getElementById('audio-control');
    const centerIcon = audioControl.querySelector('.icon');
    const bgMusic = document.getElementById('bg-music');
    const barsContainer = audioControl.querySelector('.bars');
    
    // Generate circular equalizer bars
    const numBars = 50; // Density of bars around the circle
    for (let i = 0; i < numBars; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        const angle = (i * 360) / numBars;
        // Translate Y to position bars on the outer edge
        bar.style.transform = `rotate(${angle}deg) translateY(-45px)`;
        bar.style.animationDelay = `${Math.random() * 0.5}s`;
        bar.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
        barsContainer.appendChild(bar);
    }

    let isPlaying = false;

    const updateAudioControl = (playing) => {
        isPlaying = playing;
        audioControl.classList.toggle('disabled', !playing);
        centerIcon.className = playing ? 'icon stop-icon' : 'icon play-icon';
        audioControl.setAttribute('aria-pressed', String(playing));
        audioControl.setAttribute('aria-label', playing ? '暂停背景音乐' : '播放背景音乐');
    };

    const playMusic = async () => {
        try {
            await bgMusic.play();
            updateAudioControl(true);
            return true;
        } catch {
            updateAudioControl(false);
            return false;
        }
    };

    const toggleMusic = async () => {
        if (isPlaying) {
            bgMusic.pause();
        } else {
            if (await playMusic()) {
                removeUnlockListeners();
            }
        }
    };

    audioControl.addEventListener('click', toggleMusic);
    audioControl.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleMusic();
        }
    });

    bgMusic.addEventListener('play', () => updateAudioControl(true));
    bgMusic.addEventListener('pause', () => updateAudioControl(false));

    // Attempt autoplay immediately. If the browser blocks audible autoplay,
    // start on the visitor's first interaction instead.
    bgMusic.volume = 0.4;
    const unlockEvents = ['pointerdown', 'keydown'];

    const removeUnlockListeners = () => {
        unlockEvents.forEach((eventName) => {
            document.removeEventListener(eventName, startAudioOnInteraction);
        });
    };

    const startAudioOnInteraction = async (event) => {
        // Let the dedicated control handler own interactions on the music button.
        if (audioControl.contains(event.target)) {
            return;
        }

        if (isPlaying) {
            removeUnlockListeners();
            return;
        }

        if (await playMusic()) {
            removeUnlockListeners();
        }
    };

    playMusic().then((started) => {
        if (!started) {
            unlockEvents.forEach((eventName) => {
                document.addEventListener(eventName, startAudioOnInteraction);
            });
        } else {
            removeUnlockListeners();
        }
    });
});
