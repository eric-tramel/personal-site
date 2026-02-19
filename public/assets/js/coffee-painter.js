/**
 * Interactive Felt Tip Marker Drawing
 * Creates a felt tip marker drawing effect on mouse/touch movement
 */

class MarkerDrawer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.strokes = [];

        // Dark navy marker color matching the site theme
        this.markerColor = 'rgba(26, 54, 93, 0.8)'; // #1a365d with opacity
        this.markerWidth = 4;

        this.lastDrawTime = 0;
        this.drawThrottle = 16; // ~60fps for smooth drawing

        this.init();
    }

    init() {
        // Only initialize on home page
        const homePage = document.querySelector('[data-home-page]');
        if (!homePage) return;

        this.createCanvas();
        this.bindEvents();
        this.setPencilCursor();
        this.createRefreshIcon();
        this.drawInitialDoodles();
        this.startFadeLoop();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'marker-drawer';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;

        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Configure canvas for smooth drawing
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalCompositeOperation = 'source-over';

        // Listen for window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Reconfigure context after resize
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalCompositeOperation = 'source-over';
    }

    setPencilCursor() {
        // Create cursor shadow and disable text selection
        const style = document.createElement('style');
        style.textContent = `
            [data-home-page],
            [data-home-page] * {
                cursor: none !important;
                user-select: none !important;
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
            }
            [data-home-page] a,
            [data-home-page] button,
            [data-home-page] .refresh-icon,
            [data-home-page] [onclick] {
                cursor: pointer !important;
                user-select: auto !important;
                -webkit-user-select: auto !important;
                -moz-user-select: auto !important;
                -ms-user-select: auto !important;
            }
        `;
        document.head.appendChild(style);

        // Create cursor shadow element
        this.cursorShadow = document.createElement('div');
        this.cursorShadow.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(26, 54, 93, 0.3) 0%, rgba(26, 54, 93, 0.1) 50%, transparent 100%);
            pointer-events: none;
            z-index: 5;
            transform: translate(-50%, -50%);
            transition: opacity 0.2s ease;
            opacity: 0;
        `;
        document.body.appendChild(this.cursorShadow);

        // Track cursor position for shadow
        document.addEventListener('mousemove', (e) => {
            this.cursorShadow.style.left = e.clientX + 'px';
            this.cursorShadow.style.top = e.clientY + 'px';
            this.cursorShadow.style.opacity = '1';
        });

        // Hide shadow when cursor leaves window
        document.addEventListener('mouseleave', () => {
            this.cursorShadow.style.opacity = '0';
        });
    }

    createRefreshIcon() {
        // Create refresh icon element
        this.refreshIcon = document.createElement('div');
        this.refreshIcon.className = 'refresh-icon';
        this.refreshIcon.title = 'Clear drawing (start fresh)';

        // Inline styles translated from the old site's SASS
        // $sitebackground = #d9d5cd (nord5)
        this.refreshIcon.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            z-index: 10;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 50%;
            background: rgba(217, 213, 205, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(26, 54, 93, 0.2);
        `;

        // Add SVG refresh icon with inline styles
        this.refreshIcon.innerHTML = `
            <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: #1a365d; transition: all 0.3s ease;">
                <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
            </svg>
        `;

        // Add hover/active effects via event listeners
        this.refreshIcon.addEventListener('mouseenter', () => {
            this.refreshIcon.style.transform = 'scale(1.1) rotate(45deg)';
            this.refreshIcon.style.background = 'rgba(217, 213, 205, 1)';
            this.refreshIcon.style.boxShadow = '0 4px 12px rgba(26, 54, 93, 0.3)';
        });
        this.refreshIcon.addEventListener('mouseleave', () => {
            this.refreshIcon.style.transform = '';
            this.refreshIcon.style.background = 'rgba(217, 213, 205, 0.9)';
            this.refreshIcon.style.boxShadow = '0 2px 8px rgba(26, 54, 93, 0.2)';
        });
        this.refreshIcon.addEventListener('mousedown', () => {
            this.refreshIcon.style.transform = 'scale(0.95) rotate(180deg)';
        });
        this.refreshIcon.addEventListener('mouseup', () => {
            this.refreshIcon.style.transform = 'scale(1.1) rotate(45deg)';
        });

        // Add click handler to clear canvas
        this.refreshIcon.addEventListener('click', () => this.clearDrawing());

        document.body.appendChild(this.refreshIcon);
    }

    clearDrawing() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Clear stored strokes
        this.strokes = [];

        // Add a satisfying rotation animation
        this.refreshIcon.style.transform = 'scale(0.9) rotate(360deg)';
        setTimeout(() => {
            this.refreshIcon.style.transform = '';
        }, 300);
    }

    bindEvents() {
        // Mouse events
        document.addEventListener('mousemove', (e) => this.handleMove(e.clientX, e.clientY));
        document.addEventListener('mousedown', (e) => this.startDrawing(e.clientX, e.clientY));
        document.addEventListener('mouseup', () => this.stopDrawing());

        // Touch events for mobile
        document.addEventListener('touchstart', (e) => {
            // Let interactive elements handle their own taps normally
            if (this._isInteractiveTarget(e.target)) return;
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrawing(touch.clientX, touch.clientY);
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            // Only block scrolling while actively drawing
            if (this.isDrawing) {
                e.preventDefault();
            }
            const touch = e.touches[0];
            this.handleMove(touch.clientX, touch.clientY);
        }, { passive: false });

        document.addEventListener('touchend', () => this.stopDrawing());
    }

    /**
     * Check if a touch target (or any of its ancestors) is an interactive element
     * that should receive normal browser tap handling.
     */
    _isInteractiveTarget(el) {
        while (el && el !== document.body) {
            if (el.tagName === 'A' || el.tagName === 'BUTTON') return true;
            if (el.classList && el.classList.contains('refresh-icon')) return true;
            if (el.hasAttribute && el.hasAttribute('onclick')) return true;
            el = el.parentElement;
        }
        return false;
    }

    startDrawing(x, y) {
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;

        // Start a new stroke
        this.currentStroke = {
            points: [{x, y, timestamp: Date.now()}],
            timestamp: Date.now()
        };
        this.strokes.push(this.currentStroke);
    }

    stopDrawing() {
        this.isDrawing = false;
        this.currentStroke = null;
    }

    handleMove(x, y) {
        if (this.isDrawing) {
            this.drawMarkerLine(this.lastX, this.lastY, x, y);

            // Add to current stroke for fading
            if (this.currentStroke) {
                this.currentStroke.points.push({x, y, timestamp: Date.now()});
            }

            this.lastX = x;
            this.lastY = y;
        }
    }

    drawMarkerLine(x1, y1, x2, y2) {
        const ctx = this.ctx;

        // Felt tip marker effect with variable width and opacity
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const steps = Math.max(1, Math.floor(distance / 2));

        for (let i = 0; i <= steps; i++) {
            const ratio = i / steps;
            const x = x1 + (x2 - x1) * ratio;
            const y = y1 + (y2 - y1) * ratio;

            // Variable width for organic felt tip feel
            const width = this.markerWidth + Math.random() * 2;
            const opacity = 0.6 + Math.random() * 0.3;

            ctx.globalAlpha = opacity;
            ctx.fillStyle = this.markerColor;
            ctx.beginPath();
            ctx.arc(x, y, width / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }


    drawInitialDoodles() {
        // Wait for canvas to be ready
        setTimeout(() => {
            const width = this.canvas.width;
            const height = this.canvas.height;

            // Left side doodles
            this.drawHandDrawnStar(width * 0.1, height * 0.3, 1.5);
            this.drawHandDrawnRocket(width * 0.05, height * 0.6, 1.5);
            this.drawStickFigure(width * 0.08, height * 0.8);

            // Right side doodles
            this.drawHandDrawnStar(width * 0.9, height * 0.25, 1.5);
            this.drawSmileyFace(width * 0.85, height * 0.5);
            this.drawHandDrawnRocket(width * 0.92, height * 0.75, 1.5);

            // Top corners
            this.drawHandDrawnStar(width * 0.15, height * 0.15, 1.2);
            this.drawStickFigure(width * 0.85, height * 0.12);
        }, 100);
    }

    drawHandDrawnStar(x, y, scale = 1) {
        const s = scale;
        const points = [
            [x, y - 15*s], [x + 4*s, y - 4*s], [x + 15*s, y - 4*s], [x + 6*s, y + 2*s],
            [x + 9*s, y + 13*s], [x, y + 7*s], [x - 9*s, y + 13*s], [x - 6*s, y + 2*s],
            [x - 15*s, y - 4*s], [x - 4*s, y - 4*s], [x, y - 15*s]
        ];

        this.drawPath(points);
    }

    drawHandDrawnRocket(x, y, scale = 1) {
        const s = scale;
        // Rocket body
        this.drawPath([[x - 4*s, y + 10*s], [x - 4*s, y - 10*s], [x + 4*s, y - 10*s], [x + 4*s, y + 10*s], [x - 4*s, y + 10*s]]);

        // Rocket tip
        this.drawPath([[x - 4*s, y - 10*s], [x, y - 20*s], [x + 4*s, y - 10*s]]);

        // Left fin
        this.drawPath([[x - 4*s, y + 5*s], [x - 10*s, y + 15*s], [x - 4*s, y + 10*s]]);

        // Right fin
        this.drawPath([[x + 4*s, y + 5*s], [x + 10*s, y + 15*s], [x + 4*s, y + 10*s]]);

        // Flame
        this.drawPath([[x - 2*s, y + 10*s], [x - 3*s, y + 18*s], [x, y + 22*s], [x + 3*s, y + 18*s], [x + 2*s, y + 10*s]]);
    }

    drawStickFigure(x, y) {
        // Head (circle)
        this.drawCircle(x, y - 20, 8);

        // Body (line)
        this.drawPath([[x, y - 12], [x, y + 15]]);

        // Arms
        this.drawPath([[x - 12, y - 5], [x, y], [x + 12, y - 5]]);

        // Legs
        this.drawPath([[x, y + 15], [x - 10, y + 30]]);
        this.drawPath([[x, y + 15], [x + 10, y + 30]]);
    }

    drawSmileyFace(x, y) {
        // Face (circle)
        this.drawCircle(x, y, 20);

        // Eyes
        this.drawCircle(x - 7, y - 5, 2);
        this.drawCircle(x + 7, y - 5, 2);

        // Smile (arc)
        const smilePoints = [];
        for (let i = 0; i <= 10; i++) {
            const angle = Math.PI * 0.2 + (i / 10) * Math.PI * 0.6;
            const px = x + Math.cos(angle) * 12;
            const py = y + Math.sin(angle) * 8;
            smilePoints.push([px, py]);
        }
        this.drawPath(smilePoints);
    }

    drawCircle(x, y, radius) {
        const points = [];
        for (let i = 0; i <= 16; i++) {
            const angle = (i * 2 * Math.PI) / 16;
            points.push([x + Math.cos(angle) * radius, y + Math.sin(angle) * radius]);
        }
        this.drawPath(points);
    }

    drawPath(points) {
        if (points.length < 2) return;

        for (let i = 1; i < points.length; i++) {
            this.drawMarkerLine(points[i-1][0], points[i-1][1], points[i][0], points[i][1]);
        }
    }

    startFadeLoop() {
        const fadeLoop = () => {
            const now = Date.now();

            // Very gentle opacity fade - preserves color but slowly reduces opacity
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.002)'; // Extremely subtle fade
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();

            // Remove very old strokes to prevent memory buildup
            this.strokes = this.strokes.filter(stroke => {
                const age = now - stroke.timestamp;
                return age < 60000; // Keep strokes for 60 seconds
            });

            requestAnimationFrame(fadeLoop);
        };

        fadeLoop();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MarkerDrawer());
} else {
    new MarkerDrawer();
}
