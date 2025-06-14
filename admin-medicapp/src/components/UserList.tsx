import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">👥 Gestion des Utilisateurs</h1>
        <Link
          to="/admin/users/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          ➕ Ajouter un utilisateur
        </Link>
      </div>

      {loading && <div className="text-center text-gray-600">Chargement...</div>}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {!loading && !error && (
        <div className="overflow-auto rounded shadow border border-gray-200">
          <table className="min-w-full bg-white table-auto" border={1}>
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="py-3 px-4 text-left">Société</th>
                <th className="py-3 px-4 text-left">Identifiant</th>
                <th className="py-3 px-4 text-left">Nom</th>
                <th className="py-3 px-4 text-left">Prénom</th>
                <th className="py-3 px-4 text-left">Date Naissance</th>
                <th className="py-3 px-4 text-left">Date Arrivée</th>
                <th className="py-3 px-4 text-left">Fonction</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4">{user.societe}</td>
                  <td className="py-3 px-4">{user.identifiant}</td>
                  <td className="py-3 px-4">{user.nom}</td>
                  <td className="py-3 px-4">{user.prenom}</td>
                  <td className="py-3 px-4">{formatDate(user.dateNaissance)}</td>
                  <td className="py-3 px-4">{formatDate(user.dateArrivee)}</td>
                  <td className="py-3 px-4">{user.fonction}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/users/edit/${user._id}`}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow text-sm btn btn-primary"
                      >
                        ✏️ Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow text-sm"
                      >
                        🗑️ Supprimer
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
};

export default UserList;
