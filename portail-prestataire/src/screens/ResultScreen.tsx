import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { CarteVerificationResult } from '../api/carte';
import { useAuth } from '../auth/AuthContext';
import './ResultScreen.css';

const STATUS_LABEL: Record<CarteVerificationResult['resultat'], string> = {
  valide: 'Carte valide',
  expiree: 'Couverture expirée',
  invalide: 'QR invalide',
  introuvable: 'Assuré introuvable',
};

const STATUS_TONE: Record<CarteVerificationResult['resultat'], 'success' | 'warning' | 'danger'> = {
  valide: 'success',
  expiree: 'warning',
  invalide: 'danger',
  introuvable: 'danger',
};

const ResultScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { account, logout } = useAuth();
  const result = (location.state as { result?: CarteVerificationResult } | null)?.result;

  if (!result) {
    return <Navigate to="/scan" replace />;
  }

  const tone = STATUS_TONE[result.resultat];
  const initials = [result.prenom, result.nom]
    .filter(Boolean)
    .map((part) => part!.charAt(0).toUpperCase())
    .join('');

  return (
    <div className="result-screen">
      <header className="result-header">
        <p className="result-establishment">{account?.nomEtablissement}</p>
        <button className="result-logout" onClick={logout}>Déconnexion</button>
      </header>

      <div className={`result-banner result-banner-${tone}`}>
        <p className="result-status">{STATUS_LABEL[result.resultat]}</p>
        {result.raison && <p className="result-reason">{result.raison}</p>}
      </div>

      {result.valide && (
        <div className="result-card">
          <div className="result-avatar">{initials || '?'}</div>
          <div className="result-details">
            <h2 className="result-name">{result.prenom} {result.nom}</h2>
            {result.societe && <p className="result-line">{result.societe}</p>}
            {result.fonction && <p className="result-line">{result.fonction}</p>}
            {result.numeroCarte && <p className="result-line result-numero">N° {result.numeroCarte}</p>}
          </div>
        </div>
      )}

      <button className="result-scan-again" onClick={() => navigate('/scan', { replace: true })}>
        Scanner une autre carte
      </button>
    </div>
  );
};

export default ResultScreen;
