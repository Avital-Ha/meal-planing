import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firestore.js";
import { doc, setDoc, onSnapshot, deleteDoc, getDoc } from "firebase/firestore";
import "../Styles/Login.css";

export default function LoginKid() {
  const [pairCode, setPairCode] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // פונקציה לייצור קוד אקראי קצר
  const generateShortCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ללא O ו-0 כדי למנוע בלבול
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    const code = generateShortCode();
    setPairCode(code);
    setLoading(false);

    // יצירת מסמך זמני בתוך Firestore עבור הקוד הזה
    const codeRef = doc(db, "connection_codes", code);
    setDoc(codeRef, {
      status: "pending",
      createdAt: new Date(),
    });

    // 🎧 האזנה בזמן אמת - ברגע שההורה יאשר, הסטטוס ישתנה
    const unsubscribe = onSnapshot(codeRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();

        if (data.status === "approved") {
          unsubscribe(); // מפסיקים להאזין

          try {
            // מושכים את נתוני הילד המלאים מתוך נתיב ההורה המאובטח
            const childRef = doc(db, "parents", data.parentId, "children", data.childId);
            const childSnap = await getDoc(childRef);

            if (childSnap.exists()) {
              const childData = childSnap.data();
              const foundUser = {
                id: childSnap.id,
                parentId: data.parentId,
                ...childData,
                user_type: "child",
              };

              // שמירה לחיבור אוטומטי בעתיד
              localStorage.setItem("user", JSON.stringify(foundUser));

              // מחיקת הקוד הזמני מ-Firestore כדי לשמור על ה-DB נקי
              await deleteDoc(codeRef);

              // מעבר למסך הארוחות
              navigate("/MealPlaningKid", { state: { user: foundUser } });
            }
          } catch (err) {
            alert("שגיאה במשיכת נתוני הילד: " + err.message);
          }
        }
      }
    });

    // Clean up במקרה שהילד סוגר את המסך באמצע
    return () => {
      unsubscribe();
      deleteDoc(codeRef).catch(() => {});
    };
  }, [navigate]);

  return (
    <div className="login-container">
      <h1>כניסת ילד 👶</h1>
      {loading ? (
        <p>מייצר קוד חיבור... ⏳</p>
      ) : (
        <div className="code-display-container" style={{ textAlign: "center", margin: "20px 0" }}>
          <p>בקש מההורה להיכנס לאפליקציה שלו ולהזין את הקוד הבא:</p>
          <div style={{ fontSize: "3rem", fontWeight: "bold", letterSpacing: "5px", color: "#4CAF50" }}>
            {pairCode}
          </div>
          <p>ממתין לאישור ההורה... 🔄</p>
        </div>
      )}
    </div>
  );
}