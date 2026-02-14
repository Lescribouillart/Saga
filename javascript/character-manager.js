class CharacterSheetManager {
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

    showLoadingModal() {
        const loadingModal = document.getElementById('loadingModal');
        loadingModal.classList.add('show');
        
        // Démarrer l'animation de chargement
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
        
        // Créer des particules magiques
        this.createLoadingParticles();
        
        // Animation du chargement
        const updateProgress = () => {
            if (progress <= 100) {
                progressBar.style.width = progress + '%';
                progressPercent.textContent = Math.floor(progress) + '%';
                
                progress += Math.random() * 8 + 2; // Vitesse plus rapide (était 3 + 0.5)
                
                if (progress >= 100) {
                    setTimeout(() => {
                        setTimeout(() => {
                            // Démarrer le jeu directement sans fermer la fenêtre
                            this.startGame();
                        }, 800); // Réduit de 1500ms à 800ms
                    }, 300); // Réduit de 500ms à 300ms
                } else {
                    setTimeout(updateProgress, 50 + Math.random() * 100); // Plus rapide (était 100 + 200)
                }
            }
        };
        
        setTimeout(updateProgress, 500); // Petit délai avant de commencer
    }

    createLoadingParticles() {
        const particlesContainer = document.getElementById('particles');
        // Nettoyer les anciennes particules
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

    startGame() {
        // Remplacer le contenu de la fenêtre modale par l'interface de jeu
        const loadingModal = document.getElementById('loadingModal');
        loadingModal.innerHTML = this.createGameInterface();
        
        // Initialiser le jeu
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
                    <!-- Personnage -->
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
        this.playerPosition = { x: 400, y: 300 }; // Position initiale au centre de l'appartement
        this.isMoving = false;
        
        // Référence aux éléments
        this.player = document.getElementById('player');
        this.apartment = document.getElementById('apartment');
        
        // Placer le joueur à la position initiale
        this.updatePlayerPosition();
        
        // Gestionnaires d'événements
        this.apartment.addEventListener('click', (e) => this.movePlayer(e));
        document.getElementById('closeGame').addEventListener('click', () => this.closeGame());
    }

    movePlayer(event) {
        if (this.isMoving) return;
        
        const rect = this.apartment.getBoundingClientRect();
        const targetX = event.clientX - rect.left - 15; // -15 pour centrer le personnage
        const targetY = event.clientY - rect.top - 15;
        
        // Vérifier si la position est valide (pas sur un meuble)
        if (this.isValidPosition(targetX, targetY)) {
            this.animatePlayerMovement(targetX, targetY);
        }
    }

    isValidPosition(x, y) {
        // Vérification basique des limites de l'appartement
        const apartmentRect = this.apartment.getBoundingClientRect();
        return x >= 0 && x <= apartmentRect.width - 30 && 
               y >= 0 && y <= apartmentRect.height - 30;
    }

    animatePlayerMovement(targetX, targetY) {
        this.isMoving = true;
        const startX = this.playerPosition.x;
        const startY = this.playerPosition.y;
        const distance = Math.sqrt((targetX - startX) ** 2 + (targetY - startY) ** 2);
        const duration = Math.min(distance * 2, 1000); // Vitesse proportionnelle à la distance
        
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

    closeGame() {
        // Fermer la fenêtre de jeu et revenir à l'écran principal
        this.hideLoadingModal();
    }
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
    window.characterSheetManager = new CharacterSheetManager();
});