// api/downloader.js
// Yeh file aapke logic par based hai.
// Yeh link ko detect karke alag-alag API call karegi.

import ytdl from '@distube/ytdl-core';
import fetch from 'node-fetch';

// Helper function: TikTok (aapka logic)
async function getTikTok(url) {
    try {
        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.data && data.data.play) {
            return { downloadUrl: data.data.play };
        } else {
            return { error: 'No valid TikTok data' };
        }
    } catch (err) {
        return { error: err.message };
    }
}

// Helper function: YouTube (aapka logic)
async function getYouTube(url) {
    try {
        if (!ytdl.validateURL(url)) {
            return { error: 'Invalid YouTube URL' };
        }
        const info = await ytdl.getInfo(url);
        const format = ytdl.filterFormats(info.formats, 'videoandaudio').find(f => f.qualityLabel === '720p' || f.qualityLabel === '480p');
        
        if (format) {
            return { downloadUrl: format.url };
        } else {
            // Fallback: koi bhi video + audio waala format
            const fallbackFormat = ytdl.filterFormats(info.formats, 'videoandaudio')[0];
            if (fallbackFormat) {
                return { downloadUrl: fallbackFormat.url };
            }
            return { error: 'No video+audio format found' };
        }
    } catch (err) {
        return { error: err.message };
    }
}

// Helper function: Instagram (aapka logic)
async function getInstagram(url) {
    try {
        const api = `https://igram.world/api/ig/post?url=${encodeURIComponent(url)}`;
        const r = await fetch(api);
        const j = await r.json();

        if (j && j.data && j.data.length > 0) {
            // Pehli video ya image ka link
            return { downloadUrl: j.data[0].url };
        } else {
            return { error: 'No data found (igram)' };
        }
    } catch (err) {
        return { error: err.message };
    }
}


// MAIN HANDLER
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    let result;

    try {
        // Step 1: Detect platform
        if (url.includes("tiktok.com")) {
            result = await getTikTok(url);
        } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
            result = await getYouTube(url);
        } else if (url.includes("instagram.com")) {
            result = await getInstagram(url);
        } else {
            result = { error: 'This URL is not supported (unknown platform)' };
        }

        // Step 2: Send response
        if (result.error) {
            return res.status(400).json({ error: result.error });
        } else {
            return res.status(200).json({ downloadUrl: result.downloadUrl });
        }

    } catch (error) {
        console.error('Main Handler Error:', error);
        return res.status(500).json({ error: 'Something went wrong on our side (Main Catch)' });
    }
}
