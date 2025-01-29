const JSONBIN_URL = "https://api.jsonbin.io/v3/b/679a9300e41b4d34e480dbc8"; // URL complète
const JSONBIN_MASTER_KEY = "$2a$10$4Ska2vFvhAi3cAtkswIlbO/HCFIQMoRFjlSK/15F763tDNEm0M5ou";
const JSONBIN_ACCESS_KEY = "$2a$10$ucyKYm/o7HXEYZaOvTDsne2g5JVgHjcMarsDJQ6zbeqkhh4VCTu5W";

let recettes = [];
let currentEditIndex = null;
const jsonbinHeaders = {
  "Content-Type": "application/json",
  "X-Master-Key": JSONBIN_MASTER_KEY,
  "X-Access-Key": JSONBIN_ACCESS_KEY
};

// Gestion des erreurs
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => errorDiv.style.display = 'none', 3000);
}

// Mode sombre
document.getElementById('toggle-darkmode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Charger les recettes
async function chargerRecettes() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: jsonbinHeaders
    });
    
    if (!response.ok) throw new Error('Erreur de chargement');
    
    const data = await response.json();
    recettes = data.record?.recettes || [];
    
    if (!recettes.length) {
      await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
        method: "PUT",
        headers: jsonbinHeaders,
        body: JSON.stringify({ recettes: [] })
      });
    }
    
    afficherRecettes();
  } catch (error) {
    showError("Impossible de charger les recettes");
    console.error("Erreur:", error);
  }
}

// Sauvegarder les recettes
async function sauvegarderRecettes() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: "PUT",
      headers: jsonbinHeaders,
      body: JSON.stringify({ recettes })
    });
    
    if (!response.ok) throw new Error('Erreur de sauvegarde');
    
    console.log("Sauvegarde réussie !");
  } catch (error) {
    showError("Échec de la sauvegarde");
    console.error("Erreur:", error);
  }
}

// Afficher les recettes
function afficherRecettes() {
  const container = document.getElementById('liste-recettes');
  container.innerHTML = recettes.map((recette, index) => `
    <div class="recette">
      <button class="btn-delete" onclick="supprimerRecette(${index})">×</button>
      <h3>${recette.titre}</h3>
      <p class="auteur">👨🍳 ${recette.auteur}</p>
      <p class="difficulte">${'⭐'.repeat(recette.difficulty)}</p>
      <div class="ingredients">
        <h4>Ingrédients :</h4>
        <pre>${recette.ingredients}</pre>
      </div>
      <div class="etapes">
        <h4>Préparation :</h4>
        <pre>${recette.etapes}</pre>
      </div>
      <button class="btn-edit" onclick="ouvrirModaleEdition(${index})">✏️ Modifier</button>
    </div>
  `).join('');
}

// Gestion formulaire d'ajout
document.getElementById('formulaire-recette').addEventListener('submit', async e => {
  e.preventDefault();

  const nouvelleRecette = {
    titre: document.getElementById('titre').value.trim(),
    auteur: document.getElementById('auteur').value.trim(),
    difficulty: parseInt(document.getElementById('difficulty').value),
    ingredients: document.getElementById('ingredients').value.trim(),
    etapes: document.getElementById('etapes').value.trim()
  };

  if (Object.values(nouvelleRecette).some(v => !v)) {
    showError("Tous les champs sont obligatoires !");
    return;
  }

  recettes.push(nouvelleRecette);
  await sauvegarderRecettes();
  afficherRecettes();
  e.target.reset();
});

// Modale d'édition
function ouvrirModaleEdition(index) {
  currentEditIndex = index;
  const recette = recettes[index];
  
  document.getElementById('edit-titre').value = recette.titre;
  document.getElementById('edit-auteur').value = recette.auteur;
  document.getElementById('edit-difficulty').value = recette.difficulty;
  document.getElementById('edit-ingredients').value = recette.ingredients;
  document.getElementById('edit-etapes').value = recette.etapes;
  
  document.getElementById('editModal').style.display = 'flex';
}

document.getElementById('formulaire-edit').addEventListener('submit', async e => {
  e.preventDefault();
  
  const recetteModifiee = {
    titre: document.getElementById('edit-titre').value.trim(),
    auteur: document.getElementById('edit-auteur').value.trim(),
    difficulty: parseInt(document.getElementById('edit-difficulty').value),
    ingredients: document.getElementById('edit-ingredients').value.trim(),
    etapes: document.getElementById('edit-etapes').value.trim()
  };

  recettes[currentEditIndex] = recetteModifiee;
  await sauvegarderRecettes();
  afficherRecettes();
  document.getElementById('editModal').style.display = 'none';
});

// Suppression
function supprimerRecette(index) {
  recettes.splice(index, 1);
  sauvegarderRecettes();
  afficherRecettes();
}

// Fermer modale
document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('editModal').style.display = 'none';
});

// Initialisation
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}
chargerRecettes();
