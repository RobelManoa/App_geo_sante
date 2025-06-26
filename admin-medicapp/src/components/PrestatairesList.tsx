import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

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
  const [filtered, setFiltered] = useState<Prestataire[]>([]);
  const [selected, setSelected] = useState<Prestataire | null>(null);

  const [search, setSearch] = useState("");
  const [ville, setVille] = useState("");
  const [prestation, setPrestation] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchPrestataires();
  }, []);

  useEffect(() => {
    filterData();
  }, [prestataires, search, ville, prestation]);

  const fetchPrestataires = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://appgeosante-production.up.railway.app/api/prestataires"
      );
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setPrestataires(data);
      setFiltered(data);
    } catch (err) {
      setError("Erreur de récupération des prestataires");
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let data = [...prestataires];

    if (search.trim() !== "") {
      data = data.filter((p) =>
        p.nom.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (ville) data = data.filter((p) => p.ville === ville);
    if (prestation) data = data.filter((p) => p.prestations === prestation);

    setFiltered(data);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer ce prestataire ?")) {
      try {
        await axios.delete(
          `https://appgeosante-production.up.railway.app/api/prestataires/${id}`
        );
        setPrestataires((prev) => prev.filter((p) => p._id !== id));
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleEdit = (id: string) => {
    window.location.href = `/admin/edit/${id}`;
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const villes = Array.from(new Set(prestataires.map((p) => p.ville)));
  const prestations = Array.from(
    new Set(prestataires.map((p) => p.prestations))
  );

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4 text-primary">Liste des prestataires</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Recherche par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
          >
            <option value="">Toutes les villes</option>
            {villes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={prestation}
            onChange={(e) => setPrestation(e.target.value)}
          >
            <option value="">Toutes les prestations</option>
            {prestations.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <>
          <div className="table-responsive shadow-sm rounded">
            <table className="table table-hover align-middle">
              <thead className="table-primary">
                <tr>
                  <th>Nom</th>
                  <th>Ville</th>
                  <th>Prestations</th>
                  <th>Photos</th>
                  <th>Voir</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((p) => (
                  <tr key={p._id}>
                    <td>{p.nom}</td>
                    <td>{p.ville}</td>
                    <td>{p.prestations}</td>
                    <td>
                      <img
                        src={p.photos[0]}
                        alt="photo"
                        className="rounded"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-info btn-sm"
                        onClick={() => setSelected(p)}
                        data-bs-toggle="modal"
                        data-bs-target="#detailModal"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="mt-4 d-flex justify-content-center">
            <ul className="pagination">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(page - 1)}>
                  Précédent
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <li
                  key={n}
                  className={`page-item ${n === page ? "active" : ""}`}
                >
                  <button className="page-link" onClick={() => setPage(n)}>
                    {n}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${page === totalPages ? "disabled" : ""}`}
              >
                <button className="page-link" onClick={() => setPage(page + 1)}>
                  Suivant
                </button>
              </li>
            </ul>
          </nav>

          {/* MODALE DETAILS */}
          {selected && (
            <div
              className="modal fade"
              id="detailModal"
              tabIndex={-1}
              aria-labelledby="detailModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title" id="detailModalLabel">
                      Détails du prestataire
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <h5 className="mb-3">{selected.nom}</h5>
                    <p>
                      <strong>Adresse :</strong> {selected.adresse}
                    </p>
                    <p>
                      <strong>Ville :</strong> {selected.ville}
                    </p>
                    <p>
                      <strong>Téléphone :</strong> {selected.telephone}
                    </p>
                    <p>
                      <strong>Prestations :</strong> {selected.prestations}
                    </p>
                    {selected.email && (
                      <p>
                        <strong>Email :</strong> {selected.email}
                      </p>
                    )}
                    {selected.siteWeb && (
                      <p>
                        <strong>Site Web :</strong>{" "}
                        <a
                          href={selected.siteWeb}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {selected.siteWeb}
                        </a>
                      </p>
                    )}
                    <div className="d-flex gap-2 flex-wrap mt-3">
                      {selected.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Photo ${index}`}
                          className="rounded"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(selected._id)}
                      data-bs-dismiss="modal"
                    >
                      Supprimer
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() => handleEdit(selected._id)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
