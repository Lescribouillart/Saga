// Fonction pour dessiner un vortex cosmique unique (mélange Stargate + Porte des Ténèbres)
function drawBlackLiquidSurface(ctx, x, y, width, height, time) {
    // Centre de l'effet
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const maxRadius = Math.max(width, height) / 2;
    
    // Base cosmique très sombre
    ctx.fillStyle = '#000005';
    ctx.fillRect(x, y, width, height);
    
    ctx.save();
    
    // Gradient de base cosmique (du noir profond aux bords rougeâtres)
    ctx.globalAlpha = 0.8;
    let cosmicGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
    cosmicGradient.addColorStop(0, 'rgba(5, 0, 15, 1)');      // Centre très sombre
    cosmicGradient.addColorStop(0.4, 'rgba(20, 5, 25, 0.9)'); // Violet sombre
    cosmicGradient.addColorStop(0.7, 'rgba(60, 20, 10, 0.7)'); // Rouge sombre
    cosmicGradient.addColorStop(0.9, 'rgba(100, 40, 15, 0.5)'); // Orange/rouge des bords
    cosmicGradient.addColorStop(1, 'rgba(120, 60, 30, 0.3)');   // Bord orangé
    
    ctx.fillStyle = cosmicGradient;
    ctx.fillRect(x, y, width, height);
    
    // Particules d'étoiles scintillantes (style WoW)
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < 25; i++) {
        let starAngle = (time * 0.0003 + i * 0.8) % (Math.PI * 2);
        let starRadius = (Math.sin(time * 0.002 + i) * 0.3 + 0.7) * maxRadius * 0.8;
        let px = centerX + Math.cos(starAngle) * starRadius;
        let py = centerY + Math.sin(starAngle) * starRadius;
        
        if (px >= x && px <= x + width && py >= y && py <= y + height) {
            let brightness = Math.sin(time * 0.004 + i) * 0.5 + 0.5;
            let starSize = 1 + brightness * 2;
            
            // Étoile brillante
            ctx.fillStyle = `rgba(255, 220, 180, ${brightness * 0.8})`;
            ctx.beginPath();
            ctx.arc(px, py, starSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Halo autour de l'étoile
            ctx.globalAlpha = brightness * 0.3;
            ctx.fillStyle = `rgba(200, 150, 100, ${brightness * 0.4})`;
            ctx.beginPath();
            ctx.arc(px, py, starSize * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 0.9;
        }
    }
    
    // Vortex spiralé liquide (style Stargate mais adapté)
    for (let layer = 0; layer < 4; layer++) {
        ctx.globalAlpha = 0.15 - layer * 0.02;
        
        for (let angle = 0; angle < Math.PI * 2; angle += 0.12) {
            for (let radius = 20; radius < maxRadius * 0.9; radius += 18) {
                let rotationSpeed = (time * 0.0003) + (layer * 0.2);
                let waveOffset = Math.sin(radius * 0.015 + time * 0.001 + layer) * 8;
                let spiralAngle = angle + rotationSpeed + (radius * 0.003);
                
                let px = centerX + Math.cos(spiralAngle) * (radius + waveOffset);
                let py = centerY + Math.sin(spiralAngle) * (radius + waveOffset);
                
                if (px >= x && px <= x + width && py >= y && py <= y + height) {
                    // Couleurs qui évoluent du centre vers l'extérieur
                    let distanceFromCenter = Math.sqrt((px - centerX) ** 2 + (py - centerY) ** 2) / maxRadius;
                    
                    if (distanceFromCenter < 0.3) {
                        // Centre : tons violets/bleus mystiques
                        ctx.fillStyle = `rgba(60, 30, 120, ${0.4 - layer * 0.08})`;
                    } else if (distanceFromCenter < 0.6) {
                        // Milieu : transition violet-rouge
                        ctx.fillStyle = `rgba(80, 40, 60, ${0.3 - layer * 0.06})`;
                    } else {
                        // Extérieur : tons rouges/orangés
                        ctx.fillStyle = `rgba(120, 60, 30, ${0.25 - layer * 0.05})`;
                    }
                    
                    ctx.beginPath();
                    ctx.arc(px, py, 3 - layer * 0.3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    // Effet de profondeur central (trou noir cosmique)
    ctx.globalAlpha = 0.6;
    let voidGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.3);
    voidGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    voidGradient.addColorStop(0.7, 'rgba(10, 5, 20, 0.8)');
    voidGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = voidGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Affichage du décor du jeu dans le canevas
window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const frameHoverArea = document.getElementById('frameHoverArea');

    // Variables pour le contrôle du vortex
    let isHovering = false;

    // Gestion des événements de survol sur la zone HTML
    if (frameHoverArea) {
        frameHoverArea.addEventListener('mouseenter', function() {
            isHovering = true;
        });

        frameHoverArea.addEventListener('mouseleave', function() {
            isHovering = false;
        });
    }

    // Utiliser lemur.png comme fond du jeu
    const background = new Image();
    background.src = '../images/illustration/lemur.png';
    background.onload = function() {
        // Préparer l'image du cadre
        const cadre = new Image();
        cadre.src = '../images/illustration/cadre.png';

        // Position du cadre (calculée une seule fois)
        const cadreWidth = 220;
        const cadreHeight = 320;
        const cadreX = (canvas.width - cadreWidth) / 2;
        const cadreY = (canvas.height - cadreHeight) / 2 - 80;

        function drawScene(time) {
            // Dessin du fond
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(background, offsetX, offsetY, drawWidth, drawHeight);

            // Nuit : filtre bleu foncé
            ctx.save();
            ctx.globalAlpha = 0.45;
            ctx.fillStyle = '#0a1330';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            // Lueur diffuse sur les bords (torches hors champ)
            let gradLeft = ctx.createLinearGradient(0, 0, 200, 0);
            gradLeft.addColorStop(0, 'rgba(255,220,120,0.18)'); // jaune clair atténué
            gradLeft.addColorStop(0.4, 'rgba(255,180,60,0.10)'); // reflet orangé atténué
            gradLeft.addColorStop(0.7, 'rgba(255,140,40,0.05)'); // reflet orangé plus foncé atténué
            gradLeft.addColorStop(1, 'rgba(255,220,120,0)');
            ctx.save();
            ctx.globalAlpha = 0.7 + Math.sin(time/400)*0.08;
            ctx.fillStyle = gradLeft;
            ctx.fillRect(0, 0, 200, canvas.height);
            ctx.restore();

            let gradRight = ctx.createLinearGradient(canvas.width, 0, canvas.width-200, 0);
            gradRight = ctx.createLinearGradient(canvas.width, 0, canvas.width-200, 0);
            gradRight.addColorStop(0, 'rgba(255,220,120,0.18)'); // jaune clair atténué
            gradRight.addColorStop(0.4, 'rgba(255,180,60,0.10)'); // reflet orangé atténué
            gradRight.addColorStop(0.7, 'rgba(255,140,40,0.05)'); // reflet orangé plus foncé atténué
            gradRight.addColorStop(1, 'rgba(255,220,120,0)');
            ctx.save();
            ctx.globalAlpha = 0.7 + Math.cos(time/400)*0.08;
            ctx.fillStyle = gradRight;
            ctx.fillRect(canvas.width-200, 0, 200, canvas.height);
            ctx.restore();

            let gradTop = ctx.createLinearGradient(0, 0, 0, 160);
            gradTop.addColorStop(0, 'rgba(255,220,120,0.13)');
            gradTop.addColorStop(1, 'rgba(255,220,120,0)');
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(time/600)*0.05;
            ctx.fillStyle = gradTop;
            ctx.fillRect(0, 0, canvas.width, 160);
            ctx.restore();

            let gradBottom = ctx.createLinearGradient(0, canvas.height, 0, canvas.height-160);
            gradBottom.addColorStop(0, 'rgba(255,220,120,0.13)');
            gradBottom.addColorStop(1, 'rgba(255,220,120,0)');
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.cos(time/600)*0.05;
            ctx.fillStyle = gradBottom;
            ctx.fillRect(0, canvas.height-160, canvas.width, 160);
            ctx.restore();

            // Afficher le cadre au centre du mur
            if (cadre.complete && cadre.naturalWidth > 0) {
                // Dessiner d'abord le cadre
                ctx.drawImage(cadre, cadreX, cadreY, cadreWidth, cadreHeight);
                
                // Afficher un fond noir à l'intérieur du cadre par défaut
                const marginX = 20;
                const marginY = 30;
                const innerX = cadreX + marginX;
                const innerY = cadreY + marginY;
                const innerWidth = cadreWidth - (marginX * 2);
                const innerHeight = cadreHeight - (marginY * 2);
                
                if (!isHovering) {
                    // Fond noir simple quand on ne survole pas
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(innerX, innerY, innerWidth, innerHeight);
                } else {
                    // L'effet Stargate à l'intérieur du cadre seulement si on survole
                    drawBlackLiquidSurface(ctx, innerX, innerY, innerWidth, innerHeight, time);
                }
                
                // TEST TEMPORAIRE : Afficher le vortex en permanence pour tester
                // Décommentez la ligne suivante pour tester si le vortex fonctionne
                // drawBlackLiquidSurface(ctx, innerX, innerY, innerWidth, innerHeight, time);
            }
        }

        // Calcul du ratio de l'image
        const imgRatio = background.width / background.height;
        const canvasRatio = canvas.width / canvas.height;
        let drawWidth, drawHeight, offsetX, offsetY;
        let scale = Math.max(canvas.width / background.width, canvas.height / background.height);
        drawWidth = background.width * scale;
        drawHeight = background.height * scale;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = (canvas.height - drawHeight) / 2;

        // Animation
        function animate(time) {
            drawScene(time);
            requestAnimationFrame(animate);
        }
        animate(0);
    };
};

