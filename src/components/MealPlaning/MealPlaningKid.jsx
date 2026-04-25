import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../firebase/firestore.js";
import { doc, setDoc, getDoc } from "firebase/firestore";
import "../Styles/MealPlaningKid.css";
import meals from "../../Data/meals.json";

export default function MealPlaningKid() {
  const location = useLocation();
  const user = location.state?.user;

  const mealNames = {
    breakfast: "ארוחת בוקר",
    schoolMeal: "ארוחת עשר",
    lunch: "צהריים",
    snack: "חטיף",
    dinner: "ערב",
  };

  const template = {
    breakfast: "",
    schoolMeal: "",
    lunch: "",
    snack: "",
    dinner: "",
  };

  const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const [weekOffset, setWeekOffset] = useState(0);
  const [weekPlan, setWeekPlan] = useState({});

  // 📅 בניית ימים לפי שבוע
  const days = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + weekOffset * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      return {
        key: date.toISOString().slice(0, 10),
        label: `${dayNames[i]} ${date.getDate()}/${date.getMonth() + 1}`,
      };
    });
  }, [weekOffset]);

  const weekId = days[0]?.key;

  // 🧠 טעינה / יצירה של שבוע
  useEffect(() => {
    if (!user || !weekId) return;

    const loadWeek = async () => {
      const ref = doc(
        db,
        "users",
        user.parentId,
        "children",
        user.id,
        "mealPlans",
        weekId
      );

      const snap = await getDoc(ref);

      if (snap.exists()) {
        setWeekPlan(snap.data().weekPlan);
      } else {
        const init = {};
        days.forEach((d) => {
          init[d.key] = { ...template };
        });
        setWeekPlan(init);
      }
    };

    loadWeek();
  }, [weekId]);

  // ✏️ שינוי תא
  const handleChange = (dayKey, meal, value) => {
    setWeekPlan((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [meal]: value,
      },
    }));
  };

  // 💾 שמירה
  const save = async () => {
    await setDoc(
      doc(
        db,
        "users",
        user.parentId,
        "children",
        user.id,
        "mealPlans",
        weekId
      ),
      {
        username: user.username,
        weekPlan,
        weekStart: weekId,
        createdAt: new Date(),
      }
    );

    alert("נשמר בהצלחה 🎉");
  };

  if (!user) return <div>אין גישה</div>;

  return (
    <div className="kid-container">
      <h2>היי {user.username} 👋</h2>

      {/* ניווט שבועות */}
      <div className="week-nav">
        <button className="nav-btn" onClick={() => setWeekOffset((p) => p - 1)}>
          ‹
        </button>

        <h3>
          {days[0]?.label} - {days[6]?.label}
        </h3>

        <button className="nav-btn" onClick={() => setWeekOffset((p) => p + 1)}>
          ›
        </button>
      </div>

      {/* טבלה */}
      <div className="kid-table-wrapper">
        <table className="kid-table">
          <thead>
            <tr>
              <th></th>
              {days.map((d) => (
                <th key={d.key}>{d.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Object.keys(template).map((meal) => (
              <tr key={meal}>
                <th className="meal-label">{mealNames[meal]}</th>

                {days.map((day) => (
                  <td key={day.key}>
                    <div className="select-wrapper">
                      <select
                        value={weekPlan?.[day.key]?.[meal] || ""}
                        onChange={(e) =>
                          handleChange(day.key, meal, e.target.value)
                        }
                      >
                        <option value="">בחר ארוחה</option>

                        {meals[meal].map((item, i) => (
                          <option key={i} value={item.label}>
                            {item.emoji} {item.label}
                          </option>
                        ))}
                      </select>

                      {/* + רק כשהשדה ריק */}
                      {!weekPlan?.[day.key]?.[meal] && (
                        <span className="plus">+</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="kid-save-btn" onClick={save}>
        שמור תפריט
      </button>
    </div>
  );
}