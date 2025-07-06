import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrestataireForm from './components/PrestataireForm';
import AdminDashboard from './components/AdminDashboard';
import PrestatairesList from './components/PrestatairesList';
import EditPrestataire from './components/EditPrestataire'; 
import AdminNavbar from './components/AdminNavbar';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <Router>
      <AdminNavbar />
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin/prestataires" element={<PrestatairesList />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/ajouter" element={<PrestataireForm />} />
        <Route path="/admin/edit/:id" element={<EditPrestataire />} />
        <Route path="/admin/users" element={<UserList />} />
        <Route path="/admin/users/new" element={<AddUser />} />
      </Routes>
    </Router>
  );
}

export default App;
