import React, { useEffect, useState } from "react";
import axios from "axios";

interface Prestataire {
  _id: string;
  nom: string;
  ville: string;
  telephone: string;
  prestations: string;
  adresse: string;
  photos: string[];
  localisation: {
    lat: number;
    lng: number;
  };
  email?: string;
  siteWeb?: string;
}

export default function PrestatairesList() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPrestataires();
  }, [page]);

  const fetchPrestataires = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("http://localhost:5000/api/prestataires");
      console.log("Réponse API:", res.data);

      if (Array.isArray(res.data)) {
        setPrestataires(res.data);
        setTotalPages(1);
      } else if (Array.isArray(res.data.data)) {
        setPrestataires(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      } else {
        throw new Error("Format de données inattendu");
      }
    } catch (err) {
      setError("Erreur de récupération des prestataires");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce prestataire ?")) {
      try {
        await axios.delete(`http://localhost:5000/api/prestataires/${id}`);
        setPrestataires((prev) => prev.filter((p) => p._id !== id));
        alert("Prestataire supprimé avec succès !");
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleEdit = (id: string) => {
    window.location.href = `/admin/edit/${id}`;
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "auto", padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
        Liste des prestataires
      </h2>

      {error && (
        <div
          style={{
            color: "#721c24",
            backgroundColor: "#f8d7da",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "20px",
            border: "1px solid #f5c6cb",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          Chargement en cours...
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto", marginBottom: "20px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "800px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#0077b6", color: "white" }}>
                  <th style={{ padding: "12px", textAlign: "left" }}>Nom</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Ville</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Téléphone
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Prestations
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Adresse
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Photos</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Localisation
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {prestataires.map((p) => (
                  <tr key={p._id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "12px" }}>{p.nom}</td>
                    <td style={{ padding: "12px" }}>{p.ville}</td>
                    <td style={{ padding: "12px" }}>{p.telephone}</td>
                    <td style={{ padding: "12px" }}>{p.prestations}</td>
                    <td style={{ padding: "12px" }}>{p.adresse}</td>
                    <td style={{ padding: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          overflowX: "auto",
                          gap: "5px",
                        }}
                      >
                        {p.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                            alt={`Photo ${index + 1} de ${p.nom}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {p.localisation?.lat !== undefined &&
                      p.localisation?.lng !== undefined ? (
                        <a
                          href={`https://www.google.com/maps?q=${p.localisation.lat},${p.localisation.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#0077b6", textDecoration: "none" }}
                        >
                          Voir sur la carte
                        </a>
                      ) : (
                        <span style={{ color: "#888" }}>Non disponible</span>
                      )}
                    </td>

                    <td style={{ padding: "12px" }}>
                      <button
                        onClick={() => handleEdit(p._id)}
                        style={{
                          marginRight: "8px",
                          padding: "6px 12px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Modifier
                      </button>

                      <button
                        onClick={() => handleDelete(p._id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              style={{
                padding: "8px 16px",
                backgroundColor: page === 1 ? "#cccccc" : "#0077b6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              Précédent
            </button>
            <span>
              Page {page} sur {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: "8px 16px",
                backgroundColor: page === totalPages ? "#cccccc" : "#0077b6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: page === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Suivant
            </button>
          </div>
        </>
      )}
    </div>
  );
}
