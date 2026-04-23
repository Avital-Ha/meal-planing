import './App.css';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Register from './components/Auth/Register.jsx';
import Landing from './components/Landing.jsx';
import Login from './components/Auth/Login.jsx';
import OutfitWizard from './components/Outfit/OutfitWizard.jsx';

import { LanguageProvider } from "./context/LanguageContext";

function AppContent() {
  const location = useLocation();

  console.log("Current location:", location.pathname);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/OutfitWizard" element={<OutfitWizard />} />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </Router>
  );
}

export default AppWrapper;