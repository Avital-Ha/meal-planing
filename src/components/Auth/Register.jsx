import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/auth.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { db } from "../../firebase/firestore.js";
import { doc, setDoc, collection } from "firebase/firestore";
import "../Styles/Register.css";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [children, setChildren] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // 🔐 hash
  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const addChild = () => {
    setChildren((prev) => [...prev, { username: "", password: "" }]);
  };

  const updateChild = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const removeChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password) {
      setError("נא למלא את כל השדות");
      return;
    }

    try {
      // 👨 הורה Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const parentId = userCredential.user.uid;

      await updateProfile(userCredential.user, {
        displayName: fullName,
      });

      await sendEmailVerification(userCredential.user);

      // 👨‍👩‍👧 parent document
      await setDoc(doc(db, "parents", parentId), {
        full_name: fullName,
        email,
        user_type: "parent",
        createdAt: new Date(),
      });

      // 👶 children collection
      await Promise.all(
        children.map(async (child) => {
          const passwordHash = await hashPassword(child.password);

          const childRef = doc(collection(db, "children"));

          await setDoc(childRef, {
            username: child.username,
            passwordHash,
            parentId,
            user_type: "child",
            createdAt: new Date(),
          });
        })
      );

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (success) {
    return (
      <div className="register-container">
        <h2 className="Register-title">הצלחה 🎉</h2>
        <p className="register-text">נרשמת בהצלחה</p>

        <button className="register-button2" onClick={() => navigate("/")}>
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

        {/* 👶 ילדים */}
        {children.map((child, index) => (
          <div key={index} className="child-form">
            <h4>ילד {index + 1}</h4>

            <input
              type="text"
              placeholder="שם משתמש"
              value={child.username}
              onChange={(e) =>
                updateChild(index, "username", e.target.value)
              }
            />

            <input
              type="password"
              placeholder="סיסמה"
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
              ❌ מחק ילד
            </button>
          </div>
        ))}

        <button type="button" onClick={addChild} className="add-child-button">
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