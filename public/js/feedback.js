document.addEventListener("DOMContentLoaded", () => {
  let selectedRating = 0;
  const feedbackForm = document.getElementById("feedbackForm");
  const productSelect = document.getElementById("product");
  const starsContainer = document.getElementById("starContainer");
  const commentTextarea = document.getElementById("comment");
  const charCounter = document.getElementById("charCounter");
  const submitBtn = document.getElementById("submitBtn");
  const successMsg = document.getElementById("successMsg");

  async function loadProducts() {
    const query = { query: `{ allProducts { name, category } }` };
    try {
      const response = await fetch("/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });
      const json = await response.json();
      if (json.errors) throw new Error(json.errors[0].message);

      productSelect.innerHTML =
        '<option value="" disabled selected>-- Choisissez un produit --</option>';
      const productsByCategory = json.data.allProducts.reduce(
        (acc, product) => {
          (acc[product.category] = acc[product.category] || []).push(product);
          return acc;
        },
        {}
      );

      for (const category in productsByCategory) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = category;
        productsByCategory[category].forEach((product) => {
          const option = document.createElement("option");
          option.value = product.name;
          option.textContent = product.name;
          optgroup.appendChild(option);
        });
        productSelect.appendChild(optgroup);
      }
    } catch (error) {
      productSelect.innerHTML =
        '<option value="">Erreur de chargement</option>';
    }
  }

  starsContainer.addEventListener("click", (e) => {
    if (e.target.tagName === "SPAN") {
      selectedRating = parseInt(e.target.dataset.value);
      Array.from(starsContainer.querySelectorAll("span")).forEach(
        (star, index) => {
          star.classList.toggle("selected", index < selectedRating);
        }
      );
    }
  });

  commentTextarea.addEventListener("input", () => {
    charCounter.textContent = `${commentTextarea.value.length} / 500`;
  });

  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = document.getElementById("user").value;
    const product = productSelect.value;
    const comment = commentTextarea.value;

    if (!product || selectedRating === 0) {
      alert("Veuillez sélectionner un produit et une note.");
      return;
    }

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm"></span> Envoi...';

    const query = {
      query: `mutation AddFeedback($user: String!, $product: String!, $rating: Int!, $comment: String!) { addFeedback(user: $user, product: $product, rating: $rating, comment: $comment) { id } }`,
      variables: { user, product, rating: selectedRating, comment },
    };

    try {
      const response = await fetch("/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });
      const json = await response.json();
      if (json.errors) throw new Error(json.errors[0].message);

      if (json.data.addFeedback) {
        feedbackForm.reset();
        Array.from(starsContainer.querySelectorAll("span")).forEach((s) =>
          s.classList.remove("selected")
        );
        charCounter.textContent = "0 / 500";
        selectedRating = 0;
        successMsg.classList.remove("d-none");
        setTimeout(() => successMsg.classList.add("d-none"), 4000);
      }
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  loadProducts();
});
