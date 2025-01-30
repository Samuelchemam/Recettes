// ==================================
// Configuration Firebase
// ==================================
const firebaseConfig = {
  apiKey: "AIzaSyAm_iCfNAKBb4KE_UhCDFq25ZA0Q0-MNfA",
  authDomain: "site-web-recettes.firebaseapp.com",
  databaseURL: "https://site-web-recettes-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "site-web-recettes",
  storageBucket: "site-web-recettes.firebasestorage.app",
  messagingSenderId: "616026617837",
  appId: "1:616026617837:web:8de2604f97a5633094d9e4",
  measurementId: "G-9R9TMNM9JY"
};

// ==================================
// Initialiser Firebase
// ==================================
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let recettes = [];
let currentEditIndex = null;

// ==================================
// Gestion des erreurs
// ==================================
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => (errorDiv.style.display = 'none'), 3000);
}

// ==================================
// Mode sombre
// ==================================
document.getElementById('toggle-darkmode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// ==================================
// Charger les recettes depuis Firebase
// ==================================
async function chargerRecettes() {
  try {
    // Récupère un instantané des données
    const snapshot = await database.ref('recettes').once('value');

    // Si rien dans la DB, snapshot.val() sera null
    recettes = snapshot.val() || [];
    
    // Si "recettes" est un objet (car .set() stocke un tableau) c'est correct
    // firebase stocke un objet ou un tableau ; ici nous gardons un tableau.
    afficherRecettes();
  } catch (error) {
    showError("Impossible de charger les recettes");
    console.error("Erreur:", error);
  }
}

// ==================================
// Ajouter une recette et sauvegarder
// ==================================
async function ajouterRecetteEtSauvegarder() {
  try {
    const nouvelleRecette = {
      titre: document.getElementById('titre').value.trim(),
      auteur: document.getElementById('auteur').value.trim(),
      difficulty: parseInt(document.getElementById('difficulty').value),
      ingredients: document.getElementById('ingredients').value.trim(),
      etapes: document.getElementById('etapes').value.trim()
    };

    // Vérif champs obligatoires
    if (Object.values(nouvelleRecette).some(v => !v)) {
      showError("Tous les champs sont obligatoires !");
      return;
    }

    // Ajoute la recette dans notre variable locale
    recettes.push(nouvelleRecette);

    // Sauvegarde le tableau complet dans Firebase
    await sauvegarderRecettes();

    // Rafraîchir l'affichage
    afficherRecettes();

    // Réinitialiser le formulaire
    document.getElementById('formulaire-recette').reset();
  } catch (error) {
    showError("Erreur lors de l'ajout de la recette");
    console.error(error);
  }
}

// ==================================
// Sauvegarder le tableau complet
// ==================================
async function sauvegarderRecettes() {
  try {
    // On écrase le nœud "recettes" avec notre tableau
    await database.ref('recettes').set(recettes);
    console.log("Sauvegarde réussie !");
  } catch (error) {
    showError("Échec de la sauvegarde");
    console.error("Erreur:", error);
  }
}

// ==================================
// Afficher les recettes
// ==================================
function afficherRecettes() {
  const container = document.getElementById('liste-recettes');
  container.innerHTML = recettes
    .map((recette, index) => `
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
    `)
    .join('');
}

// ==================================
// Formulaire d'ajout
// ==================================
document.getElementById('formulaire-recette').addEventListener('submit', async e => {
  e.preventDefault();
  await ajouterRecetteEtSauvegarder();
});

// ==================================
// Ouvrir la modale d'édition
// ==================================
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

// ==================================
// Édition de recette
// ==================================
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

// ==================================
// Suppression d'une recette
// ==================================
function supprimerRecette(index) {
  recettes.splice(index, 1);
  sauvegarderRecettes();
  afficherRecettes();
}

// ==================================
// Fermer la modale d'édition
// ==================================
document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('editModal').style.display = 'none';
});

// ==================================
// Initialisation au chargement
// ==================================
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

// Charger les recettes existantes depuis Firebase
chargerRecettes();
