import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firestore.js";
import { collection, getDocs } from "firebase/firestore";
import "../Styles/Login.css";

export default function LoginKid() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hashed = await hashPassword(password);

      const querySnapshot = await getDocs(collection(db, "users"));

      let found = null;

      querySnapshot.forEach((doc) => {
        const parent = doc.data();

        if (parent.children) {
          const match = parent.children.find(
            (c) =>
              c.username === username &&
              c.passwordHash === hashed
          );

          if (match) {
            found = {
              ...match,
              parentId: parent.id,
              user_type: "child",
            };
          }
        }
      });

      if (!found) throw new Error("שם משתמש או סיסמה שגויים");

      navigate("/MealPlaningKid", {
        state: { user: found },
      });
    } catch (err) {
      alert("שגיאה: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>כניסת ילד 👶</h1>

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "טוען..." : "התחבר"}
        </button>
      </form>
    </div>
  );
}