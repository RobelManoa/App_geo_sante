// routes/prestataireRoutes.js (ES Modules)

import express from 'express';
import mongoose from 'mongoose';
import Prestataire from '../models/prestataireModel.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Route POST - Ajouter un prestataire
router.post('/', upload.array('photos', 5), async (req, res) => {
  try {
    const {
      nom, categorie, ville, adresse, telephone,
      prestations, latitude, longitude
    } = req.body;

    const photos = req.files.map(file => file.filename);

    const prestataire = new Prestataire({
      nom,
      categorie,
      ville,
      adresse,
      telephone,
      prestations,
      localisation: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      photos
    });

    await prestataire.save();
    res.status(201).json({ message: 'Prestataire enregistré', prestataire });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Erreur serveur' });
  }
});

// Route GET - Récupérer tous les prestataires
router.get('/', async (req, res) => {
  try {
    const prestataires = await Prestataire.find();
    res.json(prestataires);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des prestataires' });
  }
});

// Route GET - Récupérer un prestataire par son id
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }

    const prestataire = await Prestataire.findById(req.params.id);
    if (!prestataire) {
      return res.status(404).json({ message: 'Prestataire non trouvé' });
    }

    res.json(prestataire);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route PUT - Mettre à jour un prestataire
router.put('/:id', upload.array('photos', 5), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }

    const {
      nom, categorie, ville, adresse, telephone,
      prestations, latitude, longitude
    } = req.body;

    const updateData = { nom, categorie, ville, adresse, telephone, prestations };

    if (latitude !== undefined && longitude !== undefined) {
      updateData.localisation = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      };
    }

    if (req.files && req.files.length > 0) {
      updateData.photos = req.files.map(file => file.filename);
    }

    const prestataire = await Prestataire.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!prestataire) {
      return res.status(404).json({ message: 'Prestataire non trouvé' });
    }

    res.json(prestataire);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Erreur serveur' });
  }
});

// Route DELETE - Supprimer un prestataire
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }

    const prestataire = await Prestataire.findByIdAndDelete(req.params.id);
    if (!prestataire) {
      return res.status(404).json({ message: 'Prestataire non trouvé' });
    }

    res.json({ message: 'Prestataire supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
