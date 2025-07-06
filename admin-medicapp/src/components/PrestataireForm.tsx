import React, { useState, useRef } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './PrestataireForm.css';

interface FormData {
  ville: string;
  categorie: string;
  nom: string;
  adresse: string;
  telephone: string;
  prestations: string;
  latitude: string;
  longitude: string;
  photos: File[];
}

interface FormErrors {
  [key: string]: string;
}

export default function PrestataireForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormData>({
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "Centres médicaux - Médecins",
    "Pharmacies",
    "Centres d'imagerie médicale",
    "Laboratoires d'analyse",
    "Cabinets dentaires",
    "Opticien",
    "Hôpitaux et cliniques",
    "Centres de dialyse",
    "Cliniques spécialisées en oncologie",
    "Centres spécialisés en diabétologie",
    "Cliniques spécialisées en thyroïdologie"
  ];

  const villes = [
    "Ambanja",
    "Ambatondrazaka",
    "Ambilobe",
    "Amboasary-Atsimo",
    "Ambositra",
    "Ambovombe-Androy",
    "Andapa",
    "Antalaha",
    "Antananarivo",
    "Antsirabe",
    "Antsiranana (Diego)",
    "Antsohihy",
    "Brickaville",
    "Farafangana",
    "Fénérive-Est"
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, photos: Array.from(e.target.files) });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!form.nom.trim()) newErrors.nom = 'Le nom du prestataire est requis';
      if (!form.categorie) newErrors.categorie = 'La catégorie est requise';
      if (!form.ville) newErrors.ville = 'La ville est requise';
    }

    if (step === 2) {
      if (!form.adresse.trim()) newErrors.adresse = 'L\'adresse est requise';
      if (!form.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
      
      // Validation du téléphone
      const phoneRegex = /^(\+261|0)?[0-9]{9}$/;
      if (form.telephone && !phoneRegex.test(form.telephone.replace(/\s/g, ''))) {
        newErrors.telephone = 'Format de téléphone invalide (ex: 0341234567)';
      }
    }

    if (step === 3) {
      if (!form.latitude.trim()) newErrors.latitude = 'La latitude est requise';
      if (!form.longitude.trim()) newErrors.longitude = 'La longitude est requise';
      
      // Validation des coordonnées
      const lat = parseFloat(form.latitude);
      const lng = parseFloat(form.longitude);
      
      if (isNaN(lat) || lat < -25.5 || lat > -11.5) {
        newErrors.latitude = 'Latitude invalide pour Madagascar (-25.5 à -11.5)';
      }
      
      if (isNaN(lng) || lng < 43.0 || lng > 50.5) {
        newErrors.longitude = 'Longitude invalide pour Madagascar (43.0 à 50.5)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    setLoading(true);
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
        "https://appgeosante-production.up.railway.app/api/prestataires",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success('✅ Prestataire ajouté avec succès !');
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
      setCurrentStep(1);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'ajout du prestataire';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (categorie: string) => {
    const colors: { [key: string]: string } = {
      "Centres médicaux - Médecins": "medecin",
      "Pharmacies": "pharmacie",
      "Centres d'imagerie médicale": "imagerie",
      "Laboratoires d'analyse": "laboratoire",
      "Cabinets dentaires": "dentaire",
      "Opticien": "optique",
      "Hôpitaux et cliniques": "hopital",
      "Centres de dialyse": "dialyse",
      "Cliniques spécialisées en oncologie": "oncologie",
      "Centres spécialisés en diabétologie": "diabete",
      "Cliniques spécialisées en thyroïdologie": "thyroide"
    };
    return colors[categorie] || "default";
  };

  const removePhoto = (index: number) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="prestataire-form-container">
      {/* Header */}
      <div className="form-header">
        <div className="header-content">
          <h1>🏥 Ajouter un prestataire de santé</h1>
          <p>Enregistrez un nouveau prestataire médical dans votre réseau</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="progress-container">
        <div className="progress-steps">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
            >
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && 'Informations générales'}
                {step === 2 && 'Contact et adresse'}
                {step === 3 && 'Localisation'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="prestataire-form">
          {/* Step 1: Informations générales */}
          {currentStep === 1 && (
            <div className="form-step">
              <div className="step-header">
                <h2>📋 Informations générales</h2>
                <p>Renseignez les informations de base du prestataire</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    🏥 Nom du prestataire <span className="required">*</span>
                  </label>
                  <input
                    name="nom"
                    className={`form-input ${errors.nom && touched.nom ? 'error' : ''}`}
                    value={form.nom}
                    onChange={handleChange}
                    onBlur={() => handleBlur('nom')}
                    placeholder="Nom du centre médical"
                  />
                  {errors.nom && touched.nom && (
                    <span className="error-message">{errors.nom}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    🏷️ Catégorie <span className="required">*</span>
                  </label>
                  <select
                    name="categorie"
                    className={`form-select ${errors.categorie && touched.categorie ? 'error' : ''}`}
                    value={form.categorie}
                    onChange={handleChange}
                    onBlur={() => handleBlur('categorie')}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(categorie => (
                      <option key={categorie} value={categorie}>
                        {categorie}
                      </option>
                    ))}
                  </select>
                  {form.categorie && (
                    <span className={`category-preview ${getCategoryColor(form.categorie)}`}>
                      {form.categorie}
                    </span>
                  )}
                  {errors.categorie && touched.categorie && (
                    <span className="error-message">{errors.categorie}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    🏙️ Ville <span className="required">*</span>
                  </label>
                  <select
                    name="ville"
                    className={`form-select ${errors.ville && touched.ville ? 'error' : ''}`}
                    value={form.ville}
                    onChange={handleChange}
                    onBlur={() => handleBlur('ville')}
                  >
                    <option value="">Sélectionner une ville</option>
                    {villes.map(ville => (
                      <option key={ville} value={ville}>
                        {ville}
                      </option>
                    ))}
                  </select>
                  {errors.ville && touched.ville && (
                    <span className="error-message">{errors.ville}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    📝 Prestations proposées
                  </label>
                  <textarea
                    name="prestations"
                    className="form-textarea"
                    value={form.prestations}
                    onChange={handleChange}
                    placeholder="Décrivez les services proposés..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact et adresse */}
          {currentStep === 2 && (
            <div className="form-step">
              <div className="step-header">
                <h2>📞 Contact et adresse</h2>
                <p>Définissez les informations de contact du prestataire</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    📍 Adresse complète <span className="required">*</span>
                  </label>
                  <input
                    name="adresse"
                    className={`form-input ${errors.adresse && touched.adresse ? 'error' : ''}`}
                    value={form.adresse}
                    onChange={handleChange}
                    onBlur={() => handleBlur('adresse')}
                    placeholder="Adresse complète du prestataire"
                  />
                  {errors.adresse && touched.adresse && (
                    <span className="error-message">{errors.adresse}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    📱 Téléphone <span className="required">*</span>
                  </label>
                  <input
                    name="telephone"
                    className={`form-input ${errors.telephone && touched.telephone ? 'error' : ''}`}
                    value={form.telephone}
                    onChange={handleChange}
                    onBlur={() => handleBlur('telephone')}
                    placeholder="0341234567"
                  />
                  {errors.telephone && touched.telephone && (
                    <span className="error-message">{errors.telephone}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Localisation */}
          {currentStep === 3 && (
            <div className="form-step">
              <div className="step-header">
                <h2>🗺️ Localisation</h2>
                <p>Définissez les coordonnées géographiques du prestataire</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    📍 Latitude <span className="required">*</span>
                  </label>
                  <input
                    name="latitude"
                    type="number"
                    step="any"
                    className={`form-input ${errors.latitude && touched.latitude ? 'error' : ''}`}
                    value={form.latitude}
                    onChange={handleChange}
                    onBlur={() => handleBlur('latitude')}
                    placeholder="-18.8792"
                  />
                  {errors.latitude && touched.latitude && (
                    <span className="error-message">{errors.latitude}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    📍 Longitude <span className="required">*</span>
                  </label>
                  <input
                    name="longitude"
                    type="number"
                    step="any"
                    className={`form-input ${errors.longitude && touched.longitude ? 'error' : ''}`}
                    value={form.longitude}
                    onChange={handleChange}
                    onBlur={() => handleBlur('longitude')}
                    placeholder="47.5079"
                  />
                  {errors.longitude && touched.longitude && (
                    <span className="error-message">{errors.longitude}</span>
                  )}
                </div>
              </div>

              {/* Photos Section */}
              <div className="photos-section">
                <div className="form-group">
                  <label className="form-label">
                    📸 Photos du prestataire
                  </label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                    <div className="upload-placeholder">
                      <span className="upload-icon">📸</span>
                      <p>Cliquez pour sélectionner des photos</p>
                      <small>Formats acceptés: JPG, PNG, GIF</small>
                    </div>
                  </div>
                  
                  {form.photos.length > 0 && (
                    <div className="photos-preview">
                      <h4>Photos sélectionnées ({form.photos.length})</h4>
                      <div className="photos-grid">
                        {form.photos.map((photo, i) => (
                          <div key={i} className="photo-item">
                            <span className="photo-name">{photo.name}</span>
                            <button
                              type="button"
                              onClick={() => removePhoto(i)}
                              className="remove-photo"
                              title="Supprimer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-secondary"
              >
                ← Précédent
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
              >
                Suivant →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Enregistrement...
                  </>
                ) : (
                  '✅ Enregistrer le prestataire'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
