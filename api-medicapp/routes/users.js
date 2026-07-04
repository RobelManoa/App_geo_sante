// routes/users.js (ES Modules)

import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getAllUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { validateUser } from '../middlewares/validation.js';
import { requireAssureAuth } from '../middlewares/auth.js';
import { loginLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

const SESSION_TOKEN_SECRET = process.env.SESSION_TOKEN_SECRET;
const SESSION_TOKEN_TTL = '30d';

// Créer un utilisateur
router.post("/", validateUser, async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les utilisateurs
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Authentification simple
router.post("/login", loginLimiter, async (req, res) => {
  const { nom, identifiant } = req.body;

  if (!nom || !identifiant) {
    return res.status(400).json({ message: "Nom et identifiant requis" });
  }

  try {
    const user = await User.findOne({ nom, identifiant });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const sessionToken = jwt.sign(
      { sub: user._id.toString(), role: "assure" },
      SESSION_TOKEN_SECRET,
      { expiresIn: SESSION_TOKEN_TTL }
    );

    res.json({ user, sessionToken });
  } catch (err) {
    console.error("Erreur de connexion :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Lire un utilisateur spécifique (uniquement son propre profil)
router.get("/:id", requireAssureAuth, async (req, res) => {
  try {
    if (req.auth.id !== req.params.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un utilisateur
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un utilisateur
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
