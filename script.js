/***************************************
 *         script.js
 *  Avec le champ "auteur"
 ***************************************/

let recettes = chargerRecettes() || [];

/**
 * Charge les recettes depuis localStorage
 */
function chargerRecettes() {
  try {
    const data = localStorage.getItem("recettes");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Erreur lors du chargement des recettes :", e);
    return null;
  }
}

/**
 * Sauvegarde le tableau recettes dans localStorage
 */
function sauvegarderRecettes() {
  try {
    localStorage.setItem("recettes", JSON.stringify(recettes));
  } catch (e) {
    console.error("Erreur lors de la sauvegarde des recettes :", e);
  }
}

/**
 * Protège contre d'éventuelles injections HTML
 */
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**************************************
 * 1. Mode sombre
 **************************************/
let darkModeActive = localStorage.getItem("darkMode") === "true";
if (darkModeActive) {
  document.body.classList.add("dark-mode");
}

document.getElementById("toggle-darkmode").addEventListener("click", () => {
  darkModeActive = !darkModeActive;
  localStorage.setItem("darkMode", darkModeActive);
  document.body.classList.toggle("dark-mode", darkModeActive);
});

/**************************************
 * 2. Recherche
 **************************************/
const searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", afficherRecettes);

function filtrerRecettes() {
  const searchTerm = searchInput.value.toLowerCase();
  return recettes.filter((r) => {
    // Vérifie si le titre ou les ingrédients contiennent le terme
    const inTitre = r.titre.toLowerCase().includes(searchTerm);
    const inIngr = r.ingredients.toLowerCase().includes(searchTerm);
    return inTitre || inIngr;
  });
}

/**************************************
 * 3. Affichage de la liste
 **************************************/
const listeRecettes = document.getElementById("liste-recettes");

function afficherRecettes() {
  listeRecettes.innerHTML = "";
  const data = filtrerRecettes();

  if (data.length === 0) {
    const p = document.createElement("p");
    p.textContent = "Aucune recette ne correspond à votre recherche.";
    listeRecettes.appendChild(p);
    return;
  }

  data.forEach((recette) => {
    const divRecette = document.createElement("div");
    divRecette.classList.add("recette");

    // Échapper les champs
    const titreEchappe = escapeHTML(recette.titre);
    const auteurEchappe = escapeHTML(recette.auteur || "Inconnu");
    const ingredientsEchappes = escapeHTML(recette.ingredients);
    const etapesEchappees = escapeHTML(recette.etapes);

    // Construction de la tuile
    divRecette.innerHTML = `
      <button class="btn-delete" aria-label="Supprimer la recette">&times;</button>
      <h3 class="recette-titre">${titreEchappe}</h3>

      <!-- Affichage de l'auteur -->
      <p class="author">Recette proposée par : ${auteurEchappe}</p>

      <div class="recette-details">
        <label class="difficulty-label">
          Difficulté :
          <select class="difficulty-select">
            <option value="1">1 (très facile)</option>
            <option value="2">2</option>
            <option value="3">3 (moyenne)</option>
            <option value="4">4</option>
            <option value="5">5 (difficile)</option>
          </select>
        </label>

        <h4>Ingrédients</h4>
        <p>${ingredientsEchappes.replace(/\n/g, "<br>")}</p>

        <h4>Étapes</h4>
        <p>${etapesEchappees.replace(/\n/g, "<br>")}</p>

        <button class="btn-tutoriel">Tutoriel</button>
        <button class="btn-edit">Modifier</button>
      </div>
    `;

    // Gérer l'ouverture/fermeture des détails
    const details = divRecette.querySelector(".recette-details");
    details.style.maxHeight = "0";
    details.style.overflow = "hidden";

    divRecette.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("btn-delete") ||
        e.target.classList.contains("btn-edit") ||
        e.target.classList.contains("btn-tutoriel") ||
        e.target.classList.contains("difficulty-select")
      ) {
        return; 
      }
      toggleDetails(details);
    });

    // Bouton supprimer
    const btnDelete = divRecette.querySelector(".btn-delete");
    btnDelete.addEventListener("click", (e) => {
      e.stopPropagation();
      const realIndex = recettes.indexOf(recette);
      if (realIndex !== -1) {
        recettes.splice(realIndex, 1);
        sauvegarderRecettes();
        afficherRecettes();
      }
    });

    // Bouton éditer
    const btnEdit = divRecette.querySelector(".btn-edit");
    btnEdit.addEventListener("click", (e) => {
      e.stopPropagation();
      ouvrirEdition(recette);
    });

    // Bouton tutoriel
    const btnTutoriel = divRecette.querySelector(".btn-tutoriel");
    btnTutoriel.addEventListener("click", (e) => {
      e.stopPropagation();
      demarrerTutoriel(recette);
    });

    // Sélecteur de difficulté
    const difficultySelect = divRecette.querySelector(".difficulty-select");
    difficultySelect.value = recette.difficulty.toString();
    difficultySelect.addEventListener("change", (ev) => {
      recette.difficulty = parseInt(ev.target.value, 10);
      sauvegarderRecettes();
    });

    listeRecettes.appendChild(divRecette);
  });
}

function toggleDetails(details) {
  if (details.classList.contains("show")) {
    details.style.maxHeight = details.scrollHeight + "px";
    details.offsetHeight; // force reflow
    details.style.maxHeight = "0";
    details.classList.remove("show");
  } else {
    details.classList.add("show");
    details.style.maxHeight = details.scrollHeight + "px";
  }
}

/**************************************
 * 4. Ajout de recette
 **************************************/
document.getElementById("formulaire-recette").addEventListener("submit", function (e) {
  e.preventDefault();

  const titre = document.getElementById("titre").value.trim();
  const difficulty = parseInt(document.getElementById("difficulty").value.trim(), 10);
  const auteur = document.getElementById("auteur").value.trim();
  const ingredients = document.getElementById("ingredients").value.trim();
  const etapes = document.getElementById("etapes").value.trim();

  if (!titre || !difficulty || !auteur || !ingredients || !etapes) {
    alert("Veuillez remplir tous les champs obligatoires.");
    return;
  }

  const nouvelleRecette = {
    titre,
    difficulty,
    auteur,
    ingredients,
    etapes
  };

  recettes.push(nouvelleRecette);
  sauvegarderRecettes();
  afficherRecettes();
  this.reset();
});

/**************************************
 * 5. Édition (modale)
 **************************************/
const editModal = document.getElementById("editModal");
const closeModal = document.getElementById("closeModal");
const formulaireEdit = document.getElementById("formulaire-edit");

let recetteEnCours = null;

function ouvrirEdition(recette) {
  recetteEnCours = recette;

  // Pré-remplir
  document.getElementById("edit-titre").value = recette.titre;
  document.getElementById("edit-difficulty").value = recette.difficulty;
  document.getElementById("edit-auteur").value = recette.auteur || "";
  document.getElementById("edit-ingredients").value = recette.ingredients;
  document.getElementById("edit-etapes").value = recette.etapes;

  // Ouvrir la modale
  editModal.classList.add("show");
}

// Fermer manuellement (croix)
closeModal.addEventListener("click", () => {
  editModal.classList.remove("show");
  recetteEnCours = null;
});

// Fermer en cliquant hors du contenu
window.addEventListener("click", (e) => {
  if (e.target === editModal) {
    editModal.classList.remove("show");
    recetteEnCours = null;
  }
});

// Sauvegarder modifications
formulaireEdit.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!recetteEnCours) return;

  recetteEnCours.titre = document.getElementById("edit-titre").value.trim();
  recetteEnCours.difficulty = parseInt(document.getElementById("edit-difficulty").value.trim(), 10);
  recetteEnCours.auteur = document.getElementById("edit-auteur").value.trim();
  recetteEnCours.ingredients = document.getElementById("edit-ingredients").value.trim();
  recetteEnCours.etapes = document.getElementById("edit-etapes").value.trim();

  sauvegarderRecettes();
  afficherRecettes();
  editModal.classList.remove("show");
  recetteEnCours = null;
});

/**************************************
 * 6. Tutoriel pas-à-pas
 **************************************/
function demarrerTutoriel(recette) {
  const steps = recette.etapes.split("\n").filter(s => s.trim().length > 0);
  if (steps.length === 0) {
    alert("Cette recette ne contient pas d'étapes claires.");
    return;
  }

  let currentStep = 0;
  const overlay = document.createElement("div");
  overlay.classList.add("tutorial-overlay");

  const tutorielBox = document.createElement("div");
  tutorielBox.classList.add("tutorial-box");

  const titre = document.createElement("h3");
  titre.textContent = `Tutoriel : ${recette.titre}`;
  tutorielBox.appendChild(titre);

  const stepText = document.createElement("p");
  stepText.classList.add("tutorial-step");
  tutorielBox.appendChild(stepText);

  const btnSuivant = document.createElement("button");
  btnSuivant.textContent = "Étape suivante";
  btnSuivant.classList.add("btn-tutoriel-suivant");
  tutorielBox.appendChild(btnSuivant);

  const btnQuitter = document.createElement("button");
  btnQuitter.textContent = "Quitter";
  btnQuitter.classList.add("btn-tutoriel-quitter");
  tutorielBox.appendChild(btnQuitter);

  overlay.appendChild(tutorielBox);
  document.body.appendChild(overlay);

  function afficherEtape(index) {
    stepText.textContent = `Étape ${index + 1}/${steps.length} : ${steps[index]}`;
  }
  afficherEtape(currentStep);

  btnSuivant.addEventListener("click", () => {
    currentStep++;
    if (currentStep < steps.length) {
      afficherEtape(currentStep);
    } else {
      alert("Fin du tutoriel !");
      document.body.removeChild(overlay);
    }
  });

  btnQuitter.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });
}

/**************************************
 * 7. Initialisation
 **************************************/
window.onload = afficherRecettes;
