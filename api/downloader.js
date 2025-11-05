import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";
import ytdl from "@distube/ytdl-core"; // safer youtube library

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("✅ All-in-One Social Downloader API Running");
});

// ---------- TIKTOK (No Watermark) ----------
app.post("/tiktok", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.json({ status: "error", message: "Missing URL" });

    // public endpoint (safe educational use)
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.data && data.data.play) {
      return res.json({
        status: "success",
        platform: "tiktok",
        title: data.data.title,
        thumbnail: data.data.cover,
        noWatermark: data.data.play,
        music: data.data.music,
      });
    } else {
      return res.json({ status: "error", message: "No valid data" });
    }
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

// ---------- YOUTUBE ----------
app.post("/youtube", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.json({ status: "error", message: "Missing URL" });

    if (!ytdl.validateURL(url)) {
      return res.json({ status: "error", message: "Invalid YouTube URL" });
    }

    const info = await ytdl.getInfo(url);
    const formats = ytdl.filterFormats(info.formats, "videoandaudio");
    res.json({
      status: "success",
      platform: "youtube",
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.pop().url,
      formats: formats.map(f => ({
        quality: f.qualityLabel,
        mimeType: f.mimeType,
        url: f.url,
      })),
    });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

// ---------- INSTAGRAM ----------
app.post("/instagram", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.json({ status: "error", message: "Missing URL" });

    const api = `https://igram.world/api/ig/post?url=${encodeURIComponent(url)}`;
    const r = await fetch(api);
    const j = await r.json();
    if (j && j.data && j.data.length > 0) {
      return res.json({
        status: "success",
        platform: "instagram",
        items: j.data.map(item => ({
          type: item.type,
          url: item.url,
          thumbnail: item.thumbnail,
        })),
      });
    } else {
      return res.json({ status: "error", message: "No data found" });
    }
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

// ---------- FACEBOOK ----------
app.post("/facebook", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.json({ status: "error", message: "Missing URL" });

    // !!! IMPORTANT !!!
    // Aapko "demo-key" ko apni real RapidAPI key se badalna hoga
    // Yeh key https://rapidapi.com/feli-c-p-a-facebook-video-downloader-api/api/facebook-video-downloader-api
    // se free mein mil jayegi.
    const MY_RAPIDAPI_KEY = "demo-key"; // <--- YAHAN APNI KEY DAALEIN

    if (MY_RAPIDAPI_KEY === "demo-key") {
       return res.json({ status: "error", message: "Please add your RapidAPI Key in api/downloader.js file." });
    }

    const api = `https://facebook-video-downloader-api.p.rapidapi.com/facebook?url=${encodeURIComponent(url)}`;
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": MY_RAPIDAPI_KEY,
        "X-RapidAPI-Host": "facebook-video-downloader-api.p.rapidapi.com",
      },
    };
    const r = await fetch(api, options);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

// ---------- AUTO DETECT ----------
app.post("/detect", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.json({ platform: "unknown" });

  if (url.includes("tiktok.com")) return res.json({ platform: "tiktok" });
  if (url.includes("youtube.com") || url.includes("youtu.be")) return res.json({ platform: "youtube" });
  if (url.includes("instagram.com")) return res.json({ platform: "instagram" });
  if (url.includes("facebook.com") || url.includes("fb.watch")) return res.json({ platform: "facebook" });
  return res.json({ platform: "unknown" });
});


// Vercel isko serverless function ki tarah run karega
export default app;
