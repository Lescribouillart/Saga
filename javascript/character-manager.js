class CharacterSheetManager {
    constructor() {
        this.character = {
            name: '',
            type: '',
            class: '',
            deity: ''
        };

        this.universe = {
            sorcier: {
                name: 'Sorcier',
                classes: [
                    { value: 'enchanteur', name: 'Enchanteur' }
                ],
                deities: [
                    { value: 'dragons', name: 'Les Dragons' }
                ]
            }
        };

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const modal = document.getElementById('characterModal');
        const closeBtn = document.getElementById('closeModal');
        const frameHoverArea = document.getElementById('frameHoverArea');
        const typeSelect = document.getElementById('char-type');
        const playBtn = document.getElementById('playCharacter');

        frameHoverArea.addEventListener('click', () => {
            console.log('Zone tableau cliquée, ouverture fiche personnage');
            this.openModal();
        });

        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeModal();
            }
        });

        typeSelect.addEventListener('change', () => this.updateClassOptions());

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.updateCharacterFromForm();
                
                // Vérifier que les champs requis sont remplis
                if (!this.character.name || !this.character.type || !this.character.class || !this.character.deity) {
                    alert('Veuillez remplir tous les champs avant de jouer.');
                    return;
                }
                
                // Fermer la modale du personnage
                this.closeModal();
                
                // Afficher la fenêtre modale de chargement
                this.showLoadingModal();
            });
        }
    }

    openModal() {
        const modal = document.getElementById('characterModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('characterModal');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
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

    updateCharacterFromForm() {
        const form = document.getElementById('characterForm');
        const formData = new FormData(form);
        this.character.name = formData.get('name') || '';
        this.character.type = formData.get('type') || '';
        this.character.class = formData.get('class') || '';
        this.character.deity = formData.get('deity') || '';
    }

    updateClassOptions() {
        const typeSelect = document.getElementById('char-type');
        const classSelect = document.getElementById('char-class');
        const deitySelect = document.getElementById('char-deity');
        const selectedType = typeSelect.value;

        classSelect.innerHTML = '';
        deitySelect.innerHTML = '';

        if (selectedType && this.universe[selectedType]) {
            classSelect.disabled = false;
            deitySelect.disabled = false;
            this.universe[selectedType].classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.value;
                option.textContent = cls.name;
                classSelect.appendChild(option);
            });
            this.universe[selectedType].deities.forEach(deity => {
                const option = document.createElement('option');
                option.value = deity.value;
                option.textContent = deity.name;
                deitySelect.appendChild(option);
            });
        } else {
            classSelect.disabled = true;
            deitySelect.disabled = true;
            classSelect.innerHTML = '<option value="">Choisir d\'abord un type</option>';
            deitySelect.innerHTML = '<option value="">Choisir d\'abord un type</option>';
        }
    }
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
    window.characterSheetManager = new CharacterSheetManager();
});