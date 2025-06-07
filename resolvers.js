const Feedback = require("./models/Feedback");

console.log("✅ resolvers.js bien chargé");

module.exports = {
  // ✅ Requête : récupérer tous les feedbacks
  allFeedbacks: async () => {
    const results = await Feedback.find();
    return results.map((fb) => ({
      ...fb._doc,
      id: fb._id.toString(),
      date: fb.date.toISOString(),
    }));
  },

  // ✅ Mutation : ajouter un feedback
  addFeedback: async ({ user, product, rating, comment }) => {
    console.log("🚀 addFeedback appelé avec :", {
      user,
      product,
      rating,
      comment,
    });
    try {
      const fb = new Feedback({ user, product, rating, comment });
      const saved = await fb.save();
      console.log("✅ Feedback enregistré :", saved);
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

  // ✅ Mutation : supprimer un feedback
  deleteFeedback: async ({ id }) => {
    try {
      const res = await Feedback.deleteOne({ _id: id });
      console.log("🗑️ Résultat suppression :", res);
      return res.deletedCount === 1;
    } catch (err) {
      console.error("❌ Erreur deleteFeedback :", err);
      return false;
    }
  },
};
