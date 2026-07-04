// models/PrestataireAccount.js (ES Modules)
// Compte du personnel d'un prestataire du réseau, utilisé pour se connecter
// au portail de vérification de carte (distinct des comptes "assuré").

import mongoose from 'mongoose';

const prestataireAccountSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  nomEtablissement: { type: String, required: true },
  prestataireId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prestataire' },
  actif: { type: Boolean, default: true },
}, {
  timestamps: true
});

const PrestataireAccount = mongoose.model('PrestataireAccount', prestataireAccountSchema);

export default PrestataireAccount;
