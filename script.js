const JSONBIN_URL = "https://api.jsonbin.io/v3/b/679a7e77e41b4d34e480d272";
const JSONBIN_API_KEY = "$2a$10$4Ska2vFvhAi3cAtkswIlbO/HCFIQMoRFjlSK/15F763tDNEm0M5ou";

let recettes = [];
let currentEditIndex = null;

// Gestion d'erreurs
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
    const response = await fetch(`${JSONBIN_URL}/latest`, {
      headers: { "X-Master-Key": JSONBIN_API_KEY }
    });
    const data = await response.json();
    recettes = data.record?.recettes || [];
    afficherRecettes();
  } catch (error) {
    showError("Erreur de chargement : " + error.message);
  }
}

// Sauvegarder les recettes
async function sauvegarderRecettes() {
  try {
    await fetch(JSONBIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY
      },
      body: JSON.stringify({ recettes })
    });
  } catch (error) {
    showError("Erreur de sauvegarde : " + error.message);
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

// Gestion formulaire
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

// Gestion édition
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
