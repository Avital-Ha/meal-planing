import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../firebase/firestore.js";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import "../Styles/MealPlaningKid.css";
import meals from "../../Data/meals.json";

export default function MealPlaningKid() {
  const location = useLocation();
  const user = location.state?.user;

  // 1. הגדרת סוגי הארוחות (המפתחות באנגלית כדי להתאים להורה)
  const mealTypes = ["breakfast", "lunch", "dinner"];
  
  const mealLabels = {
    breakfast: "בוקר",
    lunch: "צהריים",
    dinner: "ערב",
  };

  const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const [weekOffset, setWeekOffset] = useState(0);
  
  // 🛒 הסטייט המרכזי שמחזיק את המטריצה
  const [weekPlan, setWeekPlan] = useState({});

  // 📅 חישוב ימי השבוע הנוכחי לתצוגה
  const daysData = useMemo(() => {
    const start = new Date();
    const currentDay = start.getDay();
    // מאפסים את השבוע שיתחיל תמיד מיום ראשון
    start.setDate(start.getDate() - currentDay + weekOffset * 7);

    return daysOfWeek.map((dayName, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return {
        name: dayName, // "ראשון", "שני" וכו'
        label: `${dayName} ${date.getDate()}/${date.getMonth() + 1}`,
        dateStr: date.toISOString().slice(0, 10)
      };
    });
  }, [weekOffset]);

  // מזהה המסמך בפיbase נקבע לפי תאריך יום ראשון של אותו שבוע
  const weekId = daysData[0]?.dateStr;

  // 🧠 טעינת המטריצה מ-Firestore
  useEffect(() => {
    if (!user?.parentId || !user?.id || !weekId) return;

    const loadPlan = async () => {
      const docRef = doc(db, "parents", user.parentId, "children", user.id, "mealPlans", weekId);
      
      try {
        const snap = await getDoc(docRef);
        
        if (snap.exists() && snap.data().weekPlan) {
          setWeekPlan(snap.data().weekPlan);
        } else {
          // אם אין מסמך, מייצרים מטריצה ריקה נקייה: לכל יום יש בוקר, צהריים וערב ריקים
          const emptyMatrix = {};
          daysOfWeek.forEach(day => {
            emptyMatrix[day] = { breakfast: "", lunch: "", dinner: "" };
          });
          setWeekPlan(emptyMatrix);
        }
      } catch (err) {
        console.error("שגיאה בטעינת התפריט:", err);
      }
    };

    loadPlan();
  }, [weekId, user, weekOffset]);

  // ✏️ עדכון משבצת ספציפית במטריצה [יום][סוג ארוחה]
  const handleChange = (dayName, mealType, value) => {
    setWeekPlan((prev) => ({
      ...prev,
      [dayName]: {
        ...prev[dayName],
        [mealType]: value
      }
    }));
  };

  // 💾 שמירת המטריצה כפי שהיא לתוך ה-Database
  const savePlan = async () => {
    if (!user?.parentId || !user?.id) {
      alert("שגיאה: חסרים פרטי זיהוי");
      return;
    }

    const docRef = doc(db, "parents", user.parentId, "children", user.id, "mealPlans", weekId);

    try {
      await setDoc(docRef, {
        name: user.name || user.username || "ילד",
        weekPlan: weekPlan, // שמירת המטריצה המסודרת
        weekStart: weekId,
        updatedAt: serverTimestamp()
      });
      alert("התפריט נשמר בהצלחה! הלוח עודכן אצל ההורה 🏆");
    } catch (err) {
      alert("שגיאה בשמירה: " + err.message);
    }
  };

  if (!user) return <div className="error-access">אין גישה. נא להתחבר מחדש.</div>;

  return (
    <div className="kid-container">
      <h2>היי {user.name || user.username} 👋</h2>
      <p>בנה את לוח הארוחות השבועי שלך:</p>

      {/* ניווט שבועות */}
      <div className="week-nav">
        <button className="nav-btn" onClick={() => setWeekOffset((p) => p - 1)}>‹</button>
        <h3>{daysData[0]?.label} - {daysData[6]?.label}</h3>
        <button className="nav-btn" onClick={() => setWeekOffset((p) => p + 1)}>›</button>
      </div>

      {/* טבלת המטריצה של הילד */}
      <div className="kid-table-wrapper">
        <table className="kid-table">
          <thead>
            <tr>
              <th>ארוחה</th>
              {daysData.map((d) => (
                <th key={d.name}>{d.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {mealTypes.map((mealType) => (
              <tr key={mealType}>
                <td className="meal-label">{mealLabels[mealType]}</td>

                {daysData.map((day) => (
                  <td key={day.name}>
                    <div className="select-wrapper">
                      <select
                        value={weekPlan[day.name]?.[mealType] || ""}
                        onChange={(e) => handleChange(day.name, mealType, e.target.value)}
                      >
                        <option value="">בחר מנה</option>
                        {meals[mealType]?.map((item, i) => (
                          <option key={i} value={item.label}>
                            {item.emoji} {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="kid-save-btn" onClick={savePlan}>
        💾 שמור תפריט שבועי
      </button>
    </div>
  );
}