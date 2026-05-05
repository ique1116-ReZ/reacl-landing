document.addEventListener('DOMContentLoaded', () => {
    // Initial hero load animation
    setTimeout(() => {
        document.querySelector('.hero-bg img').style.transform = 'scale(1)';
        document.querySelector('.hero-content').classList.add('visible');
    }, 100);

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
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

    // Toggle Play/Pause on Click
    audioControl.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            audioControl.classList.add('disabled');
            centerIcon.className = 'icon play-icon';
        } else {
            bgMusic.play().catch(e => console.log('Autoplay blocked:', e));
            audioControl.classList.remove('disabled');
            centerIcon.className = 'icon stop-icon';
        }
        isPlaying = !isPlaying;
    });

    // Attempt Autoplay on Load
    // Browsers often block autoplay without user interaction, but we try gently.
    bgMusic.volume = 0.4;
    const playPromise = bgMusic.play();
    
    const startAudioOnInteraction = () => {
        if (!isPlaying) {
            bgMusic.play().then(() => {
                isPlaying = true;
                audioControl.classList.remove('disabled');
                centerIcon.className = 'icon stop-icon';
                // Remove listeners after success
                document.removeEventListener('click', startAudioOnInteraction);
                document.removeEventListener('touchstart', startAudioOnInteraction);
            }).catch(e => console.log('Still blocked:', e));
        }
    };

    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Autoplay started successfully
            isPlaying = true;
            audioControl.classList.remove('disabled');
            centerIcon.className = 'icon stop-icon';
        }).catch(() => {
            // Autoplay blocked, wait for first user interaction
            isPlaying = false;
            document.addEventListener('click', startAudioOnInteraction);
            document.addEventListener('touchstart', startAudioOnInteraction);
        });
    }
});
