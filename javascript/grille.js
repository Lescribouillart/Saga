class Grille {
    constructor(apartmentEl, cellSize = 30) {
        this.apartment = apartmentEl;
        this.gridCellSize = cellSize;
        this.allowedCells = new Set();
        this.gridCanvas = null;
        this.createGridOverlay();
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
        canvas.style.zIndex = '50';
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
        ctx.strokeStyle = 'rgba(212,175,55,0.12)';
        ctx.lineWidth = 1;
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
        ctx.fillStyle = 'rgba(212,175,55,0.8)';
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
        const cx = x + 15;
        const cy = y + 15;
        const gx = Math.max(0, Math.floor(cx / this.gridCellSize));
        const gy = Math.max(0, Math.floor(cy / this.gridCellSize));
        return { gx, gy };
    }

    markCellByWorld(x, y) {
        const g = this.worldToGrid(x, y);
        const key = g.gx + ',' + g.gy;
        if (!this.allowedCells.has(key)) {
            this.allowedCells.add(key);
            this.updateGridOverlay();
        }
    }

    isCellMarkedByWorld(x, y) {
        const g = this.worldToGrid(x, y);
        const key = g.gx + ',' + g.gy;
        return this.allowedCells.has(key);
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
    }

    clearAllowed() {
        this.allowedCells.clear();
        this.updateGridOverlay();
    }

    setCellSize(size) {
        this.gridCellSize = size;
        this.updateGridOverlay();
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
