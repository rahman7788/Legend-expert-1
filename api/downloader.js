// api/downloader.js
// Yeh Vercel function hai jo naye service (Consumet) ka istemal karega

export default async function handler(req, res) {
    // Step 1: Check karein ki request 'POST' hai
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Step 2: User ka bheja hua URL nikaalein
        const { url: videoUrl } = req.body;

        if (!videoUrl) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // ===== YAHAN HAI NAYA FIX =====
        // Hum ab 'Consumet' API ka istemal kar rahe hain, jo 'yt-dlp' par chalti hai
        // Yeh ek GET request hai
        const externalApiUrl = `https://api.consumet.org/utils/extractor?url=${encodeURIComponent(videoUrl)}`;

        const apiResponse = await fetch(externalApiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await apiResponse.json();

        // Step 3: Check karein ki naye service ne link diya ya error
        // 'data.sources' ek array hota hai video links ka
        if (data.sources && data.sources.length > 0) {
            // Hum sabse pehla wala link (jo aksar best quality hota hai) utha rahe hain
            const downloadLink = data.sources[0].url;
            return res.status(200).json({ downloadUrl: downloadLink });
        } else {
            // Agar koi error message aaya (jaise "Unsupported URL")
            return res.status(400).json({ error: data.message || 'This URL is not supported' });
        }

    } catch (error) {
        console.error('Download API Error:', error);
        return res.status(500).json({ error: 'Something went wrong on our side.' });
    }
}
