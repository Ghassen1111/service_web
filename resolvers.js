const Feedback = require("./models/Feedback");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "votre_secret_super_secret"; // Mettez une chaîne complexe ici

module.exports = {
  // === QUERIES ===
  allFeedbacks: async () => {
    // ... (inchangé)
    const results = await Feedback.find();
    return results.map((fb) => ({
      ...fb._doc,
      id: fb._id.toString(),
      date: fb.date.toISOString(),
    }));
  },

  // === MUTATIONS DE FEEDBACK ===
  addFeedback: async ({ user, product, rating, comment }) => {
    // ... (inchangé pour rester simple, mais pourrait aussi être protégé)
    try {
      const fb = new Feedback({ user, product, rating, comment });
      const saved = await fb.save();
      return {
        ...saved._doc,
        id: saved._id.toString(),
        date: saved.date.toISOString(),
      };
    } catch (err) {
      console.error("❌ Erreur addFeedback :", err);
      return null;
    }
  },

  // 🔐 MUTATION SÉCURISÉE
  deleteFeedback: async ({ id }, context) => {
    // On vérifie si l'utilisateur est authentifié grâce au contexte
    if (!context.isAuth) {
      throw new Error("Non authentifié ! Impossible de supprimer.");
    }

    try {
      const res = await Feedback.deleteOne({ _id: id });
      console.log(
        `🗑️ Suppression par l'utilisateur authentifié. Résultat :`,
        res
      );
      return res.deletedCount === 1;
    } catch (err) {
      console.error("❌ Erreur deleteFeedback :", err);
      return false;
    }
  },

  // === MUTATIONS D'AUTHENTIFICATION ===
  register: async ({ username, password }) => {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error("Cet utilisateur existe déjà.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, password: hashedPassword });
    const result = await user.save();

    const token = jwt.sign(
      { userId: result.id, username: result.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { token, userId: result.id };
  },

  login: async ({ username, password }) => {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("Identifiants invalides.");
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error("Identifiants invalides.");
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { token, userId: user.id };
  },
};
