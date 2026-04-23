import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore.js";
import { generateOutfit } from "../../servecies/aiService.js";
import "../Styles/OutfitWizard.css";
import { useLocation } from "react-router-dom";

export default function OutfitWizard() {
  const location = useLocation();
  const user = location.state?.user;
  const userId = user?.uid;

  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  const [eventType, setEventType] = useState("");
  const [style, setStyle] = useState("");
  const [skinTone, setSkinTone] = useState("");
  const [shirtSize, setShirtSize] = useState("");
  const [pantsSize, setPantsSize] = useState("");
  const [favColors, setFavColors] = useState("#000000");
  const [accessories, setAccessories] = useState("");
  const [notes, setNotes] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null); // ⚡ image state

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      setUserLoading(true);
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSkinTone(data.skinTone || "");
          setShirtSize(data.shirtSize || "");
          setPantsSize(data.pantsSize || "");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleNext = () => setActive((current) => (current < 3 ? current + 1 : current));
  const handlePrev = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = async () => {
    if (!userId) {
      alert("User not loaded yet!");
      return;
    }

    if (!eventType || !style || !skinTone) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    setGeneratedImage(null); // clear previous image

    try {
      const prompt = `
Create a stylish outfit image.

USER DETAILS
Event: ${eventType}
Style: ${style}
Skin tone: ${skinTone}
Shirt size: ${shirtSize}
Pants size: ${pantsSize}
Preferred color: ${favColors}
Accessories preference: ${accessories}
Extra notes: ${notes}
`;

      console.log("PROMPT SENT TO AI:");
      console.log(prompt);

      // Generate image via Nano Banan public Space
      const outfitImage = await generateOutfit(prompt);
      setGeneratedImage(outfitImage);

      // Save in Firestore
      const outfitRef = collection(db, "users", userId, "outfits");
      await addDoc(outfitRef, {
        eventType,
        style,
        skinTone,
        shirtSize,
        pantsSize,
        favColors,
        accessories,
        notes,
        outfitImage,
        createdAt: new Date(),
      });

      await setDoc(doc(db, "users", userId), { skinTone, shirtSize, pantsSize }, { merge: true });

      alert("Outfit generated successfully!");
      setActive(0);

    } catch (err) {
      console.error("AI ERROR:", err);
      alert("Failed to generate outfit. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!userId || userLoading) return <p>Loading user data...</p>;

  return (
    <div className="wizard-container">
      <h2 className="wizard-title">Hello, {user.fullName}!</h2>

      {/* Step 0 */}
      {active === 0 && (
        <div className="step">
          <label>Event</label>
          <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
            <option value="">Select event</option>
            <option value="Wedding">Wedding</option>
            <option value="Work">Work</option>
            <option value="Party">Party</option>
            <option value="Sports">Sports</option>
          </select>

          <label>Style</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="">Select style</option>
            <option value="Casual">Casual</option>
            <option value="Elegant">Elegant</option>
            <option value="Trendy">Trendy</option>
          </select>
        </div>
      )}

      {/* Step 1 */}
      {active === 1 && (
        <div className="step">
          <label>Skin Tone</label>
          <select value={skinTone} onChange={(e) => setSkinTone(e.target.value)}>
            <option value="">Select skin tone</option>
            <option value="Light">Light</option>
            <option value="Medium">Medium</option>
            <option value="Dark">Dark</option>
          </select>

          <label>Shirt Size</label>
          <select value={shirtSize} onChange={(e) => setShirtSize(e.target.value)}>
            <option value="">Select size</option>
            <option>XXS</option>
            <option>XS</option>
            <option>S</option>
            <option>M</option>
            <option>L</option>
            <option>XL</option>
            <option>2XL</option>
            <option>3XL</option>
          </select>

          <label>Pants Size</label>
          <select value={pantsSize} onChange={(e) => setPantsSize(e.target.value)}>
            <option value="">Select size</option>
            <option>XXS</option>
            <option>XS</option>
            <option>S</option>
            <option>M</option>
            <option>L</option>
            <option>XL</option>
            <option>2XL</option>
            <option>3XL</option>
          </select>
        </div>
      )}

      {/* Step 2 */}
      {active === 2 && (
        <div className="step">
          <label>Favorite Color</label>
          <input type="color" value={favColors} onChange={(e) => setFavColors(e.target.value)} />

          <label>Accessories</label>
          <input type="text" value={accessories} onChange={(e) => setAccessories(e.target.value)} />

          <label>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>
      )}

      {/* Step 3 */}
      {active === 3 && (
        <div className="step">
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Generating..." : "Generate Outfit"}
          </button>

          {generatedImage && (
            <div className="outfit-result" style={{ marginTop: "20px" }}>
              <img src={generatedImage} alt="Generated Outfit" style={{ maxWidth: "100%" }} />
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="step-buttons">
        {active > 0 && <button onClick={handlePrev}>Back</button>}
        {active < 3 && <button onClick={handleNext}>Next</button>}
      </div>
    </div>
  );
}