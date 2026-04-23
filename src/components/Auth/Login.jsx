import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/auth.js";
import { db } from "../../firebase/firestore.js";
import { doc, getDoc } from "firebase/firestore";
import "../Styles/Login.css";
import i18n from "../../i18n";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );

      const docRef = doc(db, "users", userCredential.user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) throw new Error("User not found");

      const userData = docSnap.data();

      // Set the language globally using i18next
      if (userData.language) {
        i18n.changeLanguage(userData.language);
      }

      alert(`Welcome, ${userData.fullName}!`);

      // Navigate to FirstPage with user data
      navigate("/OutfitWizard", { state: { user: userData } });
    } catch (error) {
      alert(`Login error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;