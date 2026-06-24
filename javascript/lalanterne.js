/* ========================================
   LA LANTERNE - Gestionnaire de jeu
   ======================================== */

class LaLanterne {
    /* ----------------
       INITIALISATION
       ---------------- */
    constructor() {
        this.init();
    }

    init() {
        // Lancer directement le jeu
        this.initializeGame();
    }

    initializeGame() {
        // Variables du jeu
        this.playerPosition = { x: 400, y: 300 };
        this.isMoving = false;
        
        // Références aux éléments DOM
        this.player = document.getElementById('player');
        this.apartment = document.getElementById('apartment');
        // grille superposée (gérée par javascript/grille.js)
        if (window.Grille) {
            this.grid = new Grille(this.apartment, 30);
        }
        // cases autorisées marquées par l'utilisateur (dans `this.grid` si disponible)
        
        // Positionner le joueur
        this.updatePlayerPosition();
        
        // Gestionnaires d'événements
        this.apartment.addEventListener('click', (e) => this.movePlayer(e));
    }

    // grille overlay and helpers have been moved to javascript/grille.js (class Grille)
    

    /* ----------------------------------
       GESTION DU MOUVEMENT DU PERSONNAGE
       ---------------------------------- */
    movePlayer(event) {
        if (this.isMoving) return;
        
        const rect = this.apartment.getBoundingClientRect();
        const targetX = event.clientX - rect.left - 15;
        const targetY = event.clientY - rect.top - 15;
        
        // if clicked cell is marked (yellow), toggle it and do not move
        if (this.grid && typeof this.grid.worldToGrid === 'function') {
            const clicked = this.grid.worldToGrid(targetX, targetY);
            if (this.grid.isCellMarkedByWorld(targetX, targetY)) {
                this.grid.toggleCellByWorld(targetX, targetY);
                return;
            }
            // otherwise try to find a path through unmarked cells
            if (typeof this.grid.findPathWorld === 'function') {
                const path = this.grid.findPathWorld(this.playerPosition.x, this.playerPosition.y, targetX, targetY);
                if (path && path.length) {
                    this.animateAlongPath(path);
                    return;
                }
                // no path found -> do nothing
                return;
            }
        }

        if (this.isValidPosition(targetX, targetY)) {
            this.animatePlayerMovement(targetX, targetY);
        }
    }

    animateAlongPath(path) {
        if (!path || !path.length) return;
        this.isMoving = true;
        let index = 0;
        const stepTo = (tx, ty, cb) => {
            const startX = this.playerPosition.x;
            const startY = this.playerPosition.y;
            const distance = Math.hypot(tx - startX, ty - startY);
            const duration = Math.max(80, Math.min(distance * 4, 400));
            const startTime = performance.now();
            const animate = (now) => {
                const elapsed = now - startTime;
                const p = Math.min(1, elapsed / duration);
                this.playerPosition.x = startX + (tx - startX) * p;
                this.playerPosition.y = startY + (ty - startY) * p;
                this.updatePlayerPosition();
                if (p < 1) requestAnimationFrame(animate);
                else cb();
            };
            requestAnimationFrame(animate);
        };

        const next = () => {
            if (index >= path.length) {
                this.isMoving = false;
                return;
            }
            const p = path[index++];
            // ensure target cell still unmarked
            if (this.grid && this.grid.isCellMarkedByWorld(p.x, p.y)) {
                this.isMoving = false;
                return;
            }
            stepTo(p.x, p.y, next);
        };
        next();
    }

    isValidPosition(x, y) {
        const apartmentRect = this.apartment.getBoundingClientRect();
        return x >= 0 && x <= apartmentRect.width - 30 && 
               y >= 0 && y <= apartmentRect.height - 30;
    }

    animatePlayerMovement(targetX, targetY) {
        this.isMoving = true;
        const startX = this.playerPosition.x;
        const startY = this.playerPosition.y;
        const distance = Math.sqrt((targetX - startX) ** 2 + (targetY - startY) ** 2);
        const duration = Math.min(distance * 2, 1000);
        
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Interpolation linéaire
            this.playerPosition.x = startX + (targetX - startX) * progress;
            this.playerPosition.y = startY + (targetY - startY) * progress;
            
            this.updatePlayerPosition();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isMoving = false;
            }
        };
        
        requestAnimationFrame(animate);
    }

    updatePlayerPosition() {
        this.player.style.left = this.playerPosition.x + 'px';
        this.player.style.top = this.playerPosition.y + 'px';
        // marquer la case sous le joueur comme autorisée via l'instance Grille
        if (this.grid && typeof this.grid.markCellByWorld === 'function') {
            this.grid.markCellByWorld(this.playerPosition.x, this.playerPosition.y);
        }
    }
}

/* ========================================
   INITIALISATION GLOBALE
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    window.laLanterne = new LaLanterne();
});