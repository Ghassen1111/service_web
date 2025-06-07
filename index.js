const express = require("express");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema");
const resolvers = require("./resolvers");
const path = require("path");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "une-phrase-secrete-tres-longue-et-difficile-a-deviner";

const app = express();
const port = 3000;

// Middleware pour vérifier le token sur chaque requête
const authMiddleware = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1]; // Bearer <token>
  if (!token || token === "") {
    req.isAuth = false;
    return next();
  }
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    req.isAuth = true;
    req.userId = decodedToken.userId;
  } catch (err) {
    req.isAuth = false;
  }
  next();
};

app.use(authMiddleware); // Utiliser le middleware pour toutes les routes

mongoose
  .connect(
    "mongodb+srv://serviceweb:serviceweb@cluster0.moe3vln.mongodb.net/feedbackdb?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("✅ MongoDB connecté"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

// Route de l'API GraphQL
app.use(
  "/graphql",
  graphqlHTTP((req) => ({
    schema,
    rootValue: resolvers,
    graphiql: true,
    context: {
      isAuth: req.isAuth,
      userId: req.userId,
    },
  }))
);

// --- CORRECTION : Définir les routes des pages AVANT le middleware static ---

// Route pour la page de connexion
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Route pour la page d'administration
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Route principale qui sert le formulaire de feedback
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Middleware pour servir les fichiers statiques (CSS, images, etc.)
// Il est maintenant placé après les routes spécifiques
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`🚀 Serveur GraphQL lancé sur http://localhost:${port}/graphql`);
});
