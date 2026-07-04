// scripts/createPrestataireAccount.js (ES Modules)
// Outil de bootstrap pour créer un compte du portail prestataire tant que
// l'écran d'administration dédié (Phase 4 du plan carte d'assuré) n'existe
// pas encore. À terme, ces comptes seront créés depuis admin-medicapp.
//
// Usage : node scripts/createPrestataireAccount.js <email> <motDePasse> <nomEtablissement>

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import PrestataireAccount from '../models/PrestataireAccount.js';

dotenv.config();

const [, , email, password, ...nomParts] = process.argv;
const nomEtablissement = nomParts.join(' ');

if (!email || !password || !nomEtablissement) {
  console.error('Usage: node scripts/createPrestataireAccount.js <email> <motDePasse> <nomEtablissement>');
  process.exit(1);
}

const mongoURI = process.env.MONGO_URI || 'mongodb://mongo:27017/medicapp';

const run = async () => {
  await mongoose.connect(mongoURI);

  const passwordHash = await bcrypt.hash(password, 10);
  const account = await PrestataireAccount.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { email: email.toLowerCase().trim(), passwordHash, nomEtablissement, actif: true },
    { upsert: true, new: true }
  );

  console.log(`✅ Compte prestataire prêt : ${account.email} (${account.nomEtablissement})`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('❌ Échec de la création du compte prestataire:', err.message);
  process.exit(1);
});
