// routes/prestataireRoutes.js (ES Modules)

import express from 'express';
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
    res.status(500).json({ message: 'Erreur serveur' });
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

export default router;
