const express = require('express');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema');
const resolvers = require('./resolvers');

const app = express();
const port = 3000;

mongoose.connect('mongodb+srv://serviceweb:serviceweb@cluster0.moe3vln.mongodb.net/feedbackdb?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ MongoDB connecté'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: resolvers,
  graphiql: true
}));

app.listen(port, () => {
  console.log(`🚀 Serveur GraphQL lancé sur http://localhost:${port}/graphql`);
});
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

// Ajouter cette ligne pour que "/" redirige vers index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
