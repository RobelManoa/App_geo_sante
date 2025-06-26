import React from "react";
import { Link } from "react-router-dom";

const AdminNavbar: React.FC = () => {
  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        <strong>MedicApp Admin</strong>
      </div>
      <div style={styles.links}>
        <Link to="/admin" style={styles.link}>🏠 Accueil</Link>
        <Link to="/admin/prestataires" style={styles.link}>Liste Prestataire</Link>
        <Link to="/admin/ajouter" style={styles.link}>➕ Ajouter</Link>
        <Link to="/admin/users" style={styles.link}>👤 Utilisateurs</Link>
        <Link to="/" style={styles.link}>🚪 Déconnexion</Link>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: "#0077b6",
    padding: "10px 20px",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  } as React.CSSProperties,
  logo: {
    fontSize: "20px",
  },
  links: {
    display: "flex",
    gap: "20px",
  } as React.CSSProperties,
  link: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "500",
  } as React.CSSProperties,
};

export default AdminNavbar;
