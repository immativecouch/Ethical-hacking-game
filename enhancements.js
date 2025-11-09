// Enhancement Utilities - Visual Effects, Animations, and More

// Particle Effects System
function createParticles(x, y, color = '#00ff41', count = 20) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            box-shadow: 0 0 10px ${color};
        `;
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / count;
        const velocity = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let px = x;
        let py = y;
        let opacity = 1;
        let size = 4;
        
        const animate = () => {
            px += vx;
            py += vy;
            opacity -= 0.02;
            size -= 0.1;
            
            particle.style.left = px + 'px';
            particle.style.top = py + 'px';
            particle.style.opacity = opacity;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            if (opacity > 0 && size > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Confetti Effect
function createConfetti() {
    const colors = ['#00ff41', '#00d4ff', '#ff0040', '#ffaa00', '#aa00ff'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.cssText = `
            position: fixed;
            left: ${Math.random() * 100}%;
            top: -10px;
            width: ${5 + Math.random() * 5}px;
            height: ${5 + Math.random() * 5}px;
            background: ${color};
            pointer-events: none;
            z-index: 10000;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        `;
        document.body.appendChild(confetti);
        
        const vx = (Math.random() - 0.5) * 2;
        const vy = 2 + Math.random() * 3;
        const rotation = (Math.random() - 0.5) * 10;
        let x = parseFloat(confetti.style.left);
        let y = -10;
        let rot = 0;
        
        const animate = () => {
            x += vx;
            y += vy;
            rot += rotation;
            
            confetti.style.left = x + '%';
            confetti.style.top = y + 'px';
            confetti.style.transform = `rotate(${rot}deg)`;
            
            if (y < window.innerHeight + 20) {
                requestAnimationFrame(animate);
            } else {
                confetti.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Screen Shake Effect
function screenShake(intensity = 10, duration = 500) {
    const body = document.body;
    let shakeCount = 0;
    const maxShakes = duration / 16; // ~60fps
    
    const shake = () => {
        if (shakeCount < maxShakes) {
            const x = (Math.random() - 0.5) * intensity;
            const y = (Math.random() - 0.5) * intensity;
            body.style.transform = `translate(${x}px, ${y}px)`;
            shakeCount++;
            requestAnimationFrame(shake);
        } else {
            body.style.transform = 'translate(0, 0)';
        }
    };
    
    shake();
}

// Typing Animation
function typeText(element, text, speed = 50) {
    if (!element) return;
    element.textContent = '';
    let i = 0;
    
    const type = () => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    };
    
    type();
}

// Progress Bar Animation
function animateProgressBar(barElement, targetPercent, duration = 1000) {
    if (!barElement) return;
    const startPercent = parseFloat(barElement.style.width) || 0;
    const difference = targetPercent - startPercent;
    const startTime = Date.now();
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentPercent = startPercent + (difference * progress);
        
        barElement.style.width = currentPercent + '%';
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.createParticles = createParticles;
    window.createConfetti = createConfetti;
    window.screenShake = screenShake;
    window.typeText = typeText;
    window.animateProgressBar = animateProgressBar;
}

