const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
const { graphqlHTTP } = require("express-graphql");

const schema = require("./schema");
const resolvers = require("./resolvers");
const Product = require("./models/Product");

const JWT_SECRET = "une-phrase-secrete-tres-longue-et-difficile-a-deviner";
const app = express();
const port = 3000;

const graphqlAuthMiddleware = (req, res, next) => {
  const authHeader = req.get("Authorization");
  req.isAuth = false;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token && token !== "") {
      try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.isAuth = true;
        req.userId = decodedToken.userId;
      } catch (err) {
        /* token invalide, isAuth reste false */
      }
    }
  }
  next();
};

mongoose
  .connect(
    "mongodb+srv://serviceweb:serviceweb@cluster0.moe3vln.mongodb.net/feedbackdb?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("✅ MongoDB connecté");
    Product.countDocuments().then((count) => {
      if (count === 0) {
        console.log(
          "🌱 Aucun produit trouvé, peuplement de la base de données..."
        );
        Product.insertMany([
          { name: "CRM Pro", category: "Logiciels CRM" },
          { name: "CRM Starter", category: "Logiciels CRM" },
          { name: "ERP Finance", category: "Logiciels ERP" },
          { name: "ERP Logistique", category: "Logiciels ERP" },
          { name: "Outil Marketing", category: "Autres" },
        ]);
      }
    });
  })
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

// --- Routes ---

app.use(
  "/graphql",
  graphqlAuthMiddleware,
  graphqlHTTP((req) => ({
    schema,
    rootValue: resolvers,
    graphiql: true,
    context: { isAuth: req.isAuth, userId: req.userId },
  }))
);

app.use(express.static(path.join(__dirname, "public")));

// Redirige toute URL non trouvée vers la page d'accueil
app.get("*", (req, res) => {
  res.redirect("/");
});

// --- Lancement du Serveur ---
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
