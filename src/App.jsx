import './App.css';
import { useState, useEffect} from "react";
import { HashRouter as Router, Routes, Route, useLocation ,useNavigate } from 'react-router-dom';
import ThemeToggle from "./components/ThemeToggle.jsx";

import Register from './components/Auth/Register.jsx';
import Landing from './components/Landing.jsx';
import LoginParent from './components/Auth/LoginParent.jsx';
import LoginKid from './components/Auth/LoginKid.jsx';

// 👇 חדשים
import MealPlaningParent from './components/MealPlaning/MealPlaningParent.jsx';
import MealPlaningKid from './components/MealPlaning/MealPlaningKid.jsx';



function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
   const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  console.log("Current location:", location.pathname);

  return (
    <div className="App">
            <ThemeToggle theme={theme} setTheme={setTheme} />
         
        <button type="button" className="home-btn" onClick={() => navigate("/")}>חזור לדף הבית</button>
     

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
       <Route path="/loginParent" element={<LoginParent />} />
        <Route path="/loginKid" element={<LoginKid />} />

        {/* 👨‍👩‍👧‍👦 הורה */}
        <Route path="/MealPlaningParent" element={<MealPlaningParent />} />

        {/* 👶 ילד */}
        <Route path="/MealPlaningKid" element={<MealPlaningKid />} />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
        <AppContent />
    </Router>
  );
}

export default AppWrapper;