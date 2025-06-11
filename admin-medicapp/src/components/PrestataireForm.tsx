import React, { useState, useRef } from "react";
import axios from "axios";

export default function PrestataireForm() {
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

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "photos" && Array.isArray(value)) {
          value.forEach((photo) => formData.append("photos", photo));
        } else {
          formData.append(key, value as string | Blob);
        }
      });

      await axios.post(
        "http://192.168.88.240:5000/api/prestataires",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Prestataire ajouté avec succès !");
      setForm({
        ville: "",
        categorie: "",
        nom: "",
        adresse: "",
        telephone: "",
        prestations: "",
        latitude: "",
        longitude: "",
        photos: [],
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert("Erreur lors de l'ajout du prestataire");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Ajouter un prestataire</h2>

      <div style={styles.group}>
        <label style={styles.label}>Nom du prestataire</label>
        <input
          name="nom"
          style={styles.input}
          value={form.nom}
          onChange={handleChange}
          required
        />
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Catégorie</label>
        <select
          name="categorie"
          style={styles.select}
          value={form.categorie}
          onChange={handleChange}
          required
        >
          <option value="">-- Sélectionner une catégorie --</option>
          <option value="Centres médicaux - Médecins">
            Centres médicaux - Médecins
          </option>
          <option value="Pharmacies">Pharmacies</option>
          <option value="Centres d'imagerie médicale">
            Centres d'imagerie médicale
          </option>
          <option value="Laboratoires d'analyse">Laboratoires d'analyse</option>
          <option value="Cabinets dentaires">Cabinets dentaires</option>
          <option value="Opticien">Opticien</option>
          <option value="Hôpitaux et cliniques">Hôpitaux et cliniques</option>
          <option value="Centres de dialyse">Centres de dialyse</option>
          <option value="Cliniques spécialisées en oncologie">
            Cliniques en oncologie
          </option>
          <option value="Centres spécialisés en diabétologie">
            Diabétologie
          </option>
          <option value="Cliniques spécialisées en thyroïdologie">
            Thyroïdologie
          </option>
        </select>
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Ville</label>
        <select
          name="ville"
          style={styles.select}
          value={form.ville}
          onChange={handleChange}
          required
        >
          <option value="">-- Sélectionner une ville --</option>
          <option value="Ambanja">Ambanja</option>
          <option value="Ambatondrazaka">Ambatondrazaka</option>
          <option value="Ambilobe">Ambilobe</option>
          <option value="Amboasary-Atsimo">Amboasary-Atsimo</option>
          <option value="Ambositra">Ambositra</option>
          <option value="Ambovombe-Androy">Ambovombe-Androy</option>
          <option value="Andapa">Andapa</option>
          <option value="Antalaha">Antalaha</option>
          <option value="Antananarivo">Antananarivo</option>
          <option value="Antsirabe">Antsirabe</option>
          <option value="Antsiranana (Diego)">Antsiranana (Diego)</option>
          <option value="Antsohihy">Antsohihy</option>
          <option value="Brickaville">Brickaville</option>
          <option value="Farafangana">Farafangana</option>
          <option value="Fénérive-Est">Fénérive-Est</option>
        </select>
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Adresse complète</label>
        <input
          name="adresse"
          style={styles.input}
          value={form.adresse}
          onChange={handleChange}
          required
        />
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Téléphone</label>
        <input
          name="telephone"
          style={styles.input}
          value={form.telephone}
          onChange={handleChange}
          required
        />
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Prestations proposées</label>
        <textarea
          name="prestations"
          style={{ ...styles.input, height: 80 }}
          value={form.prestations}
          onChange={handleChange}
        />
      </div>

      <div style={styles.row}>
        <div style={{ flex: 1, marginRight: 10 }}>
          <label style={styles.label}>Latitude</label>
          <input
            name="latitude"
            style={styles.input}
            value={form.latitude}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Longitude</label>
          <input
            name="longitude"
            style={styles.input}
            value={form.longitude}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Photos (optionnel)</label>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        {form.photos.length > 0 && (
          <ul>
            {form.photos.map((photo, i) => (
              <li key={i}>{photo.name}</li>
            ))}
          </ul>
        )}
      </div>

      <button type="submit" style={styles.button}>
        Enregistrer
      </button>
    </form>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  form: {
    maxWidth: 700,
    margin: "40px auto",
    padding: 30,
    background: "#f9f9f9",
    borderRadius: 12,
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    color: "#0077b6",
  },
  group: {
    marginBottom: 20,
  },
  label: {
    display: "block",
    marginBottom: 5,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  select: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0077b6",
    color: "white",
    border: "none",
    padding: "12px 24px",
    fontSize: 16,
    borderRadius: 8,
    cursor: "pointer",
    display: "block",
    margin: "auto",
  },
};
