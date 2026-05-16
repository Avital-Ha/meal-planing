import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../firebase/firestore.js";
import { collection, getDocs } from "firebase/firestore";
import "../Styles/MealPlaningParent.css";

export default function MealPlaningParent() {
  const location = useLocation();
  const user = location.state?.user;

  const [childrenData, setChildrenData] = useState([]);
  
  // ניהול השבוע הנוכחי המוצג עבור כל ילד (מפתח: childId, ערך: תאריך ה-weekStart כסטרינג)
  const [currentWeeks, setCurrentWeeks] = useState({});
  // החזקת כלל התפריטים שנשלפו מה-DB כדי לחסוך קריאות (מפתח: childId, ערך: מערך תפריטים)
  const [allPlans, setAllPlans] = useState({});
  
  // ניהול מצב פתוח/סגור של כרטיס הילד
  const [expandedChildren, setExpandedChildren] = useState({});
  
  const [shoppingNotes, setShoppingNotes] = useState({});
  // רשימת קניות מופרדת לפי ילד ולפי שבוע מוגדר: { [childId]: { [weekStart]: { [meal]: count } } }
  const [shoppingLists, setShoppingLists] = useState({});

  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const mealTypes = ["breakfast", "lunch", "dinner"];
  
  const mealLabels = {
    breakfast: "בוקר",
    lunch: "צהריים",
    dinner: "ערב"
  };

  // פונקציית עזר לקבלת תאריך יום ראשון הקרוב/הנוכחי בפורמט YYYY-MM-DD
  const getFormattedSunday = (d) => {
    const day = d.getDay();
    const diff = d.getDate() - day;
    const sunday = new Date(d.setDate(diff));
    return sunday.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        const childrenSnap = await getDocs(
          collection(db, "parents", user.id, "children")
        );

        const childrenResult = [];
        const plansResult = {};
        const initialWeeks = {};
        const initialOpenState = {};

        const currentSundayStr = getFormattedSunday(new Date());

        for (const childDoc of childrenSnap.docs) {
          const childId = childDoc.id;
          const childData = childDoc.data();

          childrenResult.push({ id: childId, ...childData });
          initialOpenState[childId] = true; // כרטיסי הילדים יתחילו כפתוחים

          // שליפת כל התוכניות הזמינות באוסף mealPlans עבור הילד
          const plansSnap = await getDocs(
            collection(db, "parents", user.id, "children", childId, "mealPlans")
          );

          const childPlans = [];
          plansSnap.forEach((doc) => {
            childPlans.push({ id: doc.id, ...doc.data() });
          });

          // מיון התוכניות מהחדש ביותר לישן ביותר (לפי מפתח התאריך/weekStart)
          childPlans.sort((a, b) => b.id.localeCompare(a.id));
          plansResult[childId] = childPlans;

          // קביעת השבוע שיוצג ראשון: השבוע הנוכחי, או השבוע הכי עדכני שיש לילד ב-DB
          if (childPlans.length > 0) {
            const hasCurrentWeek = childPlans.find(p => p.weekStart === currentSundayStr);
            initialWeeks[childId] = hasCurrentWeek ? currentSundayStr : childPlans[0].weekStart;
          } else {
            initialWeeks[childId] = currentSundayStr;
          }
        }

        setChildrenData(childrenResult);
        setAllPlans(plansResult);
        setCurrentWeeks(initialWeeks);
        setExpandedChildren(initialOpenState);
      } catch (err) {
        console.error("שגיאה בטעינת הנתונים מהשרת:", err);
      }
    };

    fetchData();
  }, [user]);

  // ניווט שבועות בזמן זז קדימה/אחורה (באינטרוולים של 7 ימים)
  const changeWeek = (childId, direction) => {
    const currentWeekStr = currentWeeks[childId];
    if (!currentWeekStr) return;

    const currentDate = new Date(currentWeekStr);
    const offset = direction === "next" ? 7 : -7;
    currentDate.setDate(currentDate.getDate() + offset);
    
    const newWeekStr = currentDate.toISOString().split("T")[0];
    setCurrentWeeks(prev => ({ ...prev, [childId]: newWeekStr }));
  };

  const toggleChildCard = (childId) => {
    setExpandedChildren(prev => ({ ...prev, [childId]: !prev[childId] }));
  };

  const handleCellClick = (childId, weekStr, mealName) => {
    if (!mealName || mealName === "-" || mealName.trim() === "") return;

    setShoppingLists((prev) => {
      const childData = { ...prev[childId] };
      const weekData = { ...childData[weekStr] };
      
      weekData[mealName] = (weekData[mealName] || 0) + 1;
      childData[weekStr] = weekData;

      return { ...prev, [childId]: childData };
    });
  };

  const handleRemoveItem = (childId, weekStr, item) => {
    setShoppingLists((prev) => {
      const childData = { ...prev[childId] };
      const weekData = { ...childData[weekStr] };

      if (weekData[item] > 1) {
        weekData[item] -= 1;
      } else {
        delete weekData[item];
      }

      childData[weekStr] = weekData;
      return { ...prev, [childId]: childData };
    });
  };

  const updateNote = (childId, item, value) => {
    setShoppingNotes((prev) => ({
      ...prev,
      [childId]: { ...prev[childId], [item]: value },
    }));
  };

  // פונקציה לייצוא ושיתוף רשימת הקניות לוואטסאפ
  const shareToWhatsApp = (childName, selectedWeek, list, childId) => {
    let message = `🛒 *רשימת קניות מותאמת עבור ${childName}* \n📅 *שבוע:* ${selectedWeek}\n\n`;
    
    Object.entries(list).forEach(([item, count]) => {
      const note = shoppingNotes?.[childId]?.[item];
      message += `• ${item} (כמות: ${count})`;
      if (note && note.trim() !== "") {
        message += ` _[הערה: ${note}]_`;
      }
      message += `\n`;
    });

    message += `\nנשלח מאפליקציית תכנון הארוחות 👨‍👩‍👧`;

    // קידוד הטקסט ל-URL ושילוחו לוואטסאפ הכללי (מאפשר לבחור איש קשר)
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`, "_blank");
  };

  if (!user) return <div className="error-access">אין גישה למסך זה. נא להתחבר מחדש.</div>;

  return (
    <div className="parent-container">
      <header className="parent-header">
        <h1>שלום הורה 👨‍👩‍👧</h1>
        <p className="parent-subtitle">
          הקלק על הארוחות בטבלה כדי לבנות את רשימת הקניות שלך בצורה מותאמת אישית לכל שבוע.
        </p>
      </header>

      {childrenData.length === 0 ? (
        <p className="no-children">לא נמצאו ילדים רשומים במערכת.</p>
      ) : (
        childrenData.map((child, index) => {
          const selectedWeek = currentWeeks[child.id];
          const childPlansList = allPlans[child.id] || [];
          
          // מציאת האובייקט התואם לשבוע הנבחר מתוך רשימת התוכניות של הילד
          const currentPlanObj = childPlansList.find(p => p.weekStart === selectedWeek);
          const weekPlan = currentPlanObj?.weekPlan || {};
          
          // שליפת רשימת הקניות הספציפית לילד ולשבוע זה
          const list = shoppingLists[child.id]?.[selectedWeek] || {};
          const isExpanded = expandedChildren[child.id];
          const childName = child.name || child.username;

          return (
            <section key={child.id} className={`child-card-layout color-variant-${index % 6}`}>
              
              {/* כותרת הכרטיס המשמשת גם כטוגל לפתיחה וסגירה */}
              <div className="child-card-header" onClick={() => toggleChildCard(child.id)}>
                <h2>לוח הארוחות של: {childName} 👶</h2>
                <button className="toggle-collapse-btn" type="button">
                  {isExpanded ? "▲ כווץ לוח" : "▼ פרוס לוח"}
                </button>
              </div>

              {isExpanded && (
                <div className="child-card-body">
                  
                  {/* בורר שבועות דינמי בדומה למסך הילד */}
                  <div className="week-picker-container">
                    <button className="week-nav-btn" onClick={() => changeWeek(child.id, "prev")}>◀ שבוע קודם</button>
                    <span className="week-current-label">טווח שבוע: <strong>{selectedWeek}</strong></span>
                    <button className="week-nav-btn" onClick={() => changeWeek(child.id, "next")}>שבוע הבא ▶</button>
                  </div>

                  <div className="parent-flex">
                    
                    {/* 🧾 TABLE RIGHT */}
                    <div className="parent-table-wrapper">
                      <table className="parent-table">
                        <thead>
                          <tr>
                            <th>ארוחה</th>
                            {days.map((d) => (
                              <th key={d}>{d}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {mealTypes.map((meal) => (
                            <tr key={meal}>
                              <td className="meal-label">{mealLabels[meal]}</td>
                              {days.map((day) => {
                                const dbValue = weekPlan[day]?.[meal];
                                const mealName = dbValue && dbValue.trim() !== "" ? dbValue : "-";
                                const isClickable = mealName !== "-";

                                return (
                                  <td 
                                    key={day}
                                    onClick={() => handleCellClick(child.id, selectedWeek, mealName)}
                                    className={isClickable ? "clickable-meal-cell" : "empty-meal-cell"}
                                  >
                                    {mealName}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 🛒 LIST LEFT */}
                    <div className="shopping-section">
                      <div className="shopping-title-area">
                        <h3>🛒 רשימת קניות מותאמת</h3>
                        <span className="shopping-week-tag">{selectedWeek}</span>
                      </div>
                      
                      {Object.keys(list).length === 0 ? (
                        <p className="empty-list-placeholder">
                          הרשימה לשבוע זה ריקה.<br />לחץ על מאכלים מהטבלה כדי להוסיף אותם!
                        </p>
                      ) : (
                        <>
                          {Object.entries(list).map(([item, count]) => (
                            <div key={item} className="shopping-item">
                              <div className="shopping-item-row">
                                <span className="item-name">
                                  {item} <strong className="item-count">× {count}</strong>
                                </span>
                                <button 
                                  type="button" 
                                  className="delete-item-btn"
                                  onClick={() => handleRemoveItem(child.id, selectedWeek, item)}
                                >
                                  ❌
                                </button>
                              </div>
                              <input
                                className="shopping-note-input"
                                value={shoppingNotes?.[child.id]?.[item] || ""}
                                onChange={(e) => updateNote(child.id, item, e.target.value)}
                                placeholder="הוסף הערה לעצמך..."
                              />
                            </div>
                          ))}
                          
                          {/* כפתור שיתוף לוואטסאפ */}
                          <button 
                            type="button" 
                            className="whatsapp-share-btn"
                            onClick={() => shareToWhatsApp(childName, selectedWeek, list, child.id)}
                          >
                            🟢 שחרר רשימה לוואטסאפ
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}