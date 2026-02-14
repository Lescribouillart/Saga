// Animation du curseur lui-même au clic
class CursorWiggleAnimation {
    constructor() {
        this.customCursor = null;
        this.isAnimating = false;
        this.init();
    }

    init() {
        this.createCustomCursor();
        this.addClickEvents();
    }

    createCustomCursor() {
        // Créer un curseur personnalisé invisible par défaut
        this.customCursor = document.createElement('div');
        this.customCursor.style.cssText = `
            position: fixed;
            width: 32px;
            height: 32px;
            background-image: url("../images/pointeur.png");
            background-size: contain;
            background-repeat: no-repeat;
            pointer-events: none;
            z-index: 10000;
            display: none;
            transform-origin: 16px 16px;
        `;
        document.body.appendChild(this.customCursor);
    }

    addClickEvents() {
        // Zone du tableau
        const frameArea = document.querySelector('.frame-hover-area');
        if (frameArea) {
            frameArea.addEventListener('mousedown', (e) => {
                this.animateCursorAtClick(e);
            });
        }

        // Zone de la pierre
        const stoneArea = document.querySelector('.stone-block-link');
        if (stoneArea) {
            stoneArea.addEventListener('mousedown', (e) => {
                this.animateCursorAtClick(e);
            });
        }
    }

    animateCursorAtClick(event) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Positionner le curseur custom à la position du clic
        const x = event.clientX;
        const y = event.clientY;
        
        this.customCursor.style.left = (x - 16) + 'px';
        this.customCursor.style.top = (y - 16) + 'px';
        this.customCursor.style.display = 'block';
        
        // Masquer le curseur normal
        event.currentTarget.style.cursor = 'none';
        document.body.style.cursor = 'none';
        
        // Animation du curseur (comme la plume qui bouge)
        this.customCursor.style.animation = 'cursor-wiggle 0.6s ease-in-out';
        
        // Remettre normal après l'animation
        setTimeout(() => {
            this.customCursor.style.display = 'none';
            this.customCursor.style.animation = '';
            event.currentTarget.style.cursor = 'url("../images/pointeur.png") 16 16, pointer';
            document.body.style.cursor = '';
            this.isAnimating = false;
        }, 600);
    }
}

// Initialiser le système d'animation de curseur
document.addEventListener('DOMContentLoaded', () => {
    new CursorWiggleAnimation();
});
