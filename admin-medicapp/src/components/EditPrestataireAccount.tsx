import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from "../config/api";

interface Prestataire {
  _id: string;
  nom: string;
  ville: string;
}

export default function EditPrestataireAccount() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    nomEtablissement: "",
    prestataireId: "",
    actif: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/prestataires`)
      .then((res) => setPrestataires(res.data))
      .catch(() => setPrestataires([]));

    axios
      .get(`${API_BASE_URL}/prestataireAccounts/${id}`)
      .then((res) => {
        const data = res.data;
        setForm({
          email: data.email || "",
          password: "",
          nomEtablissement: data.nomEtablissement || "",
          prestataireId: data.prestataireId?._id || "",
          actif: data.actif,
        });
      })
      .catch(() => setError("Erreur lors du chargement du compte"));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        email: form.email,
        nomEtablissement: form.nomEtablissement,
        prestataireId: form.prestataireId || null,
        actif: form.actif,
      };
      if (form.password) payload.password = form.password;

      await axios.put(`${API_BASE_URL}/prestataireAccounts/${id}`, payload);
      navigate("/admin/prestataire-accounts");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour du compte prestataire"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary">Modifier un compte prestataire</h2>

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
          <label className="form-label">
            Nouveau mot de passe <span className="text-muted">(optionnel)</span>
          </label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            placeholder="Laisser vide pour ne pas changer"
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

        <div className="col-md-6">
          <div className="form-check form-switch mt-2">
            <input
              type="checkbox"
              className="form-check-input"
              id="actif"
              name="actif"
              checked={form.actif}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="actif">
              Compte actif
            </label>
          </div>
        </div>

        <div className="col-12 text-end">
          <button
            type="submit"
            className="btn btn-primary px-4"
            disabled={loading}
          >
            {loading ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </div>
      </form>
    </div>
  );
}
