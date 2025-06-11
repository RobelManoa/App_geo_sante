// models/User.js (ES Modules)

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  societe: { type: String, required: true },
  identifiant: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  dateNaissance: { type: Date, required: true },
  dateArrivee: { type: Date, required: true },
  fonction: { type: String, required: true },
  niveauFonction: { type: String, required: true },
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
