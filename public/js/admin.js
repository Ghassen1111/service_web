document.addEventListener("DOMContentLoaded", () => {
  // Le token est la clé d'accès à toute l'API.
  const token = localStorage.getItem("authToken");

  // La vérification est déjà dans le HTML, mais c'est une double sécurité.
  // Si pas de token, on ne fait rien et la redirection du HTML a déjà eu lieu.
  if (!token) {
    return;
  }

  let allFeedbacks = []; // Un cache local pour les feedbacks afin de ne pas re-télécharger pour un simple filtre.

  // --- Fonctions Utilitaires ---

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return isNaN(d)
      ? "Date invalide"
      : d.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
  }

  function renderStars(n) {
    return "★".repeat(n) + "☆".repeat(5 - n);
  }

  // --- Fonctions Principales (Communication avec l'API) ---

  async function deleteFeedback(id) {
    if (!confirm("Voulez-vous vraiment supprimer ce feedback ?")) return;

    const query = {
      query: `mutation DeleteFeedback($id: ID!) { deleteFeedback(id: $id) }`,
      variables: { id },
    };

    try {
      const res = await fetch("/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(query),
      });

      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0].message);

      if (json.data && json.data.deleteFeedback) {
        alert("🗑️ Feedback supprimé !");
        loadFeedbacks(); // Recharger la liste après suppression
      }
    } catch (err) {
      alert("❌ Erreur : " + err.message);
    }
  }

  async function loadFeedbacks() {
    const query = {
      query: `{ allFeedbacks { id user product rating comment date } }`,
    };
    try {
      const res = await fetch("/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(query),
      });
      const json = await res.json();

      if (json.errors) throw new Error(json.errors[0].message);

      allFeedbacks = json.data.allFeedbacks || [];
      renderTable(allFeedbacks); // Afficher tous les feedbacks
      renderStats(allFeedbacks); // Mettre à jour les statistiques
    } catch (err) {
      console.error("Erreur de chargement des feedbacks:", err);
      document.getElementById(
        "tableBody"
      ).innerHTML = `<tr><td colspan="6" class="text-danger">Erreur: ${err.message}. La session a peut-être expiré. Vous allez être redirigé.</td></tr>`;
      // Si le token est invalide, on redirige vers le login après quelques secondes.
      setTimeout(() => (window.location.href = "/login"), 3000);
    }
  }

  // --- Fonctions d'Affichage (Manipulation du DOM) ---

  function renderTable(feedbacks) {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";
    if (!feedbacks || feedbacks.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">Aucun feedback à afficher.</td></tr>`;
      return;
    }
    feedbacks.forEach((fb) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${fb.user}</td>
        <td>${fb.product}</td>
        <td><span class="star">${renderStars(fb.rating)}</span></td>
        <td>${fb.comment}</td>
        <td>${formatDate(fb.date)}</td>
        <td><button class="btn-delete btn btn-sm btn-danger" data-id="${
          fb.id
        }">🗑️ Supprimer</button></td>
      `;
      tbody.appendChild(row);
    });
  }

  function renderStats(feedbacks) {
    const statsContainer = document.getElementById("statsContainer");
    if (!feedbacks || feedbacks.length === 0) {
      statsContainer.innerHTML = "<p>Pas de données pour les statistiques.</p>";
      return;
    }

    const stats = {};
    feedbacks.forEach((fb) => {
      if (!stats[fb.product]) stats[fb.product] = { total: 0, count: 0 };
      stats[fb.product].total += fb.rating;
      stats[fb.product].count++;
    });

    const sorted = Object.entries(stats)
      .map(([prod, data]) => ({ name: prod, avg: data.total / data.count }))
      .sort((a, b) => b.avg - a.avg);

    statsContainer.innerHTML = "";
    sorted.forEach((item) => {
      const div = document.createElement("div");
      div.className = "mb-2";
      div.innerHTML = `
        <strong>${item.name}</strong>
        <div class="progress" style="height: 24px;">
          <div class="progress-bar" role="progressbar" style="width: ${
            item.avg * 20
          }%;" aria-valuenow="${item.avg}" aria-valuemin="0" aria-valuemax="5">
            ${item.avg.toFixed(2)} ★
          </div>
        </div>
      `;
      statsContainer.appendChild(div);
    });
  }

  function filterFeedbacks() {
    const userFilter = document
      .getElementById("searchUser")
      .value.toLowerCase();
    const productFilter = document
      .getElementById("searchProduct")
      .value.toLowerCase();

    const filtered = allFeedbacks.filter(
      (f) =>
        f.user.toLowerCase().includes(userFilter) &&
        f.product.toLowerCase().includes(productFilter)
    );
    renderTable(filtered);
  }

  // --- Initialisation et Écouteurs d'Événements ---

  document
    .getElementById("searchUser")
    .addEventListener("input", filterFeedbacks);
  document
    .getElementById("searchProduct")
    .addEventListener("input", filterFeedbacks);

  // Utilisation de la délégation d'événement pour les boutons supprimer
  document.getElementById("tableBody").addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("btn-delete")) {
      deleteFeedback(e.target.dataset.id);
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  });

  // Lancement initial
  loadFeedbacks();
});
