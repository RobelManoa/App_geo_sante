// models/prestataireModel.js (ES Modules)

import mongoose from 'mongoose';

const prestataireSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  categorie: { type: String, required: true, index: true },
  ville: { type: String, required: true, index: true },
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
