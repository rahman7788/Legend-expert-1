export default async function handler(req, res) {
  try {
    // Allow requests from any origin
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Preflight request
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Forward request to Yabes API
    const response = await fetch("https://yabes-api.pages.dev/api/ai/video/v1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.text(); // API may return text or JSON
    res.status(response.status).send(data);

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
