const JSONBIN_URL = "https://api.jsonbin.io/v3/b/679a7e77e41b4d34e480d272";
const JSONBIN_API_KEY = "$2a$10$4Ska2vFvhAi3cAtkswIlbO/HCFIQMoRFjlSK/15F763tDNEm0M5ou";

let recettes = [];
let currentEditIndex = null;

// Fonctions utilitaires
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => errorDiv.style.display = 'none', 3000);
}

// Mode sombre
let darkModeActive = localStorage.getItem("darkMode") === "true";
document.body.classList.toggle("dark-mode", darkModeActive);

document.getElementById("toggle-darkmode").addEventListener("click", () => {
  darkModeActive = !darkModeActive;
  localStorage.setItem("darkMode", darkModeActive);
  document.body.classList.toggle("dark-mode", darkModeActive);
});

// Charger les recettes depuis JSONbin
async function chargerRecettesDepuisJSONbin() {
  try {
    document.getElementById('loading').style.display = 'block';
    const reponse = await fetch(`${JSONBIN_URL}/latest`, {
      headers: { "X-Master-Key": JSONBIN_API_KEY }
    });
    const data = await reponse.json();
    recettes = data.record.recettes || [];
    afficherRecettes();
  } catch (e) {
    showError("Erreur de chargement des recettes");
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

// Sauvegarder les recettes sur JSONbin
async function sauvegarderRecettesSurJSONbin() {
  try {
    await fetch(JSONBIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY
      },
      body: JSON.stringify({ recettes })
    });
  } catch (e) {
    showError("Erreur de sauvegarde des recettes");
  }
}

// Afficher les recettes
function afficherRecettes() {
  const listeRecettes = document.getElementById("liste-recettes");
  listeRecettes.innerHTML = "";

  const data = filtrerRecettes();
  if (data.length === 0) {
    listeRecettes.innerHTML = "<p>Aucune recette trouvée.</p>";
    return;
  }

  data.forEach((recette, index) => {
    const divRecette = document.createElement("div");
    divRecette.className = "recette";
    divRecette.innerHTML = `
      <button class="btn-delete" aria-label="Supprimer">&times;</button>
      <h3>${recette.titre}</h3>
      <p><strong>Auteur :</strong> ${recette.auteur}</p>
      <p><strong>Difficulté :</strong> ${recette.difficulty}/5</p>
      <h4>Ingrédients</h4>
      <pre>${recette.ingredients}</pre>
      <h4>Étapes</h4>
      <pre>${recette.etapes}</pre>
      <button class="btn-edit">Modifier</button>
    `;

    divRecette.querySelector('.btn-delete').addEventListener('click', () => supprimerRecette(index));
    divRecette.querySelector('.btn-edit').addEventListener('click', () => openEditModal(index));
    listeRecettes.appendChild(divRecette);
  });
}

// Filtrer les recettes
function filtrerRecettes() {
  const searchTerm = document.getElementById("search-input").value.toLowerCase();
  return recettes.filter(r => {
    const content = `${r.titre} ${r.ingredients} ${r.etapes}`.toLowerCase();
    return content.includes(searchTerm);
  });
}

// Supprimer une recette
function supprimerRecette(index) {
  recettes.splice(index, 1);
  sauvegarderRecettesSurJSONbin();
  afficherRecettes();
}

// Ouvrir la modale d'édition
function openEditModal(index) {
  currentEditIndex = index;
  const recette = recettes[index];
  
  document.getElementById('edit-titre').value = recette.titre;
  document.getElementById('edit-difficulty').value = recette.difficulty;
  document.getElementById('edit-auteur').value = recette.auteur;
  document.getElementById('edit-ingredients').value = recette.ingredients;
  document.getElementById('edit-etapes').value = recette.etapes;
  
  document.getElementById('editModal').style.display = 'block';
}

// Fermer la modale d'édition
function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

// Gestion de la modale
document.getElementById('closeModal').addEventListener('click', closeEditModal);
window.onclick = e => e.target === document.getElementById('editModal') && closeEditModal();

// Soumission du formulaire d'édition
document.getElementById('formulaire-edit').addEventListener('submit', e => {
  e.preventDefault();
  
  const updatedRecette = {
    titre: document.getElementById('edit-titre').value.trim(),
    difficulty: parseInt(document.getElementById('edit-difficulty').value),
    auteur: document.getElementById('edit-auteur').value.trim(),
    ingredients: document.getElementById('edit-ingredients').value.trim(),
    etapes: document.getElementById('edit-etapes').value.trim()
  };

  if (currentEditIndex !== null) {
    recettes[currentEditIndex] = updatedRecette;
    sauvegarderRecettesSurJSONbin();
    afficherRecettes();
    closeEditModal();
  }
});

// Soumission du formulaire d'ajout
document.getElementById("formulaire-recette").addEventListener("submit", async e => {
  e.preventDefault();

  const titre = document.getElementById("titre").value.trim();
  const difficulty = parseInt(document.getElementById("difficulty").value);
  const auteur = document.getElementById("auteur").value.trim();
  const ingredients = document.getElementById("ingredients").value.trim();
  const etapes = document.getElementById("etapes").value.trim();

  if (!titre || !auteur || !ingredients || !etapes) {
    showError("Tous les champs sont obligatoires");
    return;
  }

  if (difficulty < 1 || difficulty > 5) {
    showError("La difficulté doit être entre 1 et 5");
    return;
  }

  recettes.push({ titre, difficulty, auteur, ingredients, etapes });
  await sauvegarderRecettesSurJSONbin();
  afficherRecettes();
  e.target.reset();
});

// Initialisation
window.onload = chargerRecettesDepuisJSONbin;
