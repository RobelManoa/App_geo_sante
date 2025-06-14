import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.societe) newErrors.societe = 'La société est requise';
    if (!formData.identifiant) newErrors.identifiant = "L'identifiant est requis";
    if (!formData.nom) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom) newErrors.prenom = 'Le prénom est requis';
    if (!formData.dateNaissance) newErrors.dateNaissance = 'La date de naissance est requise';
    if (!formData.dateArrivee) newErrors.dateArrivee = 'La date d\'arrivée est requise';
    if (!formData.fonction) newErrors.fonction = 'La fonction est requise';
    if (!formData.niveauFonction) newErrors.niveauFonction = 'Le niveau de fonction est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.post('https://appgeosante-production.up.railway.app/api/utilisateurs', formData);
      toast.success('Utilisateur créé avec succès');
      navigate('/admin/users');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ajouter un nouvel utilisateur</h1>
          <button
            onClick={() => navigate('/admin/users')}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Société */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Société *</label>
              <input
                type="text"
                name="societe"
                value={formData.societe}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.societe ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.societe && <p className="text-red-500 text-xs mt-1">{errors.societe}</p>}
            </div>

            {/* Identifiant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant *</label>
              <input
                type="text"
                name="identifiant"
                value={formData.identifiant}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.identifiant ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.identifiant && <p className="text-red-500 text-xs mt-1">{errors.identifiant}</p>}
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.nom ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.prenom ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
            </div>

            {/* Date de Naissance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de Naissance *</label>
              <input
                type="date"
                name="dateNaissance"
                value={formData.dateNaissance}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.dateNaissance ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.dateNaissance && <p className="text-red-500 text-xs mt-1">{errors.dateNaissance}</p>}
            </div>

            {/* Date d'Arrivée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'Arrivée *</label>
              <input
                type="date"
                name="dateArrivee"
                value={formData.dateArrivee}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.dateArrivee ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.dateArrivee && <p className="text-red-500 text-xs mt-1">{errors.dateArrivee}</p>}
            </div>

            {/* Fonction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fonction *</label>
              <input
                type="text"
                name="fonction"
                value={formData.fonction}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.fonction ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.fonction && <p className="text-red-500 text-xs mt-1">{errors.fonction}</p>}
            </div>

            {/* Niveau de Fonction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau de Fonction *</label>
              <select
                name="niveauFonction"
                value={formData.niveauFonction}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.niveauFonction ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Sélectionner un niveau</option>
                <option value="Junior">Junior</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Senior">Senior</option>
                <option value="Expert">Expert</option>
              </select>
              {errors.niveauFonction && <p className="text-red-500 text-xs mt-1">{errors.niveauFonction}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
