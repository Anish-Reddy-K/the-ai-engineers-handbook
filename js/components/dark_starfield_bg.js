(function() {
    'use strict';

    const CONFIG = {
        bgColor: '#03060A',
        starsPer1000px: 150,
        starSizeMin: 0.3,
        starSizeMax: 1.5,
        starGlowRadius: 3,
        starColorVariance: 0.25,
        twinkleSpeed: 0.1,
        twinkleAmount: 0.3,
        shootingStarSpawnInterval: { min: 5000, max: 10000 },
        maxShootingStars: 1,
        shootingStarSpeed: { min: 3, max: 6 },
        trailLength: 80,
        headGlowRadius: 6,
        trailGlowRadius: 3,
        headAlpha: 0.9,
        trailAlpha: 0.7
    };

    const STAR_SEED = 12345;
    let canvas, ctx, width, height, stars = [];
    let shootingStars = [], lastShootingStarSpawn = Date.now();
    let seededRandomState = STAR_SEED;
    let lastTime = performance.now();

    function seededRandom() {
        seededRandomState = (seededRandomState * 1103515245 + 12345) & 0x7fffffff;
        const result = seededRandomState / 0x7fffffff;
        if (isNaN(result) || result < 0 || result > 1) {
            seededRandomState = ((seededRandomState * 9301 + 49297) % 233280);
            return seededRandomState / 233280;
        }
        return result;
    }

    function resetSeededRandom() {
        seededRandomState = STAR_SEED;
    }

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        if (width <= 0 || height <= 0) {
            width = Math.max(1, width);
            height = Math.max(1, height);
        }
        canvas.width = width;
        canvas.height = height;
        if (width > 0 && height > 0) {
            generateStars();
        }
    }

    function generateIrregularStarPoints() {
        const pointCount = 3 + Math.floor(seededRandom() * 6);
        const points = [];
        for (let i = 0; i < pointCount; i++) {
            const angle = (i / pointCount) * Math.PI * 2;
            const radius = 1 + (seededRandom() - 0.5) * 0.8;
            points.push({
                angle: angle + (seededRandom() - 0.5) * 0.6,
                radius: Math.max(0.3, radius)
            });
        }
        return points;
    }

    function generateStars() {
        resetSeededRandom();
        const viewportArea = width * height;
        let starCount = Math.floor((viewportArea / 1000000) * CONFIG.starsPer1000px);
        if (starCount < 100) starCount = 100;
        
        stars = [];
        for (let i = 0; i < starCount; i++) {
            const sizeRandom = Math.pow(seededRandom(), 1.5);
            const size = CONFIG.starSizeMin + sizeRandom * (CONFIG.starSizeMax - CONFIG.starSizeMin);
            const temperature = (size - CONFIG.starSizeMin) / (CONFIG.starSizeMax - CONFIG.starSizeMin);
            
            stars.push({
                x: seededRandom() * width,
                y: seededRandom() * height,
                size: size,
                colorOffset: (seededRandom() - 0.5) * CONFIG.starColorVariance,
                temperature: temperature,
                rotation: seededRandom() * Math.PI * 2,
                twinklePhase: seededRandom() * Math.PI * 2,
                points: generateIrregularStarPoints()
            });
        }
    }

    function drawStar(star, currentTime) {
        const { x, y, size, colorOffset, rotation, points, temperature, twinklePhase } = star;
        
        const twinkle = Math.sin(currentTime * CONFIG.twinkleSpeed + twinklePhase) * CONFIG.twinkleAmount;
        const twinkleAlpha = 1 + twinkle;
        
        const tempR = 255;
        const tempG = 255 - temperature * 20;
        const tempB = 255 - temperature * 40;
        
        const r = Math.max(0, Math.min(255, tempR + colorOffset * 255));
        const g = Math.max(0, Math.min(255, tempG + colorOffset * 255));
        const b = Math.max(0, Math.min(255, tempB + colorOffset * 255));
        
        const baseAlpha = 0.8 + size * 0.2;
        const alpha = Math.max(0.3, Math.min(1, baseAlpha * twinkleAlpha));
        const color = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        if (CONFIG.starGlowRadius > 0) {
            const glowSize = size * CONFIG.starGlowRadius;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
            gradient.addColorStop(0, `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`);
            gradient.addColorStop(0.3, `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha * 0.6})`);
            gradient.addColorStop(0.6, `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha * 0.3})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const px = Math.cos(point.angle) * point.radius * size;
            const py = Math.sin(point.angle) * point.radius * size;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function spawnShootingStar() {
        if (shootingStars.length >= CONFIG.maxShootingStars) return;
        
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        const angle = Math.random() * Math.PI * 2;
        const speed = CONFIG.shootingStarSpeed.min + 
                     Math.random() * (CONFIG.shootingStarSpeed.max - CONFIG.shootingStarSpeed.min);
        
        shootingStars.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            trail: [{ x: startX, y: startY }]
        });
    }

    function updateShootingStars(deltaTime) {
        const now = Date.now();
        const interval = CONFIG.shootingStarSpawnInterval.min + 
                       Math.random() * (CONFIG.shootingStarSpawnInterval.max - CONFIG.shootingStarSpawnInterval.min);
        
        if (now - lastShootingStarSpawn > interval) {
            spawnShootingStar();
            lastShootingStarSpawn = now;
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const star = shootingStars[i];
            star.x += star.vx * deltaTime;
            star.y += star.vy * deltaTime;
            star.trail.push({ x: star.x, y: star.y });
            if (star.trail.length > CONFIG.trailLength) {
                star.trail.shift();
            }
            
            const margin = 50;
            if (star.x < -margin || star.x > width + margin ||
                star.y < -margin || star.y > height + margin) {
                shootingStars.splice(i, 1);
            }
        }
    }

    function drawShootingStar(star) {
        const { x, y, trail } = star;
        if (trail.length < 2) return;
        
        ctx.save();
        
        for (let i = 0; i < trail.length - 1; i++) {
            const segmentStart = trail[i];
            const segmentEnd = trail[i + 1];
            const tailPos = i / (trail.length - 1);
            const headPos = (i + 1) / (trail.length - 1);
            
            const tailAlpha = CONFIG.trailAlpha * Math.pow(tailPos, 0.8);
            const headAlpha = CONFIG.trailAlpha * Math.pow(headPos, 0.8);
            const segmentGlowRadius = CONFIG.trailGlowRadius * headPos;
            
            const gradient = ctx.createLinearGradient(
                segmentStart.x, segmentStart.y,
                segmentEnd.x, segmentEnd.y
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${tailAlpha})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, ${headAlpha})`);
            
            ctx.globalAlpha = 1;
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2 * headPos;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(segmentStart.x, segmentStart.y);
            ctx.lineTo(segmentEnd.x, segmentEnd.y);
            ctx.stroke();
            
            if (segmentGlowRadius > 0) {
                const glowGradient = ctx.createRadialGradient(
                    segmentEnd.x, segmentEnd.y, 0,
                    segmentEnd.x, segmentEnd.y, segmentGlowRadius
                );
                glowGradient.addColorStop(0, `rgba(255, 255, 255, ${headAlpha * 0.5})`);
                glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(segmentEnd.x, segmentEnd.y, segmentGlowRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        const headGradient = ctx.createRadialGradient(x, y, 0, x, y, CONFIG.headGlowRadius);
        headGradient.addColorStop(0, `rgba(255, 255, 255, ${CONFIG.headAlpha})`);
        headGradient.addColorStop(0.5, `rgba(255, 255, 255, ${CONFIG.headAlpha * 0.5})`);
        headGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.globalAlpha = 1;
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.arc(x, y, CONFIG.headGlowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(255, 255, 255, ${CONFIG.headAlpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    function animate(currentTime) {
        const deltaTime = (currentTime - lastTime) / 16.67;
        lastTime = currentTime;
        
        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, 0, width, height);
        
        for (const star of stars) {
            drawStar(star, currentTime);
        }
        
        updateShootingStars(deltaTime);
        for (const star of shootingStars) {
            drawShootingStar(star);
        }
        
        requestAnimationFrame(animate);
    }

    function init(canvasId = 'starfield-canvas') {
        canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element with id "${canvasId}" not found`);
            return;
        }
        ctx = canvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        requestAnimationFrame(animate);
    }

    window.darkStarfieldBg = {
        init: init
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const existingCanvas = document.getElementById('starfield-canvas');
            if (existingCanvas) {
                init();
            }
        });
    } else {
        const existingCanvas = document.getElementById('starfield-canvas');
        if (existingCanvas) {
            init();
        }
    }
})();
