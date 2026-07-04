import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, PrivateRoute } from './auth/AuthContext';
import LoginScreen from './screens/LoginScreen';
import ScanScreen from './screens/ScanScreen';
import ResultScreen from './screens/ResultScreen';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/scan"
            element={
              <PrivateRoute>
                <ScanScreen />
              </PrivateRoute>
            }
          />
          <Route
            path="/result"
            element={
              <PrivateRoute>
                <ResultScreen />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/scan" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
