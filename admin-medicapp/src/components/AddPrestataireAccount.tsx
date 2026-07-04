import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from "../config/api";

interface Prestataire {
  _id: string;
  nom: string;
  ville: string;
}

export default function AddPrestataireAccount() {
  const navigate = useNavigate();
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    nomEtablissement: "",
    prestataireId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/prestataires`)
      .then((res) => setPrestataires(res.data))
      .catch(() => setPrestataires([]));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/prestataireAccounts`, {
        ...form,
        prestataireId: form.prestataireId || undefined,
      });
      navigate("/admin/prestataire-accounts");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création du compte prestataire"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary">Ajouter un compte prestataire</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form
        onSubmit={handleSubmit}
        className="row g-3 shadow p-4 bg-white rounded"
      >
        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Mot de passe</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Nom de l'établissement</label>
          <input
            name="nomEtablissement"
            className="form-control"
            value={form.nomEtablissement}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Prestataire lié (optionnel)</label>
          <select
            name="prestataireId"
            className="form-select"
            value={form.prestataireId}
            onChange={handleChange}
          >
            <option value="">-- Aucun --</option>
            {prestataires.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nom} ({p.ville})
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 text-end">
          <button
            type="submit"
            className="btn btn-primary px-4"
            disabled={loading}
          >
            {loading ? "Création..." : "Créer le compte"}
          </button>
        </div>
      </form>
    </div>
  );
}
