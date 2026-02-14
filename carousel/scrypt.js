/* ========================================
   PORTFOLIO JAVASCRIPT - VERSION PROPRE
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // ANIMATION DU LOGO
    // ========================================
    const logoImg = document.querySelector('.logo img');
    const logoLink = document.querySelector('.logo a');

    if (logoImg) {
        logoImg.addEventListener('click', function(event) {
            // Empêcher la redirection si le logo est dans un lien
            if (logoLink) {
                event.preventDefault();
                event.stopPropagation();
            }

            this.classList.remove('wiggle');
            void this.offsetWidth; // force le reflow
            this.classList.add('wiggle');

            // Retirer la classe après l'animation
            setTimeout(() => {
                this.classList.remove('wiggle');
                // Si c'était dans un lien, rediriger après l'animation
                if (logoLink) {
                    window.location.href = logoLink.href;
                }
            }, 600);
        });
    }

    // ========================================
    // MODE SOMBRE
    // ========================================
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    // Vérifier si le mode sombre est déjà activé
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            
            // Sauvegarder la préférence
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
            } else {
                localStorage.setItem('darkMode', 'disabled');
            }
        });
    }

    // ========================================
    // CAROUSEL
    // ========================================
    const carouselTrack = document.querySelector('.carousel-track');
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const indicators = document.querySelectorAll('.indicator');

    if (carouselTrack && carouselSlides.length > 0) {
        let currentSlide = 0;
        const totalSlides = carouselSlides.length;

        // Fonction pour aller à une slide spécifique
        function goToSlide(slideIndex) {
            currentSlide = slideIndex;
            const translateX = -slideIndex * 100;
            carouselTrack.style.transform = `translateX(${translateX}%)`;

            // Mettre à jour les indicateurs
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === slideIndex);
            });
        }

        // Fonction pour aller à la slide suivante
        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            goToSlide(currentSlide);
        }

        // Fonction pour aller à la slide précédente
        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            goToSlide(currentSlide);
        }

        // Event listeners pour les boutons
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        // Event listeners pour les indicateurs
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => goToSlide(index));
        });

        // Support tactile pour mobile
        const carouselContainer = document.querySelector('.carousel-container');
        let startX = 0;
        let endX = 0;

        if (carouselContainer) {
            carouselContainer.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });

            carouselContainer.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                const diffX = startX - endX;

                if (Math.abs(diffX) > 50) { // Seuil minimum pour déclencher le swipe
                    if (diffX > 0) {
                        nextSlide();
                    } else {
                        prevSlide();
                    }
                }
            });
        }

        // Initialiser le carousel
        goToSlide(0);
    }

    // ========================================
    // GESTION DES SOUS-MENUS (Desktop + Mobile/Tablette)
    // ========================================
    const submenuToggles = document.querySelectorAll('.dropdown-submenu-toggle');
    const subSubmenuToggles = document.querySelectorAll('.dropdown-sub-submenu-toggle');
    let submenuTimeout;
    let subSubmenuTimeout;
    
    // Fonction pour détecter si on est sur mobile/tablette
    function isMobileDevice() {
        return window.innerWidth <= 768 || ('ontouchstart' in window);
    }
    
    // Fonction pour fermer tous les sous-sous-menus
    function closeAllSubSubmenus() {
        document.querySelectorAll('.dropdown-sub-submenu-content').forEach(content => {
            content.style.opacity = '0';
            content.style.visibility = 'hidden';
            content.style.transform = 'translateX(-10px)';
            content.style.pointerEvents = 'none';
        });
    }
    
    // Gestion du deuxième niveau (submenu)
    submenuToggles.forEach(toggle => {
        const submenu = toggle.closest('.dropdown-submenu');
        const submenuContent = submenu.querySelector('.dropdown-submenu-content');
        
        // Gestion du survol (desktop)
        submenu.addEventListener('mouseenter', function() {
            clearTimeout(submenuTimeout);
            clearTimeout(subSubmenuTimeout);
            
            if (!isMobileDevice()) {
                // Fermer tous les autres sous-menus de même niveau
                document.querySelectorAll('.dropdown-submenu').forEach(otherSubmenu => {
                    if (otherSubmenu !== submenu) {
                        const otherContent = otherSubmenu.querySelector('.dropdown-submenu-content');
                        if (otherContent) {
                            otherContent.style.opacity = '0';
                            otherContent.style.visibility = 'hidden';
                            otherContent.style.transform = 'translateX(-10px)';
                            otherContent.style.pointerEvents = 'none';
                        }
                    }
                });
                
                // Fermer tous les sous-sous-menus
                closeAllSubSubmenus();
                
                // Ouvrir le sous-menu actuel
                submenuContent.style.opacity = '1';
                submenuContent.style.visibility = 'visible';
                submenuContent.style.transform = 'translateX(0)';
                submenuContent.style.pointerEvents = 'auto';
            }
        });
        
        submenu.addEventListener('mouseleave', function() {
            if (!isMobileDevice()) {
                submenuTimeout = setTimeout(() => {
                    submenuContent.style.opacity = '0';
                    submenuContent.style.visibility = 'hidden';
                    submenuContent.style.transform = 'translateX(-10px)';
                    submenuContent.style.pointerEvents = 'none';
                    
                    // Fermer aussi tous les sous-sous-menus
                    closeAllSubSubmenus();
                }, 300);
            }
        });
        
        submenuContent.addEventListener('mouseenter', function() {
            clearTimeout(submenuTimeout);
        });
        
        submenuContent.addEventListener('mouseleave', function() {
            if (!isMobileDevice()) {
                submenuTimeout = setTimeout(() => {
                    submenuContent.style.opacity = '0';
                    submenuContent.style.visibility = 'hidden';
                    submenuContent.style.transform = 'translateX(-10px)';
                    submenuContent.style.pointerEvents = 'none';
                    
                    // Fermer aussi tous les sous-sous-menus
                    closeAllSubSubmenus();
                }, 200);
            }
        });
        
        // Gestion du clic (mobile/tablette)
        toggle.addEventListener('click', function(e) {
            if (isMobileDevice()) {
                e.preventDefault();
                
                if (submenuContent.style.display === 'block') {
                    submenuContent.style.display = 'none';
                } else {
                    submenuContent.style.display = 'block';
                    submenuContent.style.opacity = '1';
                    submenuContent.style.visibility = 'visible';
                    submenuContent.style.transform = 'none';
                    submenuContent.style.pointerEvents = 'auto';
                }
            }
        });
    });
    
    // Gestion du troisième niveau (sub-submenu)
    subSubmenuToggles.forEach(toggle => {
        const subSubmenu = toggle.closest('.dropdown-sub-submenu');
        const subSubmenuContent = subSubmenu.querySelector('.dropdown-sub-submenu-content');
        
        // Gestion du survol (desktop)
        subSubmenu.addEventListener('mouseenter', function() {
            clearTimeout(subSubmenuTimeout);
            if (!isMobileDevice()) {
                subSubmenuContent.style.opacity = '1';
                subSubmenuContent.style.visibility = 'visible';
                subSubmenuContent.style.transform = 'translateX(0)';
                subSubmenuContent.style.pointerEvents = 'auto';
            }
        });
        
        subSubmenu.addEventListener('mouseleave', function() {
            if (!isMobileDevice()) {
                subSubmenuTimeout = setTimeout(() => {
                    subSubmenuContent.style.opacity = '0';
                    subSubmenuContent.style.visibility = 'hidden';
                    subSubmenuContent.style.transform = 'translateX(-10px)';
                    subSubmenuContent.style.pointerEvents = 'none';
                }, 300);
            }
        });
        
        subSubmenuContent.addEventListener('mouseenter', function() {
            clearTimeout(subSubmenuTimeout);
        });
        
        subSubmenuContent.addEventListener('mouseleave', function() {
            if (!isMobileDevice()) {
                subSubmenuTimeout = setTimeout(() => {
                    subSubmenuContent.style.opacity = '0';
                    subSubmenuContent.style.visibility = 'hidden';
                    subSubmenuContent.style.transform = 'translateX(-10px)';
                    subSubmenuContent.style.pointerEvents = 'none';
                }, 200);
            }
        });
        
        // Gestion du clic (mobile/tablette)
        toggle.addEventListener('click', function(e) {
            if (isMobileDevice()) {
                e.preventDefault();
                
                if (subSubmenuContent.style.display === 'block') {
                    subSubmenuContent.style.display = 'none';
                } else {
                    subSubmenuContent.style.display = 'block';
                    subSubmenuContent.style.opacity = '1';
                    subSubmenuContent.style.visibility = 'visible';
                    subSubmenuContent.style.transform = 'none';
                    subSubmenuContent.style.pointerEvents = 'auto';
                }
            }
        });
    });
    
    // Gestion des redimensionnements de fenêtre
    window.addEventListener('resize', function() {
        const allSubmenuContents = document.querySelectorAll('.dropdown-submenu-content, .dropdown-sub-submenu-content');
        
        allSubmenuContents.forEach(content => {
            if (isMobileDevice()) {
                content.style.opacity = '';
                content.style.visibility = '';
                content.style.transform = '';
                content.style.pointerEvents = '';
            } else {
                content.style.display = '';
            }
        });
    });

    // ========================================
    // PROTECTION ANTI-COPIE (Optionnel)
    // ========================================
    const articles = document.querySelectorAll('.simple-article, .story-body');
    
    articles.forEach(article => {
        // Désactiver le clic droit
        article.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    });

    // Désactiver les raccourcis clavier de copie
    document.addEventListener('keydown', function(e) {
        // Désactiver Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+P
        if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 65 || e.keyCode === 83 || e.keyCode === 80)) {
            e.preventDefault();
            return false;
        }
        // Désactiver F12 (outils de développement)
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Désactiver Ctrl+Shift+I (outils de développement)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        // Désactiver Ctrl+U (voir le code source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
    });

    // ========================================
    // FONCTION DE RECHERCHE
    // ========================================
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    // Base de données des contenus
    const contentDatabase = [
        // Articles
        {
            title: "World of Warcraft",
            url: "./lesarticles/worldofwarcraft.html",
            category: "Article",
            type: "article"
        },
        // Récits Fanfiction - Harry Potter
        {
            title: "L'invention du sortilège du parapluie",
            url: "./lesrecits/parapluie.html",
            category: "Fanfiction - Harry Potter",
            type: "recit"
        },
        {
            title: "Le journal d'un botaniste",
            url: "./lesrecits/botaniste.html",
            category: "Fanfiction - Harry Potter", 
            type: "recit"
        },
        {
            title: "Le journal intime de Nicolas Flamel",
            url: "./lesrecits/flamel.html",
            category: "Fanfiction - Harry Potter",
            type: "recit"
        },
        {
            title: "Le trésor des fondateurs",
            url: "./lesrecits/tresor-fondateurs.html",
            category: "Fanfiction - Harry Potter",
            type: "recit"
        },
        // Récits Fiction
        {
            title: "La grotte du loup",
            url: "./lesrecits/grotte-du-loup.html",
            category: "Fiction",
            type: "recit"
        },
        {
            title: "Le tableau frappeur",
            url: "./lesrecits/tableau-frappeur.html",
            category: "Fiction",
            type: "recit"
        }
    ];

    if (searchInput && searchResults) {
        // Fonction de recherche
        function performSearch(query) {
            if (query.length === 0) {
                searchResults.classList.remove('show');
                return;
            }

            const results = contentDatabase.filter(item => 
                item.title.toLowerCase().includes(query.toLowerCase())
            );

            displayResults(results, query);
        }

        // Fonction d'affichage des résultats
        function displayResults(results, query) {
            searchResults.innerHTML = '';

            if (results.length === 0) {
                searchResults.innerHTML = '<div class="search-no-results">Aucun résultat trouvé</div>';
                searchResults.classList.add('show');
                return;
            }

            results.forEach(item => {
                const resultItem = document.createElement('a');
                resultItem.href = item.url;
                resultItem.className = 'search-result-item';
                
                // Mettre en surbrillance le terme recherché
                const highlightedTitle = highlightText(item.title, query);
                
                resultItem.innerHTML = `
                    <div class="search-result-title">${highlightedTitle}</div>
                    <div class="search-result-category">${item.category}</div>
                `;

                // Fermer la recherche au clic
                resultItem.addEventListener('click', () => {
                    searchResults.classList.remove('show');
                    searchInput.value = '';
                });

                searchResults.appendChild(resultItem);
            });

            searchResults.classList.add('show');
        }

        // Fonction pour mettre en surbrillance le texte recherché
        function highlightText(text, query) {
            if (!query) return text;
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<strong style="color: #7ec3ff;">$1</strong>');
        }

        // Événements de recherche
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            performSearch(query);
        });

        // Fermer les résultats si on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('show');
            }
        });

        // Gestion des touches clavier
        searchInput.addEventListener('keydown', (e) => {
            const resultItems = searchResults.querySelectorAll('.search-result-item');
            
            if (e.key === 'Escape') {
                searchResults.classList.remove('show');
                searchInput.blur();
            } else if (e.key === 'Enter' && resultItems.length > 0) {
                // Aller au premier résultat
                resultItems[0].click();
            }
        });
    }
    
    // ========================================
    // EFFET LUMOS ANIMÉ POUR HARRY POTTER
    // ========================================
    
    // Créer l'élément Lumos
    const lumosOrb = document.createElement('div');
    lumosOrb.className = 'lumos-orb';
    lumosOrb.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, 
            rgba(255, 255, 255, 1) 0%, 
            rgba(255, 255, 255, 0.9) 20%, 
            rgba(240, 248, 255, 0.7) 40%, 
            rgba(200, 220, 255, 0.5) 60%, 
            rgba(150, 180, 255, 0.3) 80%, 
            transparent 100%);
        box-shadow: 
            0 0 10px rgba(255, 255, 255, 1),
            0 0 20px rgba(255, 255, 255, 0.8),
            0 0 30px rgba(240, 248, 255, 0.6),
            0 0 40px rgba(200, 220, 255, 0.4);
        pointer-events: none;
        z-index: 10000;
        opacity: 0;
        transform: scale(0.5);
        transition: opacity 0.3s ease, transform 0.3s ease;
    `;
    document.body.appendChild(lumosOrb);
    
    let lumosAnimation;
    let isLumosActive = false;
    
    // Animation de pulsation
    function animateLumos() {
        let scale = 0.8;
        let direction = 1;
        let opacity = 0.9;
        let opacityDirection = -1;
        
        lumosAnimation = setInterval(() => {
            scale += direction * 0.02;
            opacity += opacityDirection * 0.02;
            
            if (scale >= 1.2) direction = -1;
            if (scale <= 0.8) direction = 1;
            if (opacity >= 0.9) opacityDirection = -1;
            if (opacity <= 0.6) opacityDirection = 1;
            
            lumosOrb.style.transform = `scale(${scale})`;
            lumosOrb.style.opacity = opacity;
        }, 50);
    }
    
    // Fonction pour démarrer Lumos
    function startLumos() {
        if (!isLumosActive) {
            isLumosActive = true;
            lumosOrb.style.opacity = '0.8';
            lumosOrb.style.transform = 'scale(1)';
            animateLumos();
        }
    }
    
    // Fonction pour arrêter Lumos
    function stopLumos() {
        if (isLumosActive) {
            isLumosActive = false;
            clearInterval(lumosAnimation);
            lumosOrb.style.opacity = '0';
            lumosOrb.style.transform = 'scale(0.5)';
        }
    }
    
    // Suivre la position de la souris
    document.addEventListener('mousemove', (e) => {
        if (isLumosActive) {
            // Positionner l'orbe légèrement décalée par rapport au curseur (pour simuler le bout de la baguette)
            lumosOrb.style.left = (e.clientX - 25) + 'px';
            lumosOrb.style.top = (e.clientY - 25) + 'px';
        }
    });
    
    // Activer Lumos sur les récits Harry Potter (deux structures différentes)
    const harryPotterLinks = document.querySelectorAll('.dropdown-sub-submenu-content a, .dropdown-submenu-content a[href*="parapluie"], .dropdown-submenu-content a[href*="botaniste"], .dropdown-submenu-content a[href*="flamel"]');
    harryPotterLinks.forEach(link => {
        link.addEventListener('mouseenter', startLumos);
        link.addEventListener('mouseleave', stopLumos);
    });
    
    // S'assurer que Lumos s'arrête si on quitte complètement la zone
    document.addEventListener('mouseleave', stopLumos);
});
