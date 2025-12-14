import express from "express";
import cors from "cors";
import { pool } from "./db";
import { storage } from "./storage";
import { extractAudio, hasCookies, saveCookies, deleteCookies } from "./youtube";
import path from "path";
import fs from "fs";

const app = express();

const DEFAULT_USER_ID = 1;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

const audioDir = path.join(process.cwd(), "uploads", "audio");
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

app.use("/audio", express.static(audioDir));

app.get("/api/songs", async (req, res) => {
  try {
    const songs = await storage.getSongsByUserId(DEFAULT_USER_ID);
    const songsWithUrls = songs.map(song => ({
      ...song,
      audioUrl: song.audioPath ? `/audio/${path.basename(song.audioPath)}` : null,
    }));
    res.json(songsWithUrls);
  } catch (error) {
    console.error("Get songs error:", error);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

app.post("/api/songs", async (req, res) => {
  try {
    const { title, artist, album, coverUrl, duration, genre, sourceType } = req.body;
    
    const song = await storage.createSong({
      id: crypto.randomUUID(),
      userId: DEFAULT_USER_ID,
      title,
      artist,
      album,
      coverUrl,
      duration,
      genre,
      sourceType,
    });

    res.json(song);
  } catch (error) {
    console.error("Create song error:", error);
    res.status(500).json({ error: "Failed to save song" });
  }
});

app.post("/api/songs/:id/favorite", async (req, res) => {
  try {
    const { isFavorite } = req.body;
    const song = await storage.updateSong(req.params.id, { isFavorite });
    res.json(song);
  } catch (error) {
    console.error("Update favorite error:", error);
    res.status(500).json({ error: "Failed to update" });
  }
});

app.delete("/api/songs/:id", async (req, res) => {
  try {
    const song = await storage.getSongById(req.params.id);
    if (song?.audioPath && fs.existsSync(song.audioPath)) {
      fs.unlinkSync(song.audioPath);
    }
    await storage.deleteSong(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete song error:", error);
    res.status(500).json({ error: "Failed to delete" });
  }
});

app.post("/api/youtube/extract", async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const result = await extractAudio(url, DEFAULT_USER_ID);
    
    const song = await storage.createSong({
      id: crypto.randomUUID(),
      userId: DEFAULT_USER_ID,
      title: result.title,
      artist: result.artist,
      coverUrl: result.thumbnail,
      audioPath: result.audioPath,
      duration: result.duration,
      sourceType: "youtube",
      sourceUrl: url,
    });

    res.json({
      ...song,
      audioUrl: `/audio/${path.basename(result.audioPath)}`,
    });
  } catch (error: any) {
    console.error("YouTube extraction error:", error);
    res.status(500).json({ error: error.message || "Failed to extract audio" });
  }
});

app.get("/api/youtube/cookies", (req, res) => {
  res.json({ hasCookies: hasCookies() });
});

app.post("/api/youtube/cookies", (req, res) => {
  try {
    const { cookies } = req.body;
    
    if (!cookies || typeof cookies !== "string") {
      return res.status(400).json({ error: "Cookies content is required" });
    }

    if (!cookies.includes("youtube.com") && !cookies.includes(".youtube.com")) {
      return res.status(400).json({ error: "Invalid cookies file. Must contain YouTube cookies." });
    }

    saveCookies(cookies);
    res.json({ success: true, message: "Cookies saved successfully" });
  } catch (error: any) {
    console.error("Save cookies error:", error);
    res.status(500).json({ error: "Failed to save cookies" });
  }
});

app.delete("/api/youtube/cookies", (req, res) => {
  try {
    deleteCookies();
    res.json({ success: true, message: "Cookies deleted" });
  } catch (error: any) {
    console.error("Delete cookies error:", error);
    res.status(500).json({ error: "Failed to delete cookies" });
  }
});

const PORT = 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
