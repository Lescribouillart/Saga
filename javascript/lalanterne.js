/* ========================================
   LA LANTERNE - Gestionnaire de jeu
   ======================================== */

class LaLanterne {
    /* ----------------
       INITIALISATION
       ---------------- */
    constructor() {
        // Personnage par défaut
        this.character = {
            name: 'Aventurier',
            type: 'sorcier',
            class: 'enchanteur',
            deity: 'dragons'
        };

        this.init();
    }

    init() {
        // Lancer directement la modal de chargement au chargement de la page
        this.showLoadingModal();
    }

    /* --------------------------------
       GESTION DE L'ÉCRAN DE CHARGEMENT
       -------------------------------- */
    showLoadingModal() {
        const loadingModal = document.getElementById('loadingModal');
        loadingModal.classList.add('show');
        this.startLoadingAnimation();
    }

    hideLoadingModal() {
        const loadingModal = document.getElementById('loadingModal');
        loadingModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    startLoadingAnimation() {
        let progress = 0;
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        
        // Créer les particules magiques
        this.createLoadingParticles();
        
        // Animation de la barre de progression
        const updateProgress = () => {
            if (progress <= 100) {
                progressBar.style.width = progress + '%';
                progressPercent.textContent = Math.floor(progress) + '%';
                
                progress += Math.random() * 8 + 2;
                
                if (progress >= 100) {
                    // Chargement terminé, lancer le jeu
                    setTimeout(() => {
                        setTimeout(() => {
                            this.startGame();
                        }, 800);
                    }, 300);
                } else {
                    setTimeout(updateProgress, 50 + Math.random() * 100);
                }
            }
        };
        
        setTimeout(updateProgress, 500);
    }

    createLoadingParticles() {
        const particlesContainer = document.getElementById('particles');
        particlesContainer.innerHTML = '';
        
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (4 + Math.random() * 4) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    /* --------------------------------
       CRÉATION DE L'INTERFACE DE JEU
       -------------------------------- */
    startGame() {
        const loadingModal = document.getElementById('loadingModal');
        loadingModal.innerHTML = this.createGameInterface();
        
        this.initializeGame();
        console.log('Jeu démarré pour:', this.character);
    }

    createGameInterface() {
        return `
            <div class="game-container">
                <div class="game-header">
                    <h2>SAGA - Appartement de ${this.character.name}</h2>
                    <p>Vous vous réveillez dans votre salon... Que s'est-il passé après avoir traversé le tableau ?</p>
                </div>
                
                <div class="apartment-container" id="apartment">
                    <div class="character" id="player">
                        <div class="character-sprite">🧙‍♂️</div>
                    </div>
                </div>
                
                <div class="game-ui">
                    <button id="closeGame" class="btn-secondary">Quitter le jeu</button>
                </div>
            </div>
        `;
    }

    initializeGame() {
        // Variables du jeu
        this.playerPosition = { x: 400, y: 300 };
        this.isMoving = false;
        
        // Références aux éléments DOM
        this.player = document.getElementById('player');
        this.apartment = document.getElementById('apartment');
        
        // Positionner le joueur
        this.updatePlayerPosition();
        
        // Gestionnaires d'événements
        this.apartment.addEventListener('click', (e) => this.movePlayer(e));
        document.getElementById('closeGame').addEventListener('click', () => this.closeGame());
    }

    /* ----------------------------------
       GESTION DU MOUVEMENT DU PERSONNAGE
       ---------------------------------- */
    movePlayer(event) {
        if (this.isMoving) return;
        
        const rect = this.apartment.getBoundingClientRect();
        const targetX = event.clientX - rect.left - 15;
        const targetY = event.clientY - rect.top - 15;
        
        if (this.isValidPosition(targetX, targetY)) {
            this.animatePlayerMovement(targetX, targetY);
        }
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
    }

    /* -----------
       UTILITAIRES
       ----------- */
    closeGame() {
        this.hideLoadingModal();
    }
}

/* ========================================
   INITIALISATION GLOBALE
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    window.laLanterne = new LaLanterne();
});