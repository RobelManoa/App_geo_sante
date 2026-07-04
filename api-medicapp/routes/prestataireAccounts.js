// routes/prestataireAccounts.js (ES Modules)
// Administration des comptes du portail prestataire (back-office
// admin-medicapp) : liste, création, modification, suppression. Ces
// comptes sont ceux utilisés pour se connecter au portail de vérification
// de carte (voir routes/prestataireAuth.js pour le login lui-même).

import express from 'express';
import bcrypt from 'bcryptjs';
import PrestataireAccount from '../models/PrestataireAccount.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const accounts = await PrestataireAccount.find()
      .select('-passwordHash')
      .populate('prestataireId', 'nom ville')
      .sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const account = await PrestataireAccount.findById(req.params.id)
      .select('-passwordHash')
      .populate('prestataireId', 'nom ville');
    if (!account) {
      return res.status(404).json({ message: 'Compte introuvable' });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const { email, password, nomEtablissement, prestataireId } = req.body;

  if (!email || !password || !nomEtablissement) {
    return res.status(400).json({ message: 'Email, mot de passe et nom d\'établissement requis' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const account = await PrestataireAccount.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      nomEtablissement,
      prestataireId: prestataireId || undefined,
    });

    const { passwordHash: _omit, ...safeAccount } = account.toObject();
    res.status(201).json(safeAccount);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cet email' });
    }
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { email, password, nomEtablissement, prestataireId, actif } = req.body;

  try {
    const update = {};
    if (email !== undefined) update.email = email.toLowerCase().trim();
    if (nomEtablissement !== undefined) update.nomEtablissement = nomEtablissement;
    if (prestataireId !== undefined) update.prestataireId = prestataireId || null;
    if (actif !== undefined) update.actif = actif;
    if (password) update.passwordHash = await bcrypt.hash(password, 10);

    const account = await PrestataireAccount.findByIdAndUpdate(req.params.id, update, { new: true })
      .select('-passwordHash')
      .populate('prestataireId', 'nom ville');
    if (!account) {
      return res.status(404).json({ message: 'Compte introuvable' });
    }
    res.json(account);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cet email' });
    }
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const account = await PrestataireAccount.findByIdAndDelete(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Compte introuvable' });
    }
    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
