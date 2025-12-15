export const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Since we can't use canvas-confetti, we'll create simple DOM elements
        // Actually, let's create a simpler "DOM Confetti" fallback
        createConfettiParticle();
        createConfettiParticle();
        createConfettiParticle();
    }, 100);
};

function createConfettiParticle() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.width = '10px';
    div.style.height = '10px';
    div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    div.style.left = Math.random() * 100 + 'vw';
    div.style.top = '-10px';
    div.style.zIndex = '9999';
    div.style.pointerEvents = 'none';
    div.style.transition = 'top 3s ease-in, transform 3s linear';

    document.body.appendChild(div);

    // Animate
    requestAnimationFrame(() => {
        div.style.top = '110vh';
        div.style.transform = `rotate(${Math.random() * 360}deg)`;
    });

    // Cleanup
    setTimeout(() => {
        div.remove();
    }, 3000);
}

export const triggerPop = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
        el.classList.remove('pop-anim');
        void el.offsetWidth; // trigger reflow
        el.classList.add('pop-anim');
    }
};

export const triggerShake = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
        el.classList.remove('shake-anim');
        void el.offsetWidth; // trigger reflow
        el.classList.add('shake-anim');
    }
};
