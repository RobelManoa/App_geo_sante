import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EditPrestataire() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    ville: '',
    categorie: '',
    nom: '',
    adresse: '',
    telephone: '',
    prestations: '',
    latitude: '',
    longitude: '',
    photos: [] as File[],
  });

  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/prestataires/${id}`);
        const data = res.data;
        setForm({
          ville: data.ville || '',
          categorie: data.categorie || '',
          nom: data.nom || '',
          adresse: data.adresse || '',
          telephone: data.telephone || '',
          prestations: data.prestations || '',
          latitude: data.localisation?.latitude?.toString() || '',
          longitude: data.localisation?.longitude?.toString() || '',
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({
        ...form,
        photos: Array.from(e.target.files),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      formData.append("ville", form.ville);
      formData.append("categorie", form.categorie);
      formData.append("nom", form.nom);
      formData.append("adresse", form.adresse);
      formData.append("telephone", form.telephone);
      formData.append("prestations", form.prestations);
      formData.append("latitude", form.latitude);
      formData.append("longitude", form.longitude);

      form.photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      await axios.put(`http://localhost:5000/api/prestataires/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Prestataire mis à jour avec succès !");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du prestataire");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Modifier un prestataire</h2>

      <input
        name="nom"
        placeholder="Nom du prestataire"
        value={form.nom}
        onChange={handleChange}
        required
      />

      <select name="categorie" value={form.categorie} onChange={handleChange} required>
        <option value="">-- Sélectionner une catégorie --</option>
        <option value="Hôpitaux et cliniques">Hôpitaux et cliniques</option>
        <option value="Pharmacies">Pharmacies</option>
        <option value="Cabinets dentaires">Cabinets dentaires</option>
        <option value="Opticien">Opticien</option>
        <option value="Centres de dialyse">Centres de dialyse</option>
        <option value="Cliniques spécialisées en oncologie">Cliniques spécialisées en oncologie</option>
        <option value="Centres spécialisés en diabétologie">Centres spécialisés en diabétologie</option>
        <option value="Cliniques spécialisées en thyroïdologie">Cliniques spécialisées en thyroïdologie</option>
      </select>

      <select name="ville" value={form.ville} onChange={handleChange} required>
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

      <input name="adresse" placeholder="Adresse" value={form.adresse} onChange={handleChange} required />
      <input name="telephone" placeholder="Téléphone" value={form.telephone} onChange={handleChange} required />
      <textarea name="prestations" placeholder="Prestations" value={form.prestations} onChange={handleChange} />
      <input name="latitude" placeholder="Latitude" value={form.latitude} onChange={handleChange} required />
      <input name="longitude" placeholder="Longitude" value={form.longitude} onChange={handleChange} required />

      <div style={{ margin: "20px 0" }}>
        <label>Ajouter de nouvelles photos :</label>
        <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
        {form.photos.length > 0 && (
          <ul>
            {form.photos.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}

        {existingPhotos.length > 0 && (
          <>
            <p>Photos existantes :</p>
            <ul>
              {existingPhotos.map((url, idx) => (
                <li key={idx}>
                  <img src={`http://localhost:5000/uploads/${url}`} alt={`photo ${idx + 1}`} width="100" />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <button type="submit" style={{ marginTop: 20 }}>Mettre à jour</button>
    </form>
  );
}
