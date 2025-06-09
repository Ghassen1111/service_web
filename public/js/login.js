document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("authToken")) {
    window.location.href = "/admin.html";
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const query = {
      query: `
            mutation LoginUser($username: String!, $password: String!) {
              login(username: $username, password: $password) {
                token
              }
            }
          `,
      variables: { username, password },
    };

    try {
      const res = await fetch("/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });
      const json = await res.json();

      if (json.errors) {
        throw new Error(json.errors[0].message);
      }

      const token = json.data.login.token;
      if (token) {
        localStorage.setItem("authToken", token);
        window.location.href = "/admin.html";
      }
    } catch (err) {
      errorMsg.textContent = "Erreur : " + err.message;
      errorMsg.classList.remove("d-none");
    }
  });
});
