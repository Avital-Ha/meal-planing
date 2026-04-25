import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../firebase/firestore.js";
import { doc, setDoc } from "firebase/firestore";
import "../Styles/MealPlaningKid.css";

export default function MealPlaningKid() {
  const location = useLocation();
  const user = location.state?.user;

  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const template = {
    breakfast: "",
    schoolMeal: "",
    lunch: "",
    snack: "",
    dinner: "",
  };

  const [weekPlan, setWeekPlan] = useState(
    days.reduce((acc, day) => {
      acc[day] = { ...template };
      return acc;
    }, {})
  );

  const handleChange = (day, meal, value) => {
    setWeekPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: value,
      },
    }));
  };

  const save = async () => {
    await setDoc(doc(db, "users", user.parentId, "children", user.id), {
      username: user.username,
      weekPlan,
    });

    alert("נשמר בהצלחה 🎉");
  };

  if (!user) return <div>אין גישה</div>;

  return (
  <div className="kid-container">
  <h2>היי {user.username} 👋</h2>

  <div className="kid-table-wrapper">
    <table className="kid-table">
      <thead>
        <tr>
          {days.map((d) => (
            <th key={d}>{d}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {Object.keys(template).map((meal) => (
          <tr key={meal}>
            {days.map((day) => (
              <td key={day}>
                <input
                  value={weekPlan[day][meal]}
                  onChange={(e) =>
                    handleChange(day, meal, e.target.value)
                  }
                />
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