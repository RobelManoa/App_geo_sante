import React, { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { useNavigate } from 'react-router-dom';
import { verifierCarte } from '../api/carte';
import { useAuth } from '../auth/AuthContext';
import './ScanScreen.css';

const ScanScreen: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const scannedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanKey, setScanKey] = useState(0);
  const navigate = useNavigate();
  const { account, logout } = useAuth();

  useEffect(() => {
    const reader = new BrowserQRCodeReader();
    let cancelled = false;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result) => {
        if (cancelled || scannedRef.current || !result) return;
        scannedRef.current = true;
        controlsRef.current?.stop();
        setBusy(true);
        void handleDecoded(result.getText());
      })
      .then((controls) => {
        controlsRef.current = controls;
      })
      .catch(() => {
        if (!cancelled) {
          setError("Impossible d'accéder à la caméra. Vérifiez les autorisations du navigateur.");
        }
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanKey]);

  const scanAgain = () => {
    setError(null);
    setBusy(false);
    scannedRef.current = false;
    setScanKey((k) => k + 1);
  };

  const handleDecoded = async (token: string) => {
    setError(null);
    try {
      const result = await verifierCarte(token);
      navigate('/result', { state: { result } });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur lors de la vérification de la carte.');
      setBusy(false);
    }
  };

  return (
    <div className="scan-screen">
      <header className="scan-header">
        <div>
          <p className="scan-establishment">{account?.nomEtablissement}</p>
          <h1 className="scan-title">Scanner une carte d'assuré</h1>
        </div>
        <button className="scan-logout" onClick={logout}>Déconnexion</button>
      </header>

      <div className="scan-video-wrapper">
        <video ref={videoRef} className="scan-video" muted playsInline />
        <div className="scan-frame" />
      </div>

      <p className="scan-hint">Présentez le QR code affiché sur l'application MedicApp de l'assuré.</p>

      {busy && <p className="scan-status">Vérification en cours...</p>}
      {error && (
        <div className="scan-error-box">
          <p className="scan-error">{error}</p>
          <button className="scan-retry" onClick={scanAgain}>Réessayer</button>
        </div>
      )}
    </div>
  );
};

export default ScanScreen;
