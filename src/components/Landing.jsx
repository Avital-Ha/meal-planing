import React from "react";
import { useNavigate } from "react-router-dom";
import "./Styles/Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <h1 className="landing-title">תכנון ארוחת משפחתי  </h1>
      <p className="landing-text">הילדים רוצים לאכול ולא קניתם מה שהם צריכים הבית ? נמאס לכם לשאול כל יום מה הם רוצים ? ובנינו הדף על המקרר פשוט לא עובד אז נסו עכשיו </p>

      <section className="landing-buttons">
        <button onClick={() => navigate("/register")}> הרשמה הורה וילד</button>
        <button onClick={() => navigate("/loginParent")}>התחברות הורה</button>
        <button onClick={() => navigate("/loginKid")}>התחברות ילד</button>
      </section>
    </div>
  );
}