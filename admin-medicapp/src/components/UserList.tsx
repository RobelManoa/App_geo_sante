import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./UserList.css";

interface User {
  _id: string;
  societe: string;
  identifiant: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  dateArrivee: string;
  fonction: string;
  niveauFonction: string;
  createdAt: string;
  updatedAt: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFonction, setSelectedFonction] = useState("all");
  const [selectedSociete, setSelectedSociete] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedFonction, selectedSociete]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://appgeosante-production.up.railway.app/api/utilisateurs");
      setUsers(res.data);
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter((user) => {
      const matchesSearch = 
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.identifiant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.societe.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFonction = selectedFonction === "all" || user.fonction === selectedFonction;
      const matchesSociete = selectedSociete === "all" || user.societe === selectedSociete;
      
      return matchesSearch && matchesFonction && matchesSociete;
    });
    
    setFilteredUsers(filtered);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await axios.delete(`https://appgeosante-production.up.railway.app/api/utilisateurs/${id}`);
        setUsers(users.filter((user) => user._id !== id));
      } catch (err) {
        setError("Erreur lors de la suppression");
        console.error(err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const calculateAge = (dateNaissance: string) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getFonctionColor = (fonction: string) => {
    const colors: { [key: string]: string } = {
      "Médecin": "medecin",
      "Infirmier": "infirmier",
      "Pharmacien": "pharmacien",
      "Technicien": "technicien",
      "Administratif": "administratif",
      "default": "default"
    };
    return colors[fonction] || colors.default;
  };

  const getSocieteOptions = () => {
    return Array.from(new Set(users.map(user => user.societe))).sort();
  };

  const getFonctionOptions = () => {
    return Array.from(new Set(users.map(user => user.fonction))).sort();
  };

  if (loading) {
    return (
      <div className="user-list-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      {/* Header */}
      <div className="user-list-header">
        <div className="header-content">
          <h1>👥 Gestion des Utilisateurs</h1>
          <p>Gérez votre équipe médicale et administrative</p>
        </div>
        <div className="header-actions">
          <button 
            className={`view-toggle ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            📋 Cartes
          </button>
          <button 
            className={`view-toggle ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            📊 Tableau
          </button>
          <Link to="/admin/users/new" className="add-user-btn">
            ➕ Ajouter un utilisateur
          </Link>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={fetchUsers}>Réessayer</button>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <select
            value={selectedSociete}
            onChange={(e) => setSelectedSociete(e.target.value)}
            className="filter-select"
          >
            <option value="all">Toutes les sociétés</option>
            {getSocieteOptions().map(societe => (
              <option key={societe} value={societe}>{societe}</option>
            ))}
          </select>
          <select
            value={selectedFonction}
            onChange={(e) => setSelectedFonction(e.target.value)}
            className="filter-select"
          >
            <option value="all">Toutes les fonctions</option>
            {getFonctionOptions().map(fonction => (
              <option key={fonction} value={fonction}>{fonction}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-section">
        <div className="stat-item">
          <span className="stat-number">{filteredUsers.length}</span>
          <span className="stat-label">Utilisateurs trouvés</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{users.length}</span>
          <span className="stat-label">Total utilisateurs</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{getSocieteOptions().length}</span>
          <span className="stat-label">Sociétés</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{getFonctionOptions().length}</span>
          <span className="stat-label">Fonctions</span>
        </div>
      </div>

      {/* Contenu principal */}
      {viewMode === "cards" ? (
        <div className="users-grid">
          {filteredUsers.map((user) => (
            <div key={user._id} className="user-card">
              <div className="card-header">
                <div className="user-avatar">
                  {user.prenom.charAt(0)}{user.nom.charAt(0)}
                </div>
                <div className="user-info">
                  <h3>{user.prenom} {user.nom}</h3>
                  <p className="user-identifiant">{user.identifiant}</p>
                  <span className={`fonction-badge ${getFonctionColor(user.fonction)}`}>
                    {user.fonction}
                  </span>
                </div>
                <div className="card-actions">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => setSelectedUser(user)}
                  >
                    👁️
                  </button>
                  <Link 
                    to={`/admin/users/edit/${user._id}`}
                    className="action-btn edit-btn"
                  >
                    ✏️
                  </Link>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(user._id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="card-details">
                <div className="detail-item">
                  <span className="detail-label">Société:</span>
                  <span className="detail-value">{user.societe}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Âge:</span>
                  <span className="detail-value">{calculateAge(user.dateNaissance)} ans</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Arrivée:</span>
                  <span className="detail-value">{formatDate(user.dateArrivee)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Niveau:</span>
                  <span className="detail-value">{user.niveauFonction}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Identifiant</th>
                <th>Société</th>
                <th>Fonction</th>
                <th>Âge</th>
                <th>Arrivée</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.prenom} {user.nom}</td>
                  <td>{user.identifiant}</td>
                  <td>{user.societe}</td>
                  <td>
                    <span className={`table-fonction-badge ${getFonctionColor(user.fonction)}`}>
                      {user.fonction}
                    </span>
                  </td>
                  <td>{calculateAge(user.dateNaissance)} ans</td>
                  <td>{formatDate(user.dateArrivee)}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="table-action-btn view-btn"
                        onClick={() => setSelectedUser(user)}
                      >
                        👁️
                      </button>
                      <Link 
                        to={`/admin/users/edit/${user._id}`}
                        className="table-action-btn edit-btn"
                      >
                        ✏️
                      </Link>
                      <button 
                        className="table-action-btn delete-btn"
                        onClick={() => handleDelete(user._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de détails */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de l'utilisateur</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedUser(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details">
                <div className="detail-row">
                  <span className="detail-label">Nom complet:</span>
                  <span className="detail-value">{selectedUser.prenom} {selectedUser.nom}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Identifiant:</span>
                  <span className="detail-value">{selectedUser.identifiant}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Société:</span>
                  <span className="detail-value">{selectedUser.societe}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Fonction:</span>
                  <span className="detail-value">{selectedUser.fonction}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Niveau:</span>
                  <span className="detail-value">{selectedUser.niveauFonction}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date de naissance:</span>
                  <span className="detail-value">{formatDate(selectedUser.dateNaissance)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date d'arrivée:</span>
                  <span className="detail-value">{formatDate(selectedUser.dateArrivee)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Âge:</span>
                  <span className="detail-value">{calculateAge(selectedUser.dateNaissance)} ans</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Link 
                to={`/admin/users/edit/${selectedUser._id}`}
                className="btn btn-primary"
              >
                ✏️ Modifier
              </Link>
              <button 
                className="btn btn-danger"
                onClick={() => {
                  handleDelete(selectedUser._id);
                  setSelectedUser(null);
                }}
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
