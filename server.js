// server.js
import express from "express";
import axios from "axios";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// --- Env Variables ---
if (process.env.NODE_ENV !== "production") {
  import('dotenv').then(dotenv => dotenv.config());
}

const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = process.env;
if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error("Missing Spotify environment variables!");
  process.exit(1);
}

// --- Last Song Storage ---
const LAST_SONG_FILE = path.join(__dirname, "lastSong.json");

function saveLastSong(songData) {
  fs.writeFileSync(LAST_SONG_FILE, JSON.stringify(songData, null, 2));
}

function getLastSong() {
  if (!fs.existsSync(LAST_SONG_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(LAST_SONG_FILE, "utf-8"));
  } catch {
    return null;
  }
}

// --- Spotify Token ---
async function getAccessToken() {
  const token = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }),
    { auth: { username: CLIENT_ID, password: CLIENT_SECRET } }
  );
  return token.data.access_token;
}

// --- API Route ---
app.get("/nowplaying", async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    const now = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    let response;

    if (!now.data || !now.data.item) {
      const lastSong = getLastSong();
      if (!lastSong) {
        response = { playing: false, progress_ms: 0, duration_ms: 0 };
      } else {
        response = { ...lastSong, playing: false, progress_ms: 0, duration_ms: lastSong.duration_ms || 0 };
      }
    } else {
      const item = now.data.item;
      const songData = {
        playing: now.data.is_playing,
        song: item.name,
        artist: item.artists.map(a => a.name).join(", "),
        albumArt: item.album.images[0]?.url || "",
        duration_ms: item.duration_ms,           // matches frontend
        progress_ms: now.data.progress_ms,       // matches frontend
        playlist: now.data.context?.type === "playlist" ? now.data.context?.uri.split(":").pop() : null, // matches frontend
        playlistUrl: now.data.context?.type === "playlist" ? now.data.context?.external_urls.spotify : null,
      };

      response = songData;
      saveLastSong(songData);
    }

    res.json(response);
  } catch (err) {
    console.error("Spotify API error:", err.message);
    const lastSong = getLastSong();
    if (lastSong) {
      res.json({ ...lastSong, playing: false, progress_ms: 0, duration_ms: lastSong.duration_ms || 0 });
    } else {
      res.json({ playing: false, progress_ms: 0, duration_ms: 0 });
    }
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
