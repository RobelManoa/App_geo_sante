// middlewares/rateLimit.js (ES Modules)
// Limiteurs de débit pour les routes sensibles (login, vérification de
// carte) — freine le bruteforce et le scan massif de comptes/jetons.

import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives, réessayez plus tard.' },
});

export const carteVerifierLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de vérifications, réessayez dans un instant.' },
});
