import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddUser.css';
import { API_BASE_URL } from '../config/api';

interface FormData {
  societe: string;
  identifiant: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  dateArrivee: string;
  fonction: string;
  niveauFonction: string;
}

interface FormErrors {
  [key: string]: string;
}

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    societe: '',
    identifiant: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    dateArrivee: '',
    fonction: '',
    niveauFonction: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const fonctions = [
    'Médecin',
    'Infirmier',
    'Pharmacien',
    'Technicien',
    'Administratif',
    'Aide-soignant',
    'Kinésithérapeute',
    'Psychologue',
    'Chirurgien',
    'Spécialiste'
  ];

  const niveaux = [
    'Junior',
    'Intermédiaire',
    'Senior',
    'Expert',
    'Chef de service',
    'Directeur'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.societe.trim()) newErrors.societe = 'La société est requise';
      if (!formData.identifiant.trim()) newErrors.identifiant = "L'identifiant est requis";
      if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
      if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    }

    if (step === 2) {
      if (!formData.dateNaissance) newErrors.dateNaissance = 'La date de naissance est requise';
      if (!formData.dateArrivee) newErrors.dateArrivee = 'La date d\'arrivée est requise';
      
      // Validation des dates
      if (formData.dateNaissance && formData.dateArrivee) {
        const birthDate = new Date(formData.dateNaissance);
        const arrivalDate = new Date(formData.dateArrivee);
        const today = new Date();
        
        if (birthDate > today) {
          newErrors.dateNaissance = 'La date de naissance ne peut pas être dans le futur';
        }
        
        if (arrivalDate > today) {
          newErrors.dateArrivee = 'La date d\'arrivée ne peut pas être dans le futur';
        }
        
        if (birthDate > arrivalDate) {
          newErrors.dateArrivee = 'La date d\'arrivée doit être après la date de naissance';
        }
      }
    }

    if (step === 3) {
      if (!formData.fonction) newErrors.fonction = 'La fonction est requise';
      if (!formData.niveauFonction) newErrors.niveauFonction = 'Le niveau de fonction est requis';
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
      await axios.post(`${API_BASE_URL}/utilisateurs`, formData);
      toast.success('✅ Utilisateur créé avec succès !');
      navigate('/admin/users');
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateNaissance: string) => {
    if (!dateNaissance) return 0;
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
      "Aide-soignant": "aide-soignant",
      "Kinésithérapeute": "kinesitherapeute",
      "Psychologue": "psychologue",
      "Chirurgien": "chirurgien",
      "Spécialiste": "specialiste"
    };
    return colors[fonction] || "default";
  };

  return (
    <div className="add-user-container">
      {/* Header */}
      <div className="form-header">
        <div className="header-content">
          <h1>👤 Ajouter un nouvel utilisateur</h1>
          <p>Créez un nouveau profil pour votre équipe médicale</p>
        </div>
        <button
          onClick={() => navigate('/admin/users')}
          className="close-btn"
          title="Retour à la liste"
        >
          ✕
        </button>
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
                {step === 1 && 'Informations personnelles'}
                {step === 2 && 'Dates importantes'}
                {step === 3 && 'Fonction et niveau'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="user-form">
          {/* Step 1: Informations personnelles */}
          {currentStep === 1 && (
            <div className="form-step">
              <div className="step-header">
                <h2>📋 Informations personnelles</h2>
                <p>Renseignez les informations de base de l'utilisateur</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    🏢 Société <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="societe"
                    value={formData.societe}
                    onChange={handleChange}
                    onBlur={() => handleBlur('societe')}
                    className={`form-input ${errors.societe && touched.societe ? 'error' : ''}`}
                    placeholder="Nom de la société"
                  />
                  {errors.societe && touched.societe && (
                    <span className="error-message">{errors.societe}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    🆔 Identifiant <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="identifiant"
                    value={formData.identifiant}
                    onChange={handleChange}
                    onBlur={() => handleBlur('identifiant')}
                    className={`form-input ${errors.identifiant && touched.identifiant ? 'error' : ''}`}
                    placeholder="Identifiant unique"
                  />
                  {errors.identifiant && touched.identifiant && (
                    <span className="error-message">{errors.identifiant}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    👤 Nom <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    onBlur={() => handleBlur('nom')}
                    className={`form-input ${errors.nom && touched.nom ? 'error' : ''}`}
                    placeholder="Nom de famille"
                  />
                  {errors.nom && touched.nom && (
                    <span className="error-message">{errors.nom}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    👤 Prénom <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    onBlur={() => handleBlur('prenom')}
                    className={`form-input ${errors.prenom && touched.prenom ? 'error' : ''}`}
                    placeholder="Prénom"
                  />
                  {errors.prenom && touched.prenom && (
                    <span className="error-message">{errors.prenom}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Dates importantes */}
          {currentStep === 2 && (
            <div className="form-step">
              <div className="step-header">
                <h2>📅 Dates importantes</h2>
                <p>Définissez les dates clés de l'utilisateur</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    🎂 Date de naissance <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleChange}
                    onBlur={() => handleBlur('dateNaissance')}
                    className={`form-input ${errors.dateNaissance && touched.dateNaissance ? 'error' : ''}`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {formData.dateNaissance && (
                    <span className="info-message">
                      Âge calculé : {calculateAge(formData.dateNaissance)} ans
                    </span>
                  )}
                  {errors.dateNaissance && touched.dateNaissance && (
                    <span className="error-message">{errors.dateNaissance}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    🚀 Date d'arrivée <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateArrivee"
                    value={formData.dateArrivee}
                    onChange={handleChange}
                    onBlur={() => handleBlur('dateArrivee')}
                    className={`form-input ${errors.dateArrivee && touched.dateArrivee ? 'error' : ''}`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dateArrivee && touched.dateArrivee && (
                    <span className="error-message">{errors.dateArrivee}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Fonction et niveau */}
          {currentStep === 3 && (
            <div className="form-step">
              <div className="step-header">
                <h2>💼 Fonction et niveau</h2>
                <p>Définissez le poste et l'expérience de l'utilisateur</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    🏥 Fonction <span className="required">*</span>
                  </label>
                  <select
                    name="fonction"
                    value={formData.fonction}
                    onChange={handleChange}
                    onBlur={() => handleBlur('fonction')}
                    className={`form-select ${errors.fonction && touched.fonction ? 'error' : ''}`}
                  >
                    <option value="">Sélectionner une fonction</option>
                    {fonctions.map(fonction => (
                      <option key={fonction} value={fonction}>
                        {fonction}
                      </option>
                    ))}
                  </select>
                  {formData.fonction && (
                    <span className={`fonction-preview ${getFonctionColor(formData.fonction)}`}>
                      {formData.fonction}
                    </span>
                  )}
                  {errors.fonction && touched.fonction && (
                    <span className="error-message">{errors.fonction}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    📊 Niveau de fonction <span className="required">*</span>
                  </label>
                  <select
                    name="niveauFonction"
                    value={formData.niveauFonction}
                    onChange={handleChange}
                    onBlur={() => handleBlur('niveauFonction')}
                    className={`form-select ${errors.niveauFonction && touched.niveauFonction ? 'error' : ''}`}
                  >
                    <option value="">Sélectionner un niveau</option>
                    {niveaux.map(niveau => (
                      <option key={niveau} value={niveau}>
                        {niveau}
                      </option>
                    ))}
                  </select>
                  {errors.niveauFonction && touched.niveauFonction && (
                    <span className="error-message">{errors.niveauFonction}</span>
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
                  '✅ Enregistrer l\'utilisateur'
                )}
              </button>
            )}
            
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="btn btn-outline"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;