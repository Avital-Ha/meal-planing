import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth } from "../../firebase/auth.js";
import { db } from "../../firebase/firestore.js";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";

import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import "../Styles/Register.css";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 👶 רשימת הילדים (עכשיו צריך רק שם, בלי סיסמה!)
  const [children, setChildren] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // 👶 הוספת ילד
  const addChild = () => {
    setChildren((prev) => [
      ...prev,
      { name: "" }, // שומרים רק את שם הילד
    ]);
  };

  // ✏️ עדכון שם הילד
  const updateChild = (index, value) => {
    const updated = [...children];
    updated[index].name = value;
    setChildren(updated);
  };

  // ❌ מחיקת ילד מהרשימה
  const removeChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  // 🚀 submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password) {
      setError("נא למלא את כל השדות של ההורה");
      return;
    }

    try {
      // 👨 יצירת הורה ב-Auth
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const parentId = cred.user.uid;

      await updateProfile(cred.user, {
        displayName: fullName,
      });

      await sendEmailVerification(cred.user);

      // 👨 שמירת ההורה ב-Firestore (תחת parents)
      await setDoc(doc(db, "parents", parentId), {
        full_name: fullName,
        email,
        user_type: "parent",
        createdAt: serverTimestamp(),
      });

      // 👶 שמירת הילדים תחת ההורה
      for (const child of children) {
        if (!child.name) continue;

        await addDoc(
          collection(db, "parents", parentId, "children"),
          {
            name: child.name,
            parentId,
            user_type: "child",
            createdAt: serverTimestamp(),
          }
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (success) {
    return (
      <div className="register-container">
        <h2 className="Register-title">הצלחה 🎉</h2>
        <p className="register-text">נרשמת בהצלחה! שלחנו מייל אימות לכתובת שלך.</p>

        <button
          className="register-button2"
          onClick={() => navigate("/")}
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
        {/* 👨 פרטי הורה */}
        <h3>פרטי הורה 👨‍👩‍👧</h3>
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
          placeholder="סיסמה (לפחות 6 תווים)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
        />

        <hr style={{ margin: "20px 0", borderColor: "#eee" }} />

        {/* 👶 פרטי ילדים */}
        <h3>ילדים 👶</h3>
        {children.map((child, index) => (
          <div key={index} className="child-form" style={{ marginBottom: "15px" }}>
            <h4>ילד {index + 1}</h4>

            <input
              type="text"
              placeholder="שם הילד (למשל: עומר)"
              value={child.name}
              onChange={(e) => updateChild(index, e.target.value)}
              required
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

        <button
          type="button"
          onClick={addChild}
          className="add-child-button"
          style={{ marginBottom: "20px" }}
        >
          ➕ הוסף ילד
        </button>

        {error && <p className="register-error">{error}</p>}

        <button className="register-button" type="submit">
          בצע הרשמה
        </button>
      </form>
    </div>
  );
}