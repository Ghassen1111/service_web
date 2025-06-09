const Feedback = require("./models/Feedback");
const User = require("./models/User");
const Product = require("./models/Product");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "une-phrase-secrete-tres-longue-et-difficile-a-deviner";

module.exports = {
  allFeedbacks: async (args, context) => {
    if (!context.isAuth) throw new Error("Non authentifié !");
    return await Feedback.find().sort({ date: -1 });
  },

  allProducts: async () => {
    return await Product.find().sort({ category: 1, name: 1 });
  },

  addFeedback: async ({ user, product, rating, comment }) => {
    const fb = new Feedback({ user, product, rating, comment });
    return await fb.save();
  },

  deleteFeedback: async ({ id }, context) => {
    if (!context.isAuth)
      throw new Error("Non authentifié ! Action non autorisée.");
    const res = await Feedback.deleteOne({ _id: id });
    return res.deletedCount === 1;
  },

  register: async ({ username, password }) => {
    const existingUser = await User.findOne({ username: username });
    if (existingUser) throw new Error("Cet utilisateur existe déjà.");
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, password: hashedPassword });
    const result = await user.save();
    const token = jwt.sign({ userId: result.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return { userId: result.id, token: token, tokenExpiration: 1 };
  },

  login: async ({ username, password }) => {
    const user = await User.findOne({ username: username });
    if (!user) throw new Error("Identifiants invalides.");
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) throw new Error("Identifiants invalides.");
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return { userId: user.id, token: token, tokenExpiration: 1 };
  },
};
