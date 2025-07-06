import React, { useEffect, useState } from "react";
import axios from "axios";
import StatCard from "./StatCard";
import MiniMap from "./MiniMap";
import "./AdminDashboard.css";

interface Prestataire {
  _id: string;
  nom: string;
  ville: string;
  categorie?: string;
  telephone?: string;
  adresse?: string;
  localisation: {
    latitude: number;
    longitude: number;
  };
  createdAt?: string;
}

interface Utilisateur {
  _id: string;
  nom: string;
  email?: string;
  createdAt?: string;
}

interface DashboardStats {
  totalPrestataires: number;
  totalUtilisateurs: number;
  villesCouvertes: number;
  prestatairesAvecLocalisation: number;
  prestatairesParVille: { ville: string; count: number }[];
  prestatairesParCategorie: { categorie: string; count: number }[];
  derniersAjouts: Prestataire[];
  croissanceMensuelle: number;
}

export default function AdminDashboard() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVille, setSelectedVille] = useState('all');
  const [stats, setStats] = useState<DashboardStats>({
    totalPrestataires: 0,
    totalUtilisateurs: 0,
    villesCouvertes: 0,
    prestatairesAvecLocalisation: 0,
    prestatairesParVille: [],
    prestatairesParCategorie: [],
    derniersAjouts: [],
    croissanceMensuelle: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [prestataires, utilisateurs]);

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

  const calculateStats = () => {
    const villesUniques = Array.from(new Set(prestataires.map((p) => p.ville)));
    const prestatairesAvecLocalisation = prestataires.filter(p => 
      p.localisation?.latitude && p.localisation?.longitude
    );

    // Calculer les prestataires par ville
    const prestatairesParVille = villesUniques.map(ville => ({
      ville,
      count: prestataires.filter(p => p.ville === ville).length
    })).sort((a, b) => b.count - a.count);

    // Calculer les prestataires par catégorie
    const categories = Array.from(new Set(prestataires.map(p => p.categorie).filter(Boolean)));
    const prestatairesParCategorie = categories.map(categorie => ({
      categorie: categorie || 'Non spécifiée',
      count: prestataires.filter(p => p.categorie === categorie).length
    })).sort((a, b) => b.count - a.count);

    // Derniers ajouts
    const derniersAjouts = [...prestataires]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);

    // Croissance mensuelle (simulation)
    const croissanceMensuelle = Math.floor(Math.random() * 20) + 5;

    setStats({
      totalPrestataires: prestataires.length,
      totalUtilisateurs: utilisateurs.length,
      villesCouvertes: villesUniques.length,
      prestatairesAvecLocalisation: prestatairesAvecLocalisation.length,
      prestatairesParVille,
      prestatairesParCategorie,
      derniersAjouts,
      croissanceMensuelle
    });
  };

  const filteredPrestataires = prestataires.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.ville.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVille = selectedVille === 'all' || p.ville === selectedVille;
    return matchesSearch && matchesVille;
  });

  const villesOptions = Array.from(new Set(prestataires.map(p => p.ville))).sort();

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Nom,Ville,Catégorie,Téléphone,Adresse\n" +
      prestataires.map(p => 
        `"${p.nom}","${p.ville}","${p.categorie || ''}","${p.telephone || ''}","${p.adresse || ''}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "prestataires.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Tableau de bord MedicApp</h1>
          <p>Gestion et suivi des prestataires de santé</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline-primary" onClick={fetchStats}>
            Actualiser
          </button>
          <button className="btn btn-success" onClick={handleExport}>
            Exporter
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <strong>Erreur :</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Statistiques principales */}
      <div className="stats-grid">
        <StatCard
          title="Prestataires"
          value={stats.totalPrestataires}
          color="success"
          trend={stats.croissanceMensuelle}
          trendLabel="ce mois"
        />
        <StatCard
          title="Utilisateurs"
          value={stats.totalUtilisateurs}
          color="primary"
          trend={12}
          trendLabel="ce mois"
        />
        <StatCard
          title="Villes couvertes"
          value={stats.villesCouvertes}
          color="info"
        />
        <StatCard
          title="Avec localisation"
          value={stats.prestatairesAvecLocalisation}
          color="warning"
          percentage={stats.totalPrestataires > 0 ? Math.round((stats.prestatairesAvecLocalisation / stats.totalPrestataires) * 100) : 0}
        />
      </div>

      {/* Contrôles et filtres */}
      <div className="dashboard-controls">
        <div className="controls-left">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher un prestataire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
          <select
            value={selectedVille}
            onChange={(e) => setSelectedVille(e.target.value)}
            className="form-select"
          >
            <option value="all">Toutes les villes</option>
            {villesOptions.map(ville => (
              <option key={ville} value={ville}>{ville}</option>
            ))}
          </select>
        </div>
        <div className="controls-right">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="form-select"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="1y">1 an</option>
          </select>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="dashboard-content">
        <div className="content-grid">
          {/* Carte */}
          <div className="map-section">
            <div className="section-header">
              <h3>Carte des prestataires</h3>
              <span className="badge bg-primary">{filteredPrestataires.length} prestataires</span>
            </div>
            <div className="map-container">
              <MiniMap prestataires={filteredPrestataires} height="400px" />
            </div>
          </div>

          {/* Derniers ajouts */}
          <div className="recent-section">
            <div className="section-header">
              <h3>Derniers ajouts</h3>
              <button className="btn btn-sm btn-outline-primary">Voir tout</button>
            </div>
            <div className="recent-list">
              {stats.derniersAjouts.map((prestataire, index) => (
                <div key={prestataire._id} className="recent-item">
                  <div className="item-number">{index + 1}</div>
                  <div className="item-content">
                    <h4>{prestataire.nom}</h4>
                    <p>{prestataire.ville}</p>
                    {prestataire.categorie && (
                      <span className="badge bg-light text-dark">{prestataire.categorie}</span>
                    )}
                  </div>
                  <div className="item-actions">
                    <button className="btn btn-sm btn-outline-primary">
                    </button>
                    <button className="btn btn-sm btn-outline-warning">
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top villes */}
          <div className="top-villes-section">
            <div className="section-header">
              <h3>Top villes</h3>
            </div>
            <div className="top-list">
              {stats.prestatairesParVille.slice(0, 5).map((item, index) => (
                <div key={item.ville} className="top-item">
                  <div className="rank">{index + 1}</div>
                  <div className="content">
                    <h4>{item.ville}</h4>
                    <p>{item.count} prestataires</p>
                  </div>
                  <div className="percentage">
                    {Math.round((item.count / stats.totalPrestataires) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Catégories */}
          <div className="categories-section">
            <div className="section-header">
                <h3>Par catégorie</h3>
            </div>
            <div className="categories-list">
              {stats.prestatairesParCategorie.slice(0, 6).map((item, index) => (
                <div key={item.categorie} className="category-item">
                  <div className="category-info">
                    <h4>{item.categorie}</h4>
                    <p>{item.count} prestataires</p>
                  </div>
                  <div className="category-bar">
                    <div 
                      className="bar-fill" 
                      style={{width: `${(item.count / Math.max(...stats.prestatairesParCategorie.map(c => c.count))) * 100}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
