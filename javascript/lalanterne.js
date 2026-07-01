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
        this.playerImg = document.getElementById('playerImg');
        this.apartment = document.getElementById('apartment');
        // grille superposée (gérée par javascript/grille.js)
        // Determine whether admin UI should be enabled (local dev on :5500)
        const isLocalHost = ['127.0.0.1', 'localhost', '::1'].includes(window.location.hostname);
        const isLiveServer5500 = window.location.port === '5500';
        this._showAdminUI = isLocalHost && isLiveServer5500;
        if (window.Grille) {
            this.grid = new Grille(this.apartment, 30);
            // Inform grid about current player size so hitbox math matches CSS
            try {
                const cs = window.getComputedStyle(this.player);
                const w = parseInt(cs.width, 10) || this.grid.gridCellSize;
                const h = parseInt(cs.height, 10) || this.grid.gridCellSize;
                this.grid.entityHalf = Math.floor(Math.max(w, h) / 2);
                // Snap initial player position to nearest grid center
                const startG = this.grid.worldToGrid(this.playerPosition.x, this.playerPosition.y);
                const startWorld = this.grid.gridToWorld(startG.gx, startG.gy);
                this.playerPosition.x = startWorld.x;
                this.playerPosition.y = startWorld.y;
            } catch (e) {
                // ignore; grid will use default entityHalf
            }
            // If not in admin UI mode, hide the overlay and disable editing so clicks move the player
            if (!this._showAdminUI) {
                try {
                    this.grid.hide();
                    this.grid.setEditable(false);
                } catch (e) {
                    console.warn('[LaLanterne] failed to set grid mode', e);
                }
            }
        }
        // cases autorisées marquées par l'utilisateur (dans `this.grid` si disponible)
        
        // Positionner le joueur
        this.updatePlayerPosition();
        // Etat de sprite initial : immobile face au bas
        this._isPlayerAnimating = false;
        this._lastDirection = 'bas';
        this._showSprite(false);
        
        // Gestionnaires d'événements
        this.apartment.addEventListener('click', (e) => this.movePlayer(e));
        // Clavier : suivi des touches maintenues pour mouvement continu et fluide
        this._keysHeld = {};
        document.addEventListener('keydown', (e) => this._onKeyDown(e));
        document.addEventListener('keyup',   (e) => this._onKeyUp(e));

        // Create grid toggle button next to title (only shown on local dev server)
        const header = document.querySelector('.game-header');
        if (header) {
            const isLocalHost = ['127.0.0.1', 'localhost', '::1'].includes(window.location.hostname);
            const isLiveServer5500 = window.location.port === '5500';
            const showAdminUI = isLocalHost && isLiveServer5500;
            if (!showAdminUI) {
                console.info('[LaLanterne] Admin UI hidden on', window.location.hostname + (window.location.port ? ':' + window.location.port : ''));
            } else {
                const btn = document.createElement('button');
                btn.id = 'gridToggleBtn';
                btn.textContent = 'Désactiver la grille';
                btn.style.marginLeft = '12px';
                btn.style.padding = '6px 10px';
                btn.style.fontSize = '0.9rem';
                btn.style.cursor = 'pointer';
                header.appendChild(btn);
                // Export / Import buttons
                const exp = document.createElement('button');
                exp.id = 'gridExportBtn';
                exp.textContent = 'Exporter marques';
                exp.style.marginLeft = '8px';
                exp.style.padding = '6px 10px';
                exp.style.fontSize = '0.9rem';
                exp.style.cursor = 'pointer';
                header.appendChild(exp);

                const imp = document.createElement('input');
                imp.type = 'file';
                imp.accept = 'application/json';
                imp.id = 'gridImportInput';
                imp.style.display = 'none';
                header.appendChild(imp);

                const impBtn = document.createElement('button');
                impBtn.id = 'gridImportBtn';
                impBtn.textContent = 'Importer marques';
                impBtn.style.marginLeft = '8px';
                impBtn.style.padding = '6px 10px';
                impBtn.style.fontSize = '0.9rem';
                impBtn.style.cursor = 'pointer';
                header.appendChild(impBtn);

                exp.addEventListener('click', () => {
                    if (!this.grid) return;
                    this.grid.exportAllowed('obstacles.json');
                });

                impBtn.addEventListener('click', () => imp.click());
                imp.addEventListener('change', (e) => {
                    const f = e.target.files && e.target.files[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        try {
                            const arr = JSON.parse(ev.target.result);
                            if (this.grid && typeof this.grid.importAllowedFromArray === 'function') {
                                this.grid.importAllowedFromArray(arr);
                            }
                        } catch (err) {
                            console.warn('Import failed', err);
                        }
                    };
                    reader.readAsText(f);
                });
                btn.addEventListener('click', () => {
                    if (!this.grid) return;
                    const visible = this.grid.gridCanvas && this.grid.gridCanvas.style.display !== 'none';
                    if (visible) {
                        // hide overlay and disable editing (marks remain obstacles)
                        this.grid.hide();
                        this.grid.setEditable(false);
                        btn.textContent = 'Activer la grille';
                    } else {
                        // show overlay and enable editing (marks still act as obstacles)
                        this.grid.show();
                        this.grid.setEditable(true);
                        btn.textContent = 'Désactiver la grille';
                    }
                });
            }
        }
    }

    // grille overlay and helpers have been moved to javascript/grille.js (class Grille)
    

    /* ----------------------------------
       GESTION DU MOUVEMENT DU PERSONNAGE
       ---------------------------------- */
    movePlayer(event) {
        if (this.isMoving) return;
        
        const rect = this.apartment.getBoundingClientRect();
        // compute target top-left according to entity half so worldToGrid maps to proper centre
        let entityHalf = 15;
        if (this.grid && this.grid.entityHalf) entityHalf = this.grid.entityHalf;
        const targetX = event.clientX - rect.left - entityHalf;
        const targetY = event.clientY - rect.top - entityHalf;
        console.debug('[LaLanterne] movePlayer clicked world=', { targetX, targetY });
        
        // if clicked cell is marked (yellow), toggle it and do not move
        if (this.grid && typeof this.grid.worldToGrid === 'function') {
            const clicked = this.grid.worldToGrid(targetX, targetY);
            const playerCell = this.grid.worldToGrid(this.playerPosition.x, this.playerPosition.y);
            const allowedSize = this.grid.allowedCells ? this.grid.allowedCells.size : 0;
            console.debug('[LaLanterne] clickedGrid=', clicked, 'playerGrid=', playerCell, 'allowedCount=', allowedSize);
            // If grid is editable (editing mode), toggle mark under cursor
            if (this.grid.editable) {
                this.grid.toggleCellByWorld(targetX, targetY);
                return;
            }

            // Not in editing mode -> attempt movement (marked cells are obstacles)
            if (typeof this.grid.findPathWorld === 'function') {
                console.debug('[LaLanterne] calling findPathWorld...');
                const path = this.grid.findPathWorld(this.playerPosition.x, this.playerPosition.y, targetX, targetY);
                console.debug('[LaLanterne] findPathWorld returned', path);
                if (path && path.length) {
                    this.animateAlongPath(path);
                    return;
                }
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
        this._isPlayerAnimating = true;
        this._showSprite(true);
        let index = 0;
        const stepTo = (tx, ty, cb) => {
            const startX = this.playerPosition.x;
            const startY = this.playerPosition.y;
            // Set orientation based on next step
            this.setPlayerDirection(tx - startX, ty - startY);
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
                this._isPlayerAnimating = false;
                if (this._keysHeld && Object.keys(this._keysHeld).length) {
                    this._tryKeyMove();
                } else {
                    this._showSprite(false);
                }
                return;
            }
            const p = path[index++];
            // move to next cell and mark it after arrival
            stepTo(p.x, p.y, () => {
                // do not mark cells during movement anymore
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
        // Update orientation according to movement vector
        this.setPlayerDirection(targetX - startX, targetY - startY);
        this._isPlayerAnimating = true;
        this._showSprite(true);
        const distance = Math.sqrt((targetX - startX) ** 2 + (targetY - startY) ** 2);
        // Même durée qu'animateAlongPath pour un mouvement cohérent
        const duration = Math.max(80, Math.min(distance * 4, 400));
        
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
                this._isPlayerAnimating = false;
                // Enchaîner immédiatement si une touche est encore enfoncée
                if (this._keysHeld && Object.keys(this._keysHeld).length) {
                    this._tryKeyMove();
                } else {
                    this._showSprite(false);
                }
            }
        };
        
        requestAnimationFrame(animate);
    }

    updatePlayerPosition() {
        this.player.style.left = this.playerPosition.x + 'px';
        this.player.style.top = this.playerPosition.y + 'px';
        // no automatic marking here; marking happens when moving along a path
    }

    setPlayerDirection(dx, dy) {
        if (!this.playerImg) return;
        let dir = 'bas';
        if (Math.abs(dx) > Math.abs(dy)) {
            dir = dx > 0 ? 'droite' : 'gauche';
        } else {
            dir = dy > 0 ? 'bas' : 'haut';
        }
        if (dir === this._lastDirection) return; // direction inchangée, rien à faire
        this._lastDirection = dir;
        // Si déjà en mouvement, mettre à jour le GIF immédiatement
        if (this._isPlayerAnimating) {
            this._showSprite(true);
        }
    }

    /* -------------------------------------------------
       GIFS_ANIMÉS   gifs/drelall/*.gif
       IMAGES_FIXES  gifs/drelallfix/*.png
       ------------------------------------------------- */
    _showSprite(animating) {
        if (!this.playerImg) return;
        const dir = this._lastDirection || 'bas';
        const GIF = {
            bas:    'gifs/drelall/marchebas.gif',
            droite: 'gifs/drelall/marchedroite.gif',
            gauche: 'gifs/drelall/marchegauche.gif',
            haut:   'gifs/drelall/marchehaut.gif'
        };
        const FIX = {
            bas:    'gifs/drelallfix/marchebf.png',
            droite: 'gifs/drelallfix/marchedf.png',
            gauche: 'gifs/drelallfix/marchegf.png',
            haut:   'gifs/drelallfix/marchehf.png'
        };
        const src = animating ? (GIF[dir] || GIF.bas) : (FIX[dir] || FIX.bas);
        // Ne recharger que si la source a réellement changé (évite tout flash)
        if (!this.playerImg.src.endsWith(src)) {
            this.playerImg.src = src;
        }
    }

    /* --------------------------------------------------
       CONTRÔLE CLAVIER — touche maintenue = mouvement continu
       -------------------------------------------------- */
    _onKeyDown(e) {
        const dirs = { ArrowUp: {dx:0,dy:-1}, ArrowDown: {dx:0,dy:1}, ArrowLeft: {dx:-1,dy:0}, ArrowRight: {dx:1,dy:0} };
        const dir = dirs[e.key];
        if (!dir) return;
        e.preventDefault();
        this._keysHeld[e.key] = dir;
        this._tryKeyMove();
    }

    _onKeyUp(e) {
        delete this._keysHeld[e.key];
        if (!Object.keys(this._keysHeld).length && !this.isMoving) {
            this._isPlayerAnimating = false;
            this._showSprite(false);
        }
    }

    _tryKeyMove() {
        if (this.isMoving) return;
        const held = Object.values(this._keysHeld);
        if (!held.length) return;
        const dir = held[held.length - 1];
        // If grid is available, move to adjacent cell center instead of raw pixel step
        if (this.grid && typeof this.grid.worldToGrid === 'function') {
            const playerCell = this.grid.worldToGrid(this.playerPosition.x, this.playerPosition.y);
            const nextGX = playerCell.gx + dir.dx;
            const nextGY = playerCell.gy + dir.dy;
            const rect = this.apartment.getBoundingClientRect();
            const cols = Math.ceil(rect.width / this.grid.gridCellSize);
            const rows = Math.ceil(rect.height / this.grid.gridCellSize);
            if (nextGX < 0 || nextGY < 0 || nextGX >= cols || nextGY >= rows) return;
            const targetWorld = this.grid.gridToWorld(nextGX, nextGY);
            this.setPlayerDirection(targetWorld.x - this.playerPosition.x, targetWorld.y - this.playerPosition.y);
            if (!this.isValidPosition(targetWorld.x, targetWorld.y)) return;
            if (this.grid.enforceObstacles && typeof this.grid.isCellMarkedByWorld === 'function' && this.grid.isCellMarkedByWorld(targetWorld.x, targetWorld.y)) return;
            this.animatePlayerMovement(targetWorld.x, targetWorld.y);
            return;
        }
        // fallback: single-step in pixels
        const step = 30;
        const dx = dir.dx * step;
        const dy = dir.dy * step;
        this.setPlayerDirection(dx, dy);
        const targetX = this.playerPosition.x + dx;
        const targetY = this.playerPosition.y + dy;
        if (!this.isValidPosition(targetX, targetY)) return;
        if (this.grid && this.grid.enforceObstacles && typeof this.grid.isCellMarkedByWorld === 'function' && this.grid.isCellMarkedByWorld(targetX, targetY)) return;
        this.animatePlayerMovement(targetX, targetY);
    }
}

/* ========================================
   INITIALISATION GLOBALE
   ======================================== */
document.addEventListener('DOMContentLoaded', async () => {
    // En local sur le serveur de dev (:5500) : pas de blocage pour pouvoir travailler
    const isLocalDev = ['127.0.0.1', 'localhost', '::1'].includes(window.location.hostname)
                    && window.location.port === '5500';
    if (isLocalDev) {
        window.laLanterne = new LaLanterne();
        return;
    }

    // Sur le site déployé : accessible uniquement via Brave
    let isBrave = false;
    try {
        if (window.__braveReady && typeof window.__braveReady.then === 'function') {
            isBrave = await window.__braveReady;
        }
    } catch (e) { isBrave = false; }

    if (!isBrave) {
        document.documentElement.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#0b1220;color:#fff;font-family:Helvetica,Arial,sans-serif;';
        wrapper.innerHTML = `<div style="max-width:480px;text-align:center;">
            <p style="font-size:1.1rem;opacity:0.9;">Ce site est uniquement accessible via le navigateur <strong>Brave</strong>.<br>Téléchargez-le gratuitement sur <a href="https://brave.com/" style="color:#9ad1ff;">brave.com</a>.</p>
        </div>`;
        document.body && document.body.appendChild(wrapper);
        return;
    }

    window.laLanterne = new LaLanterne();
});