// api/downloader.js
// Yeh Vercel serverless function hai jo video download karega

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { url: videoUrl } = req.body;

        if (!videoUrl) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // ===== FIX YAHAN HAI =====
        // Humne 'co.wuk.sh' ko badal kar official 'api.cobalt.tools' kar diya hai
        // Yeh zyada reliable hai
        const apiResponse = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: videoUrl,
                vQuality: '720', // Video quality (720p)
                isNoTTWatermark: true // TikTok se watermark hatane ki koshish karega
            })
        });

        const data = await apiResponse.json();

        // Check karein agar service ne error diya
        // (Jaise "This platform is not supported")
        if (data.status === 'error' || !data.url) {
            // Hum ab service ka original error message dikhayenge
            return res.status(400).json({ error: data.text || 'Failed to get download link' });
        }

        // Agar sab sahi hai, toh download link wapas bhejein
        return res.status(200).json({ downloadUrl: data.url });

    } catch (error) {
        console.error('Download API Error:', error);
        return res.status(500).json({ error: 'Something went wrong on our side.' });
    }
}
