import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from "../config/api";

interface PrestataireAccount {
  _id: string;
  email: string;
  nomEtablissement: string;
  prestataireId?: { _id: string; nom: string; ville: string } | null;
  actif: boolean;
  createdAt: string;
}

export default function PrestataireAccountsList() {
  const [accounts, setAccounts] = useState<PrestataireAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/prestataireAccounts`);
      setAccounts(res.data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des comptes prestataires");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActif = async (account: PrestataireAccount) => {
    try {
      await axios.put(`${API_BASE_URL}/prestataireAccounts/${account._id}`, {
        actif: !account.actif,
      });
      setAccounts((prev) =>
        prev.map((a) => (a._id === account._id ? { ...a, actif: !a.actif } : a))
      );
    } catch (err) {
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer ce compte prestataire ?")) {
      try {
        await axios.delete(`${API_BASE_URL}/prestataireAccounts/${id}`);
        setAccounts((prev) => prev.filter((a) => a._id !== id));
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR");

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary mb-0">Comptes du portail prestataire</h2>
        <Link to="/admin/prestataire-accounts/new" className="btn btn-primary">
          ➕ Ajouter un compte
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : accounts.length === 0 ? (
        <p className="text-muted">Aucun compte prestataire pour le moment.</p>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th>Email</th>
                <th>Établissement</th>
                <th>Prestataire lié</th>
                <th>Statut</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account._id}>
                  <td>{account.email}</td>
                  <td>{account.nomEtablissement}</td>
                  <td>
                    {account.prestataireId
                      ? `${account.prestataireId.nom} (${account.prestataireId.ville})`
                      : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${account.actif ? "btn-success" : "btn-outline-secondary"}`}
                      onClick={() => handleToggleActif(account)}
                    >
                      {account.actif ? "Actif" : "Inactif"}
                    </button>
                  </td>
                  <td>{formatDate(account.createdAt)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link
                        to={`/admin/prestataire-accounts/edit/${account._id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Modifier
                      </Link>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(account._id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
