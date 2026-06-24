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

        // Create grid toggle button next to title
        const header = document.querySelector('.game-header');
        if (header) {
            const btn = document.createElement('button');
            btn.id = 'gridToggleBtn';
            btn.textContent = 'Désactiver la grille';
            btn.style.marginLeft = '12px';
            btn.style.padding = '6px 10px';
            btn.style.fontSize = '0.9rem';
            btn.style.cursor = 'pointer';
            header.appendChild(btn);
            btn.addEventListener('click', () => {
                if (!this.grid) return;
                const visible = this.grid.gridCanvas && this.grid.gridCanvas.style.display !== 'none';
                if (visible) {
                    // disable: hide overlay, enforce obstacles, disable editing
                    this.grid.hide();
                    this.grid.setEditable(false);
                    this.grid.setEnforceObstacles(true);
                    btn.textContent = 'Activer la grille';
                } else {
                    // enable: show overlay, allow editing, do not enforce obstacles
                    this.grid.show();
                    this.grid.setEditable(true);
                    this.grid.setEnforceObstacles(false);
                    btn.textContent = 'Désactiver la grille';
                }
            });
        }
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
        console.debug('[LaLanterne] movePlayer clicked world=', { targetX, targetY });
        
        // if clicked cell is marked (yellow), toggle it and do not move
        if (this.grid && typeof this.grid.worldToGrid === 'function') {
            const clicked = this.grid.worldToGrid(targetX, targetY);
            const playerCell = this.grid.worldToGrid(this.playerPosition.x, this.playerPosition.y);
            const allowedSize = this.grid.allowedCells ? this.grid.allowedCells.size : 0;
            console.debug('[LaLanterne] clickedGrid=', clicked, 'playerGrid=', playerCell, 'allowedCount=', allowedSize);
            const clickedIsMarked = this.grid.isCellMarkedByWorld(targetX, targetY);
            console.debug('[LaLanterne] clickedIsMarked=', clickedIsMarked);
            if (clickedIsMarked) {
                // only allow manual toggling when grid is editable
                if (this.grid.editable) {
                    this.grid.toggleCellByWorld(targetX, targetY);
                }
                return;
            }
            // otherwise try to find a path through unmarked cells
            if (typeof this.grid.findPathWorld === 'function') {
                console.debug('[LaLanterne] calling findPathWorld...');
                const path = this.grid.findPathWorld(this.playerPosition.x, this.playerPosition.y, targetX, targetY);
                console.debug('[LaLanterne] findPathWorld returned', path);
                if (path && path.length) {
                    this.animateAlongPath(path);
                    return;
                }
                // no path found -> do nothing
                console.debug('[LaLanterne] no path found to target');
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
            // move to next cell and mark it after arrival
            stepTo(p.x, p.y, () => {
                if (this.grid && typeof this.grid.markCellByWorld === 'function') {
                    this.grid.markCellByWorld(p.x, p.y);
                }
                next();
            });
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
        // no automatic marking here; marking happens when moving along a path
    }
}

/* ========================================
   INITIALISATION GLOBALE
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    window.laLanterne = new LaLanterne();
});