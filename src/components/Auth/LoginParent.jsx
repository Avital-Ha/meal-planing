import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth } from "../../firebase/auth.js";
import { db } from "../../firebase/firestore.js";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";

import "../Styles/Login.css";

export default function LoginParent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // שדות עבור חיבור הילד
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [parentUid, setParentUid] = useState("");
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [kidCode, setKidCode] = useState("");

  const navigate = useNavigate();

  // 1. התחברות ההורה
  const handleParentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      setParentUid(uid);

      // שונה מ-"users" ל-"parents" כדי למנוע את שגיאת ה-Not Found
      const parentRef = doc(db, "parents", uid);
      const parentSnap = await getDoc(parentRef);

      if (!parentSnap.exists()) {
        throw new Error("משתמש לא נמצא באוסף ההורים ב-Firestore");
      }

      // טעינת רשימת הילדים של ההורה כדי שיוכל לבחור את מי לחבר
      const childrenSnap = await getDocs(collection(db, "parents", uid, "children"));
      const kids = childrenSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setChildrenList(kids);
      if (kids.length > 0) setSelectedChildId(kids[0].id);

      setIsLoggedIn(true); // מעביר אותנו לשלב ב' - אישור הילד
    } catch (err) {
      alert("שגיאה: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. אישור קוד הילד
  const handleApproveKid = async (e) => {
    e.preventDefault();
    if (!kidCode || !selectedChildId) return alert("נא להזין קוד ולבחור ילד");

    setLoading(true);
    try {
      const upperCode = kidCode.toUpperCase().trim();
      const codeRef = doc(db, "connection_codes", upperCode);
      const codeSnap = await getDoc(codeRef);

      if (!codeSnap.exists()) {
        throw new Error("הקוד שהוקלד אינו תקין או שפג תוקפו");
      }

      // מעדכנים את המסמך הזמני - הילד יזהה את זה מיד ב-onSnapshot שלו
      await updateDoc(codeRef, {
        status: "approved",
        parentId: parentUid,
        childId: selectedChildId
      });

      alert("הילד חובר בהצלחה! המכשיר שלו יועבר כעת למסך הארוחות.");
      
      // כעת מעבירים את ההורה למסך שלו
      navigate("/MealPlaningParent", { 
        state: { user: { id: parentUid, email: auth.currentUser.email, user_type: "parent" } } 
      });

    } catch (err) {
      alert("שגיאה באישור הקוד: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-conttent">
      {!isLoggedIn ? (
        <>
          <h1 className="login-header-text">כניסת הורה 👨‍👩‍👧</h1>
          <form onSubmit={handleParentSubmit} className="login-form">
            <input
              type="email"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
              
            <button disabled={loading}>{loading ? "טוען..." : "התחבר"}</button>
          </form>
        
        </>
      ) : (
        <>
          <h1 className="login-header-text">חיבור מכשיר לילד 👶</h1>
          <p style={{ textAlign: "center", marginBottom: "16px", color: "var(--text)" }}>
            בחר אם לחבר ילד או להמשיך ישירות לטבלת הקניות.
          </p>
          <form onSubmit={handleApproveKid} className="login-form">
            <label>בחר איזה ילד לחבר:</label>
            <select 
              value={selectedChildId} 
              onChange={(e) => setSelectedChildId(e.target.value)}
            >
              {childrenList.map(kid => (
                <option key={kid.id} value={kid.id}>{kid.name || kid.username}</option>
              ))}
            </select>

            <label>הזן קוד חיבור:</label>
            <input
              type="text"
              placeholder="הקש את הקוד שמופיע אצל הילד (למשל: 7Y39B)"
              value={kidCode}
              onChange={(e) => setKidCode(e.target.value)}
              maxLength={5}
              style={{ textTransform: "uppercase", textAlign: "center", fontSize: "1.3rem", fontWeight: "bold", letterSpacing: "2px" }}
              required
            />
            <button disabled={loading}>{loading ? "מאשר..." : "אשר וחבר ילד"}</button>
          </form>
          <div style={{ width: "min(420px, 90vw)", marginTop: "18px", textAlign: "center" }}>
            <button
              type="button"
              className="go-to-mealplan-btn"
              style={{ width: "100%" }}
              onClick={() => navigate("/MealPlaningParent", {
                state: { user: { id: parentUid, email: email, user_type: "parent" } }
              })}
            >
              המשך לטבלת הקניות ללא חיבור ילד
            </button>
          </div>
        </>
      )}
    </div>
    </div>
  );
}