class Grille {
    constructor(apartmentEl, cellSize = 30) {
        this.apartment = apartmentEl;
        this.gridCellSize = cellSize;
        // half-size of the entity using the grid (defaults to half cell)
        this.entityHalf = Math.floor(this.gridCellSize / 2);
        this.allowedCells = new Set();
        this.gridCanvas = null;
        this.editable = true; // when true, user can toggle marks by clicking
        this.enforceObstacles = true; // when true, marked cells are treated as blocking
        this.createGridOverlay();
        this.storageKey = 'laLanterne.allowedCells.' + (window.location.pathname || 'default');
        this.loadAllowed();
    }

    setEditable(value) {
        this.editable = !!value;
    }

    setEnforceObstacles(value) {
        this.enforceObstacles = !!value;
    }

    createGridOverlay() {
        const existing = this.apartment.querySelector('#gridOverlay');
        if (existing) existing.remove();

        const canvas = document.createElement('canvas');
        canvas.id = 'gridOverlay';
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '150';
        canvas.style.pointerEvents = 'none';
        this.apartment.appendChild(canvas);
        this.gridCanvas = canvas;
        this.updateGridOverlay();
        window.addEventListener('resize', () => this.updateGridOverlay());
    }

    updateGridOverlay() {
        if (!this.gridCanvas) return;
        const rect = this.apartment.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));
        this.gridCanvas.width = Math.floor(w * ratio);
        this.gridCanvas.height = Math.floor(h * ratio);
        this.gridCanvas.style.width = w + 'px';
        this.gridCanvas.style.height = h + 'px';
        const ctx = this.gridCanvas.getContext('2d');
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        this.drawGrid(ctx, w, h);
    }

    drawGrid(ctx, w, h) {
        ctx.clearRect(0, 0, w, h);
        const size = this.gridCellSize;
        // remplir les cases marquées en jaune
        if (this.allowedCells && this.allowedCells.size) {
            ctx.fillStyle = 'rgba(255, 223, 0, 0.4)';
            for (const key of this.allowedCells) {
                const [gx, gy] = key.split(',').map(Number);
                const rx = gx * size;
                const ry = gy * size;
                ctx.fillRect(rx, ry, size, size);
            }
        }
        // rendre les lignes plus visibles
        ctx.strokeStyle = 'rgba(212,175,55,0.45)';
        ctx.lineWidth = 1.2;
        // verticales
        for (let x = 0; x <= w; x += size) {
            ctx.beginPath();
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, h);
            ctx.stroke();
        }
        // horizontales
        for (let y = 0; y <= h; y += size) {
            ctx.beginPath();
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(w, y + 0.5);
            ctx.stroke();
        }
        // labels : numérotation horizontale (colonnes) et lettres verticales (lignes)
        const cols = Math.ceil(w / size);
        const rows = Math.ceil(h / size);
        ctx.fillStyle = 'rgba(212,175,55,0.9)';
        ctx.font = Math.max(10, Math.floor(size / 3)) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        // colonnes : chiffres centrés en haut de chaque case
        for (let gx = 0; gx < cols; gx++) {
            const tx = gx * size + size / 2;
            ctx.fillText(String(gx + 1), tx, 2);
        }
        // lignes : lettres (A, B, ... Z, AA, AB...) centrées à gauche de chaque case
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const labelX = 4;
        for (let gy = 0; gy < rows; gy++) {
            const ty = gy * size + size / 2;
            ctx.fillText(this.indexToLetters(gy), labelX, ty);
        }
    }

    indexToLetters(index) {
        let s = '';
        let i = index;
        while (i >= 0) {
            const rem = i % 26;
            s = String.fromCharCode(65 + rem) + s;
            i = Math.floor(i / 26) - 1;
        }
        return s;
    }

    worldToGrid(x, y) {
        // interpret x,y as top-left of the entity -> convert to entity center
        const cx = x + this.entityHalf;
        const cy = y + this.entityHalf;
        const gx = Math.max(0, Math.floor(cx / this.gridCellSize));
        const gy = Math.max(0, Math.floor(cy / this.gridCellSize));
        return { gx, gy };
    }

    gridToWorld(gx, gy) {
        // return top-left coordinates so that entity is centered on the cell
        return {
            x: gx * this.gridCellSize + this.gridCellSize / 2 - this.entityHalf,
            y: gy * this.gridCellSize + this.gridCellSize / 2 - this.entityHalf
        };
    }

    // A* pathfinding: marked cells (this.allowedCells) are obstacles
    findPathWorld(startX, startY, targetX, targetY) {
        const rect = this.apartment.getBoundingClientRect();
        const cols = Math.ceil(rect.width / this.gridCellSize);
        const rows = Math.ceil(rect.height / this.gridCellSize);

        const start = this.worldToGrid(startX, startY);
        const goal = this.worldToGrid(targetX, targetY);
        console.debug('[Grille] findPathWorld start=', start, 'goal=', goal, 'markedCount=', this.allowedCells.size);

        const key = (x, y) => x + ',' + y;
        // Determine walkability depending on enforceObstacles flag
        // When entity is larger than 1 cell, ensure ALL covered cells are free
        const radius = Math.max(0, Math.ceil(this.entityHalf / this.gridCellSize));
        const isWalkable = (x, y) => {
            if (!this.enforceObstacles) return true;
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return false;
                    if (this.allowedCells.has(key(nx, ny))) return false;
                }
            }
            return true;
        };

        if (!isWalkable(goal.gx, goal.gy)) {
            console.debug('[Grille] goal not walkable', goal);
            return null;
        }

        const open = new Map();
        const closed = new Set();

        function heuristic(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

        const startNode = { x: start.gx, y: start.gy, g: 0, f: heuristic({ x: start.gx, y: start.gy }, { x: goal.gx, y: goal.gy }), parent: null };
        open.set(key(startNode.x, startNode.y), startNode);

        while (open.size) {
            let current;
            for (const n of open.values()) if (!current || n.f < current.f) current = n;
            open.delete(key(current.x, current.y));
            if (current.x === goal.gx && current.y === goal.gy) {
                const path = [];
                let node = current;
                while (node) {
                    path.push(this.gridToWorld(node.x, node.y));
                    node = node.parent;
                }
                return path.reverse();
            }
            closed.add(key(current.x, current.y));

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = current.x + dx;
                    const ny = current.y + dy;
                    if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
                    if (!isWalkable(nx, ny)) continue;
                    const nKey = key(nx, ny);
                    if (closed.has(nKey)) continue;
                    const tentativeG = current.g + Math.hypot(dx, dy);
                    const existing = open.get(nKey);
                    const h = heuristic({ x: nx, y: ny }, goal);
                    if (!existing || tentativeG < existing.g) {
                        const neighbor = { x: nx, y: ny, g: tentativeG, f: tentativeG + h, parent: current };
                        open.set(nKey, neighbor);
                    }
                }
            }
        }
        return null;
    }

    markCellByWorld(x, y) {
        const g = this.worldToGrid(x, y);
        const key = g.gx + ',' + g.gy;
        if (!this.allowedCells.has(key)) {
            this.allowedCells.add(key);
            this.updateGridOverlay();
            this.saveAllowed();
        }
    }

    isCellMarkedByWorld(x, y) {
        const g = this.worldToGrid(x, y);
        const keyFn = (a, b) => a + ',' + b;
        const radius = Math.max(0, Math.ceil(this.entityHalf / this.gridCellSize));
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const nx = g.gx + dx;
                const ny = g.gy + dy;
                if (this.allowedCells.has(keyFn(nx, ny))) return true;
            }
        }
        return false;
    }

    toggleCellByWorld(x, y) {
        const g = this.worldToGrid(x, y);
        const key = g.gx + ',' + g.gy;
        if (this.allowedCells.has(key)) {
            this.allowedCells.delete(key);
        } else {
            this.allowedCells.add(key);
        }
        this.updateGridOverlay();
        this.saveAllowed();
    }

    clearAllowed() {
        this.allowedCells.clear();
        this.updateGridOverlay();
        this.saveAllowed();
    }

    setCellSize(size) {
        this.gridCellSize = size;
        this.updateGridOverlay();
    }

    saveAllowed() {
        try {
            const arr = Array.from(this.allowedCells);
            localStorage.setItem(this.storageKey, JSON.stringify(arr));
        } catch (e) {
            console.warn('Grille.saveAllowed failed', e);
        }
    }

    loadAllowed() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                const arr = JSON.parse(raw);
                this.allowedCells = new Set(arr);
                if (this.gridCanvas) this.updateGridOverlay();
                return;
            }

            // If nothing in localStorage, try to fetch a repository-provided file
            // so that edits done with the grid can be applied project-wide.
            try {
                fetch('data/obstacles.json').then(r => {
                    if (!r.ok) return;
                    return r.json();
                }).then(arr => {
                    if (!arr) return;
                    this.allowedCells = new Set(arr);
                    if (this.gridCanvas) this.updateGridOverlay();
                }).catch(() => {});
            } catch (e) {
                // ignore fetch errors (file absent or CORS)
            }
        } catch (e) {
            console.warn('Grille.loadAllowed failed', e);
        }
    }

    // Export current marks as a downloadable JSON file
    exportAllowed(filename = 'obstacles.json') {
        try {
            const arr = Array.from(this.allowedCells || []);
            const blob = new Blob([JSON.stringify(arr, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.warn('Grille.exportAllowed failed', e);
        }
    }

    // Import marks from an object/array (used by file input)
    importAllowedFromArray(arr) {
        try {
            this.allowedCells = new Set(arr || []);
            this.updateGridOverlay();
            this.saveAllowed();
        } catch (e) {
            console.warn('Grille.importAllowedFromArray failed', e);
        }
    }

    hide() {
        if (this.gridCanvas) this.gridCanvas.style.display = 'none';
    }

    show() {
        if (this.gridCanvas) this.gridCanvas.style.display = '';
    }

    toggle() {
        if (!this.gridCanvas) return;
        this.gridCanvas.style.display = this.gridCanvas.style.display === 'none' ? '' : 'none';
    }
}

window.Grille = Grille;
