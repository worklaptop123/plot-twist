export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const reel = req.body;

    const supabaseRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/reels`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify(reel)
      }
    );

    if (!supabaseRes.ok) {
      const errText = await supabaseRes.text();
      console.error("SUPABASE INSERT ERROR:", errText);
      return res.status(500).json({ error: "Failed to save reel" });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server crashed" });
  }
}
