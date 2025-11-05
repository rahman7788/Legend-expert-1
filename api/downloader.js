// api/downloader.js
// Yeh Vercel serverless function hai jo video download karega

export default async function handler(req, res) {
    // Sirf POST requests accept karega
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { url: videoUrl } = req.body;

        if (!videoUrl) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Hum Cobalt API ka istemal kar rahe hain (ek free, open-source service)
        // Yeh API video URL ko process karke download link deti hai
        const apiResponse = await fetch('https://co.wuk.sh/api/json', {
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
        if (data.status === 'error' || !data.url) {
            return res.status(500).json({ error: data.text || 'Failed to get download link' });
        }

        // Agar sab sahi hai, toh download link wapas bhejein
        // data.url mein download link hoga
        return res.status(200).json({ downloadUrl: data.url });

    } catch (error) {
        console.error('Download API Error:', error);
        return res.status(500).json({ error: 'Something went wrong on our side.' });
    }
}
