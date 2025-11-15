import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const cacheFile = path.join(__dirname, "lastSong.json");

function readCache() {
  if (fs.existsSync(cacheFile)) {
    try {
      return JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
    } catch {
      return null;
    }
  }
  return null;
}

function writeCache(data) {
  fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
}

async function getAccessToken() {
  const token = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.REFRESH_TOKEN,
    }),
    {
      auth: {
        username: process.env.CLIENT_ID,
        password: process.env.CLIENT_SECRET,
      },
    }
  );
  return token.data.access_token;
}

app.get("/nowplaying", async (req, res) => {
  let lastSongData = readCache();

  try {
    const accessToken = await getAccessToken();
    const now = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!now.data || !now.data.item) {
      return res.json(lastSongData ? { ...lastSongData, playing: false } : { playing: false });
    }

    const isPlaying = now.data.is_playing;
    const item = now.data.item;

    let playlistName = null;
    let playlistUrl = null;

    if (now.data.context && now.data.context.type === "playlist") {
      playlistUrl = now.data.context.external_urls.spotify;
      playlistName = now.data.context.href
        ? await getPlaylistName(playlistUrl, accessToken)
        : "Playlist";
    }

    const currentSong = {
      song: item.name,
      artist: item.artists.map(a => a.name).join(", "),
      albumArt: item.album.images[0].url,
      duration_ms: item.duration_ms,
      progress_ms: now.data.progress_ms,
      playlist: playlistName,
      playlistUrl: playlistUrl,
    };

    writeCache(currentSong);

    res.json({ ...currentSong, playing: isPlaying });

  } catch (e) {
    console.error(e.message);
    res.json(lastSongData ? { ...lastSongData, playing: false } : { playing: false });
  }
});

async function getPlaylistName(playlistUrl, token) {
  try {
    const id = playlistUrl.split("/playlist/")[1].split("?")[0];
    const playlist = await axios.get(`https://api.spotify.com/v1/playlists/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return playlist.data.name;
  } catch {
    return "Playlist";
  }
}

app.listen(3000, () => console.log("Listening on http://localhost:3000"));
