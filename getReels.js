export default async function handler(req, res) {
  try {
    const supabaseRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/reels?select=*`,
      {
        headers: {
          "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      }
    );

    if (!supabaseRes.ok) {
      const errText = await supabaseRes.text();
      console.error("SUPABASE FETCH ERROR:", errText);
      return res.status(500).json({ error: "Failed to load reels" });
    }

    const data = await supabaseRes.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server crashed" });
  }
}
