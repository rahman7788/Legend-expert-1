// api/downloader.js
// Yeh ek NAYI service ka istemal kar raha hai.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { url: videoUrl } = req.body;
        if (!videoUrl) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // ===== YAHAN HAI FINAL FIX =====
        // Hum ek nayi external service 'api.download-video.net' ka istemal kar rahe hain
        const apiResponse = await fetch('https://api.download-video.net/api/downloader', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: videoUrl
            })
        });

        // Check karein agar API ne response hi nahi diya
        if (!apiResponse.ok) {
            const errorText = await apiResponse.text(); // Error text padhein
            console.error('API Error Response:', errorText);
            return res.status(apiResponse.status).json({ error: 'The download service failed to respond.' });
        }
        
        const data = await apiResponse.json();

        // Step 3: Check karein ki naye service ne link diya ya error
        // 'data.data.medias' ek array hota hai video links ka
        if (data.success && data.data && data.data.medias && data.data.medias.length > 0) {
            
            // Hum sabse pehla wala link utha rahe hain
            // Yeh 'url' property dhoondhega
            const downloadLink = data.data.medias[0].url;

            if (downloadLink) {
                 return res.status(200).json({ downloadUrl: downloadLink });
            } else {
                 return res.status(400).json({ error: 'API returned success but no download link found.' });
            }
           
        } else {
            // Agar koi error message aaya (jaise "Unsupported URL")
            console.error('Service Error:', data);
            return res.status(400).json({ error: data.message || 'This URL is not supported by the new service.' });
        }

    } catch (error) {
        console.error('Download API Error:', error);
        return res.status(500).json({ error: 'Something went wrong on our side (Catch Block).' });
    }
}
