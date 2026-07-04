// routes/carte.js (ES Modules)
// Carte d'assuré numérique : émission d'un jeton QR de courte durée côté
// assuré, et vérification côté portail prestataire.

import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import CarteValidation from '../models/CarteValidation.js';
import { requireAssureAuth, requirePrestataireAuth } from '../middlewares/auth.js';
import { carteVerifierLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

const CARD_TOKEN_SECRET = process.env.CARD_TOKEN_SECRET;
const CARD_TOKEN_TTL_SECONDS = 60;
const VALIDATIONS_DEFAULT_LIMIT = 20;
const VALIDATIONS_MAX_LIMIT = 200;

// Journal des vérifications de carte (back-office admin)
router.get('/validations', async (req, res) => {
  const limit = Math.min(
    Number.parseInt(req.query.limit, 10) || VALIDATIONS_DEFAULT_LIMIT,
    VALIDATIONS_MAX_LIMIT
  );

  try {
    const validations = await CarteValidation.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'nom prenom numeroCarte')
      .populate('prestataireAccountId', 'email nomEtablissement');
    res.json(validations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Émettre un jeton de carte de courte durée pour l'assuré connecté
router.get('/token', requireAssureAuth, (req, res) => {
  const token = jwt.sign(
    { sub: req.auth.id, role: 'carte' },
    CARD_TOKEN_SECRET,
    { expiresIn: CARD_TOKEN_TTL_SECONDS }
  );

  res.json({
    token,
    expiresAt: new Date(Date.now() + CARD_TOKEN_TTL_SECONDS * 1000).toISOString(),
  });
});

// Vérifier un jeton de carte scanné par un prestataire du réseau
router.post('/verifier', carteVerifierLimiter, requirePrestataireAuth, async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Jeton manquant' });
  }

  const logAndRespond = async (resultat, userId, payload) => {
    await CarteValidation.create({
      userId: userId || undefined,
      prestataireAccountId: req.auth.id,
      resultat,
    });
    return res.json({ resultat, ...payload });
  };

  let decoded;
  try {
    decoded = jwt.verify(token, CARD_TOKEN_SECRET);
  } catch (err) {
    const resultat = err.name === 'TokenExpiredError' ? 'expiree' : 'invalide';
    return logAndRespond(resultat, null, {
      valide: false,
      raison: resultat === 'expiree' ? 'Le QR a expiré, redemandez-en un.' : 'Jeton invalide.',
    });
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    return logAndRespond('introuvable', null, {
      valide: false,
      raison: 'Aucun assuré correspondant.',
    });
  }

  if (user.carteValideJusquau && user.carteValideJusquau < new Date()) {
    return logAndRespond('expiree', user._id, {
      valide: false,
      raison: 'La couverture de cet assuré a expiré.',
    });
  }

  return logAndRespond('valide', user._id, {
    valide: true,
    nom: user.nom,
    prenom: user.prenom,
    societe: user.societe,
    fonction: user.fonction,
    numeroCarte: user.numeroCarte,
    // La photo de profil n'est pour l'instant pas envoyée au serveur (stockage
    // local uniquement côté app, voir README). Le portail doit donc prévoir
    // un repli (initiales/placeholder) tant que l'upload serveur n'existe pas.
    photoUrl: null,
  });
});

export default router;
