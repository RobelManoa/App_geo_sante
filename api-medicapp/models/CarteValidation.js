// models/CarteValidation.js (ES Modules)
// Journal d'audit de chaque vérification de carte d'assuré : base du suivi
// anti-fraude (usage inhabituel, carte expirée présentée, etc.).

import mongoose from 'mongoose';

const carteValidationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  prestataireAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'PrestataireAccount', required: true },
  resultat: {
    type: String,
    enum: ['valide', 'expiree', 'invalide', 'introuvable'],
    required: true,
  },
}, {
  timestamps: true
});

const CarteValidation = mongoose.model('CarteValidation', carteValidationSchema);

export default CarteValidation;
