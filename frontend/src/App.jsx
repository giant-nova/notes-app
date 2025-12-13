import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page (Now contains the Login/Register Popup) */}
        <Route path="/" element={<Landing />} />

        {/* Protected Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Redirect unknown paths (and old /login links) back to Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;