import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaClinicMedical, FaCity, FaUsers } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Prestataire {
  _id: string;
  nom: string;
  ville: string;
}

interface Utilisateur {
  _id: string;
  nom: string;
}

export default function AdminDashboard() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [resPrestataires, resUsers] = await Promise.all([
        axios.get("https://appgeosante-production.up.railway.app/api/prestataires"),
        axios.get("https://appgeosante-production.up.railway.app/api/utilisateurs"),
      ]);

      setPrestataires(resPrestataires.data || []);
      setUtilisateurs(resUsers.data || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des données", err);
      setError("Impossible de charger les données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const villesUniques = Array.from(new Set(prestataires.map((p) => p.ville)));

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-primary text-center">
        Tableau de bord Administrateur
      </h2>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button 
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={fetchStats}
          >
            Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement des statistiques...</p>
        </div>
      ) : (
        <div className="row g-4">
          {/* Prestataires */}
          <div className="col-md-4">
            <div className="card border-0 shadow h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <FontAwesomeIcon icon="fa-solid fa-house-medical-flag" />
                </div>
                <div>
                  <h5 className="card-title mb-1">Prestataires</h5>
                  <h3>{prestataires.length}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Villes */}
          <div className="col-md-4">
            <div className="card border-0 shadow h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <FontAwesomeIcon icon="fa-solid fa-city" />
                </div>
                <div>
                  <h5 className="card-title mb-1">Villes couvertes</h5>
                  <h3>{villesUniques.length}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Utilisateurs */}
          <div className="col-md-4">
            <div className="card border-0 shadow h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <FontAwesomeIcon icon="fa-solid fa-users-line" />
                </div>
                <div>
                  <h5 className="card-title mb-1">Utilisateurs</h5>
                  <h3>{utilisateurs.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}