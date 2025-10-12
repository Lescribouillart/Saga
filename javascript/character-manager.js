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
        const statusMessage = document.getElementById('statusMessage');
        
        const loadingMessages = [
            "Initialisation de la magie...",
            "Chargement des sorts anciens...",
            "Préparation du monde mystique...",
            "Invocation des créatures...",
            "Activation des portails...",
            "Finalisation des enchantements...",
            "Prêt pour l'aventure !"
        ];
        
        // Créer des particules magiques
        this.createLoadingParticles();
        
        // Animation du chargement
        const updateProgress = () => {
            if (progress <= 100) {
                progressBar.style.width = progress + '%';
                progressPercent.textContent = Math.floor(progress) + '%';
                
                // Changer le message selon le progrès
                const messageIndex = Math.min(Math.floor(progress / 15), loadingMessages.length - 1);
                statusMessage.textContent = loadingMessages[messageIndex];
                
                progress += Math.random() * 3 + 0.5; // Vitesse variable pour plus de réalisme
                
                if (progress >= 100) {
                    setTimeout(() => {
                        statusMessage.textContent = "Chargement terminé ! Démarrage du jeu...";
                        setTimeout(() => {
                            this.hideLoadingModal();
                            // Ici vous pouvez ajouter la logique pour démarrer le jeu
                            this.startGame();
                        }, 1500);
                    }, 500);
                } else {
                    setTimeout(updateProgress, 100 + Math.random() * 200);
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
        // Pour l'instant, afficher un message de succès
        // Plus tard, vous pourrez rediriger vers la vraie interface de jeu
        alert(`Bienvenue dans votre aventure, ${this.character.name} ! Le jeu va commencer...`);
        console.log('Personnage créé:', this.character);
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