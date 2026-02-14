class DialogueSystem {
    constructor() {
        this.isDialogueActive = false;
        this.typewriterSpeed = 2; // Très rapide : 2ms par caractère
        this.currentDialogue = '';
    }

    showDialogue(text, characterName = 'Sorcier') {
        if (this.isDialogueActive) return;
        
        this.isDialogueActive = true;
        this.currentDialogue = text;
        
        const dialogueBox = document.createElement('div');
        dialogueBox.id = 'dialogue-box';
        
        dialogueBox.innerHTML = `
            <div class="dialogue-text" id="dialogue-text"></div>
            <div class="dialogue-continue">Cliquez pour continuer...</div>
        `;
        
        document.body.appendChild(dialogueBox);
        
        setTimeout(() => {
            dialogueBox.classList.add('show');
            this.typewriterEffect(text);
        }, 100);
        
        dialogueBox.addEventListener('click', () => {
            this.closeDialogue();
        });
        
        document.addEventListener('keydown', this.handleEscape.bind(this));
    }
    
    typewriterEffect(text) {
        const textElement = document.getElementById('dialogue-text');
        let index = 0;
        
        const typeInterval = setInterval(() => {
            // Ajouter 8 caractères à la fois pour un effet presque instantané
            for (let i = 0; i < 8 && index < text.length; i++) {
                textElement.textContent += text[index];
                index++;
            }
            
            if (index >= text.length) {
                clearInterval(typeInterval);
                document.querySelector('.dialogue-continue').style.opacity = '1';
            }
        }, this.typewriterSpeed);
    }
    
    closeDialogue() {
        const dialogueBox = document.getElementById('dialogue-box');
        if (dialogueBox) {
            dialogueBox.classList.add('hide');
            setTimeout(() => {
                dialogueBox.remove();
                this.isDialogueActive = false;
            }, 300);
        }
        document.removeEventListener('keydown', this.handleEscape.bind(this));
    }
    
    handleEscape(event) {
        if (event.key === 'Escape') {
            this.closeDialogue();
        }
    }
}

const dialogueSystem = new DialogueSystem();

// Texte du sorcier
const sorcierDialogue = `Bonjour __nom du personnage__ !

Si vous avez réussi à franchir le portail, c'est que votre esprit a enfin saisi la vraie nature de ce monde. Seuls les sorciers sont capables d'arriver jusqu'ici. Ils se divisent en plusieurs classes : nécromancien, druide, chaman, alchimiste, enchanteur, occultiste, élémentaliste, thaumaturge, et démonologue. Une seule de ces disciplines est faite pour vous.

Mais, n'ayez crainte, vous trouverez votre voie bien assez tôt. Pour le moment il vous reste encore beaucoup à apprendre…

Tout devient soudainement blanc autour de vous… Quelques secondes plus tard, vous vous réveillez chez vous.`;

// Fonction pour remplacer le nom du personnage dans le dialogue
function getPersonalizedDialogue(playerName = '') {
    if (playerName.trim() === '') {
        playerName = 'jeune apprenti';
    }
    return sorcierDialogue.replace('__nom du personnage__', playerName);
}

// Fonction pour afficher le dialogue sans titre
function showSorcierDialogue() {
    const playerName = document.getElementById('char-name')?.value || '';
    const personalizedText = getPersonalizedDialogue(playerName);
    dialogueSystem.showDialogue(personalizedText, ''); // Chaîne vide pour supprimer le titre
}
// Fonction pour afficher le dialogue sans titre
function showSorcierDialogue() {
    const playerName = document.getElementById('char-name')?.value || '';
    const personalizedText = getPersonalizedDialogue(playerName);
    dialogueSystem.showDialogue(personalizedText, ''); // Chaîne vide pour supprimer le titre
}
