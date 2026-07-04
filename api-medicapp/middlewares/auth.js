// middlewares/auth.js (ES Modules)
// Vérifie le jeton de session (Authorization: Bearer <token>) émis au login,
// pour les deux types de comptes (assuré / prestataire).

import jwt from 'jsonwebtoken';

const SESSION_TOKEN_SECRET = process.env.SESSION_TOKEN_SECRET;

function extractToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

function requireAuth(expectedRole) {
  return (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    try {
      const payload = jwt.verify(token, SESSION_TOKEN_SECRET);
      if (payload.role !== expectedRole) {
        return res.status(403).json({ message: 'Accès refusé' });
      }
      req.auth = { id: payload.sub, role: payload.role };
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Session invalide ou expirée' });
    }
  };
}

export const requireAssureAuth = requireAuth('assure');
export const requirePrestataireAuth = requireAuth('prestataire');
