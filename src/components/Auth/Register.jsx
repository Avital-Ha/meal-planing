import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/auth.js";
import { db } from "../../firebase/firestore.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "../Styles/Register.css";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [children, setChildren] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // 🔐 פונקציית hash בסיסית
  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  // ➕ הוספת ילד
  const addChild = () => {
    setChildren([...children, { username: "", password: "" }]);
  };

  // ✏️ עדכון ילד
  const updateChild = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  // ❌ מחיקת ילד
  const removeChild = (index) => {
    const updated = children.filter((_, i) => i !== index);
    setChildren(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!fullName || !email || !password) {
      setError("נא למלא את כל השדות");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: fullName,
      });

      await sendEmailVerification(userCredential.user);

      // 🔐 עושים hash לסיסמאות הילדים
      const childrenWithHash = await Promise.all(
        children.map(async (child, index) => ({
          id: index + 1,
          username: child.username,
          passwordHash: await hashPassword(child.password),
          user_type: "child",
          parentId: userCredential.user.uid,
        }))
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        id: userCredential.user.uid,
        full_name: fullName,
        email,
        user_type: "parent",
        children: childrenWithHash,
        createdAt: new Date(),
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (success) {
    return (
      <div className="register-container">
        <h2 className="Entrance-title">הצלחה!</h2>
        <p className="register-text">נרשמת בהצלחה 🎉</p>

        <button
          className="register-button2"
          onClick={() => navigate("/login")}
        >
          מעבר להתחברות
        </button>
      </div>
    );
  }

  return (
    <div className="register-container">
      <h2 className="Register-title">הרשמה</h2>

      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="שם מלא"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
        />

        {/* ילדים */}
        {children.map((child, index) => (
          <div key={index} className="child-form">
            <h4>ילד {index + 1}</h4>

            <input
              type="text"
              placeholder="שם משתמש לילד"
              value={child.username}
              onChange={(e) =>
                updateChild(index, "username", e.target.value)
              }
            />

            <input
              type="password"
              placeholder="סיסמה לילד"
              value={child.password}
              onChange={(e) =>
                updateChild(index, "password", e.target.value)
              }
            />

            <button
              type="button"
              onClick={() => removeChild(index)}
              className="remove-child-button"
            >
              ❌ הסר ילד
            </button>
          </div>
        ))}

        <button
          type="button"
          className="add-child-button"
          onClick={addChild}
        >
          ➕ הוסף ילד
        </button>

        {error && <p className="register-error">{error}</p>}

        <button className="register-button" type="submit">
          הרשמה
        </button>
      </form>
    </div>
  );
}