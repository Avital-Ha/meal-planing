import React from "react";
import "./Styles/ThemToggle.css";

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <div className="theme-toggle">
      <button
        className={`theme-btn ${theme}`}
        onClick={() => setTheme(t => (t === "light" ? "dark" : "light"))}
        aria-label="Toggle theme"
      >
        <div className="thumb">
          {theme === "light" ? "🌞" : "🌙"}
        </div>
      </button>
    </div>
  );
}