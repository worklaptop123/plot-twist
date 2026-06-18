export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { notes, metrics, userEmail } = req.body;

    // HuggingFace API call
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid-xt"
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: notes || "dream sequence",
          parameters: {
            num_frames: 24,
            fps: 12
          }
        })
      }
    );

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      console.error("HF ERROR:", errText);
      return res.status(500).json({ error: "HF generation failed" });
    }

    const videoBuffer = Buffer.from(await hfRes.arrayBuffer());

    // Upload to Supabase
    const fileName = `dream_${Date.now()}.mp4`;

    const uploadRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/dreams/${fileName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "video/mp4",
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        },
        body: videoBuffer
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("SUPABASE UPLOAD ERROR:", errText);
      return res.status(500).json({ error: "Upload failed" });
    }

    const publicUrl =
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/dreams/${fileName}`;

    return res.status(200).json({
      videoUrl: publicUrl,
      title: notes?.slice(0, 40) || "Recovered dream",
      duration: 5,
      createdAt: new Date().toISOString()
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server crashed" });
  }
}
