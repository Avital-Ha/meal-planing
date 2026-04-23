export async function generateOutfit(prompt) {
  const response = await fetch("/api/outfit-generator", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await response.json();
  return data.image; 
}