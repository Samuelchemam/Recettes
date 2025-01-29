/***************************************
 *         script.js (finalisé)
 ***************************************/

// URL de ton bin JSONbin.io et ta clé API
const JSONBIN_URL = "https://api.jsonbin.io/v3/b/679a7e77e41b4d34e480d272";
const JSONBIN_API_KEY = "$2a$10$4Ska2vFvhAi3cAtkswIlbO/HCFIQMoRFjlSK/15F763tDNEm0M5ou";

// Tableau local des recettes
let recettes = [];

/**************************************
 * Charger les recettes depuis JSONbin
 **************************************/
async function chargerRecettesDepuisJSONbin() {
    try {
        const reponse = await fetch(`${JSONBIN_URL}/latest`, {
            headers: {
                "X-Master-Key": JSONBIN_API_KEY
            }
        });
        const data = await reponse.json();
        recettes = data.record.recettes || [];
        afficherRecettes(); // Afficher les recettes après le chargement
    } catch (e) {
        console.error("Erreur de chargement depuis JSONbin :", e);
    }
}

/**************************************
 * Sauvegarder les recettes sur JSONbin
 **************************************/
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
        console.log("Recettes sauvegardées sur JSONbin !");
    } catch (e) {
        console.error("Erreur lors de la sauvegarde :", e);
    }
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
 * 2. Affichage des recettes filtrées
 **************************************/
const searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", afficherRecettes);

function filtrerRecettes() {
    const searchTerm = searchInput.value.toLowerCase();
    return recettes.filter((r) => r.titre.toLowerCase().includes(searchTerm) || r.ingredients.toLowerCase().includes(searchTerm));
}

/**************************************
 * 3. Affichage de la liste des recettes
 **************************************/
function afficherRecettes() {
    const listeRecettes = document.getElementById("liste-recettes");
    listeRecettes.innerHTML = "";

    const data = filtrerRecettes();
    if (data.length === 0) {
        listeRecettes.innerHTML = "<p>Aucune recette ne correspond à votre recherche.</p>";
        return;
    }

    data.forEach((recette) => {
        const divRecette = document.createElement("div");
        divRecette.classList.add("recette");
        divRecette.innerHTML = `
            <h3>${recette.titre}</h3>
            <p><strong>Auteur :</strong> ${recette.auteur}</p>
            <p><strong>Difficulté :</strong> ${recette.difficulty}/5</p>
            <h4>Ingrédients</h4>
            <p>${recette.ingredients.replace(/\n/g, "<br>")}</p>
            <h4>Étapes</h4>
            <p>${recette.etapes.replace(/\n/g, "<br>")}</p>
        `;

        listeRecettes.appendChild(divRecette);
    });
}

/**************************************
 * 4. Ajout d’une nouvelle recette
 **************************************/
document.getElementById("formulaire-recette").addEventListener("submit", async function (e) {
    e.preventDefault();

    const titre = document.getElementById("titre").value.trim();
    const difficulty = parseInt(document.getElementById("difficulty").value.trim(), 10);
    const auteur = document.getElementById("auteur").value.trim();
    const ingredients = document.getElementById("ingredients").value.trim();
    const etapes = document.getElementById("etapes").value.trim();

    if (!titre || !difficulty || !auteur || !ingredients || !etapes) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    const nouvelleRecette = { titre, difficulty, auteur, ingredients, etapes };
    recettes.push(nouvelleRecette);

    await sauvegarderRecettesSurJSONbin();
    afficherRecettes();
    this.reset();
});

/**************************************
 * Initialisation
 **************************************/
window.onload = chargerRecettesDepuisJSONbin;
