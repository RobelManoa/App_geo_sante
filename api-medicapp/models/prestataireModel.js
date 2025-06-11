// models/prestataireModel.js (ES Modules)

import mongoose from 'mongoose';

const prestataireSchema = new mongoose.Schema({
  nom: String,
  categorie: String,
  ville: String,
  adresse: String,
  telephone: String,
  prestations: String,
  localisation: {
    latitude: Number,
    longitude: Number
  },
  photos: [String]
}, {
  timestamps: true
});

const Prestataire = mongoose.model('Prestataire', prestataireSchema);

export default Prestataire;
