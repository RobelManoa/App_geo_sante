// routes/prestataireAuth.js (ES Modules)
// Authentification des comptes du personnel prestataire (portail de
// vérification de carte). Les comptes eux-mêmes sont provisionnés par BSA
// via le back-office admin (hors scope de ce fichier).

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import PrestataireAccount from '../models/PrestataireAccount.js';
import { loginLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

const SESSION_TOKEN_SECRET = process.env.SESSION_TOKEN_SECRET;
const SESSION_TOKEN_TTL = '12h';

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    const account = await PrestataireAccount.findOne({ email: email.toLowerCase().trim() });
    if (!account?.actif) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const match = await bcrypt.compare(password, account.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const sessionToken = jwt.sign(
      { sub: account._id.toString(), role: 'prestataire' },
      SESSION_TOKEN_SECRET,
      { expiresIn: SESSION_TOKEN_TTL }
    );

    res.json({
      sessionToken,
      account: {
        id: account._id,
        email: account.email,
        nomEtablissement: account.nomEtablissement,
      },
    });
  } catch (err) {
    console.error('Erreur de connexion prestataire :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
