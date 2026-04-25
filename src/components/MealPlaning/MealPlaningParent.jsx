import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../firebase/firestore.js";
import { doc, getDoc } from "firebase/firestore";
import "../Styles/MealPlaningParent.css";

export default function MealPlaningParent() {
  const location = useLocation();
  const user = location.state?.user;

  const [childrenData, setChildrenData] = useState([]);

  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      const docRef = doc(db, "users", user.id);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setChildrenData(snap.data().children || []);
      }
    };

    fetchData();
  }, [user]);

  const colors = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff"];

  const generateShoppingList = (weekPlan) => {
    const items = [];

    Object.values(weekPlan || {}).forEach((day) => {
      Object.values(day).forEach((meal) => {
        if (meal) {
          items.push(...meal.split(",").map((i) => i.trim()));
        }
      });
    });

    return [...new Set(items)];
  };

  if (!user) return <div>אין גישה</div>;

  return (
    <div className="parent-container">
      <h1>שלום הורה 👨‍👩‍👧</h1>

      {childrenData.map((child, index) => (
        <div
          key={index}
          className="child-card"
          style={{ background: colors[index % colors.length] }}
        >
          <h2>{child.username}</h2>

          <div className="table-wrapper">
            <table className="meal-table">
              <thead>
                <tr>
                  {days.map((day) => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {child.weekPlan &&
                  Object.keys(child.weekPlan[days[0]] || {}).map(
                    (mealKey) => (
                      <tr key={mealKey}>
                        {days.map((day) => (
                          <td key={day}>
                            {child.weekPlan?.[day]?.[mealKey] || "-"}
                          </td>
                        ))}
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => {
              const list = generateShoppingList(child.weekPlan);
              alert(`רשימת קניות של ${child.username}:\n` + list.join(", "));
            }}
          >
            צור רשימת קניות 🛒
          </button>
        </div>
      ))}
    </div>
  );
}