import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditPrestataire() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    ville: "",
    categorie: "",
    nom: "",
    adresse: "",
    telephone: "",
    prestations: "",
    latitude: "",
    longitude: "",
    photos: [] as File[],
  });

  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `https://appgeosante-production.up.railway.app/api/prestataires/${id}`
        );
        const data = res.data;
        setForm({
          ville: data.ville || "",
          categorie: data.categorie || "",
          nom: data.nom || "",
          adresse: data.adresse || "",
          telephone: data.telephone || "",
          prestations: data.prestations || "",
          latitude: data.localisation?.latitude?.toString() || "",
          longitude: data.localisation?.longitude?.toString() || "",
          photos: [],
        });
        setExistingPhotos(data.photos || []);
      } catch (err) {
        console.error(err);
        alert("Erreur lors du chargement des données");
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, photos: Array.from(e.target.files) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "photos") {
          (value as File[]).forEach((file) => formData.append("photos", file));
        } else {
          formData.append(key, value as string);
        }
      });

      await axios.put(
        `https://appgeosante-production.up.railway.app/api/prestataires/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Prestataire mis à jour avec succès !");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du prestataire");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary">Modifier un prestataire</h2>

      <form
        onSubmit={handleSubmit}
        className="row g-3 shadow p-4 bg-white rounded"
      >
        {/* Informations générales */}
        <div className="col-md-6">
          <label className="form-label">Nom</label>
          <input
            name="nom"
            className="form-control"
            value={form.nom}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Catégorie</label>
          <select
            name="categorie"
            className="form-select"
            value={form.categorie}
            onChange={handleChange}
            required
          >
            <option value="">-- Sélectionner une catégorie --</option>
            <option value="Hôpitaux et cliniques">Hôpitaux et cliniques</option>
            <option value="Pharmacies">Pharmacies</option>
            <option value="Cabinets dentaires">Cabinets dentaires</option>
            <option value="Opticien">Opticien</option>
            <option value="Centres de dialyse">Centres de dialyse</option>
            <option value="Cliniques spécialisées en oncologie">
              Cliniques spécialisées en oncologie
            </option>
            <option value="Centres spécialisés en diabétologie">
              Centres spécialisés en diabétologie
            </option>
            <option value="Cliniques spécialisées en thyroïdologie">
              Cliniques spécialisées en thyroïdologie
            </option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Ville</label>
          <select
            name="ville"
            className="form-select"
            value={form.ville}
            onChange={handleChange}
            required
          >
            <option value="">-- Sélectionner une ville --</option>
            <option value="Antananarivo">Antananarivo</option>
            <option value="Antsirabe">Antsirabe</option>
            <option value="Ambanja">Ambanja</option>
            <option value="Ambatondrazaka">Ambatondrazaka</option>
            <option value="Ambilobe">Ambilobe</option>
            <option value="Amboasary-Atsimo">Amboasary-Atsimo</option>
            <option value="Ambositra">Ambositra</option>
            <option value="Ambovombe-Androy">Ambovombe-Androy</option>
            <option value="Andapa">Andapa</option>
            <option value="Antalaha">Antalaha</option>
            <option value="Antsiranana (Diego)">Antsiranana (Diego)</option>
            <option value="Antsohihy">Antsohihy</option>
            <option value="Brickaville">Brickaville</option>
            <option value="Farafangana">Farafangana</option>
            <option value="Fénérive-Est">Fénérive-Est</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Adresse</label>
          <input
            name="adresse"
            className="form-control"
            value={form.adresse}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Téléphone</label>
          <input
            name="telephone"
            className="form-control"
            value={form.telephone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-12">
          <label className="form-label">Prestations</label>
          <textarea
            name="prestations"
            className="form-control"
            rows={3}
            value={form.prestations}
            onChange={handleChange}
          />
        </div>

        {/* Coordonnées */}
        <div className="col-md-6">
          <label className="form-label">Latitude</label>
          <input
            name="latitude"
            className="form-control"
            value={form.latitude}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Longitude</label>
          <input
            name="longitude"
            className="form-control"
            value={form.longitude}
            onChange={handleChange}
            required
          />
        </div>

        {/* Upload images */}
        <div className="col-md-12">
          <label className="form-label">Ajouter de nouvelles photos</label>
          <input
            type="file"
            className="form-control"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          {form.photos.length > 0 && (
            <div className="mt-2">
              <strong>Photos à ajouter :</strong>
              <ul className="list-unstyled">
                {form.photos.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Photos existantes */}
        {existingPhotos.length > 0 && (
          <div className="col-md-12">
            <label className="form-label">Photos existantes</label>
            <div className="d-flex gap-2 flex-wrap">
              {existingPhotos.map((url, idx) => (
                <img
                  key={idx}
                  src={`https://appgeosante-production.up.railway.app/api/prestataires/uploads/${url}`}
                  alt={`photo-${idx}`}
                  className="rounded"
                  style={{ width: 100, height: 100, objectFit: "cover" }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
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
