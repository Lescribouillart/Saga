// Fichier vidé - toutes les fonctions qui généraient "Bienvenue Aventurier" sont supprimées

// TOUTES LES FONCTIONS SUPPRIMÉES :
// - showCharacterSummary()
// - displayCharacterInfo() 
// - createSummaryModal()
// - etc.

console.log('character-display.js chargé - fonctions de récapitulatif supprimées');

// Afficher/cacher l'image selon le type sélectionné
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('char-type').addEventListener('change', function() {
        const characterImage = document.getElementById('characterImage');
        if (this.value === 'sorcier') {
            characterImage.style.display = 'block';
        } else {
            characterImage.style.display = 'none';
        }
    });
});
