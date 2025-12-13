import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing'; // <--- Import it

function App() {
  return (
    <Router>
      <Routes>
        {/* Set Landing as the default home page */}
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Redirect unknown paths to Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;