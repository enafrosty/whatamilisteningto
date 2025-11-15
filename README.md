# What am i listening to

[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-red)](https://heyfrosty.space)

A sleek Spotify Now Playing web player that shows your currently playing song in real-time. The design mimics Spotify’s UI with a blurry album background, glassy player, progress bar, and playlist integration.

Demo: https://music.heyfrosty.space

---

Features:

- Real-time song updates — updates every 2 seconds.
- Blurry album background with black overlay.
- Glassy player layout: album on left, song info on right.
- Progress bar and time display that updates in sync with Spotify.
- Playlist support: clickable link if the song is from a public playlist.
- Last song persistence: shows the last played song even after refreshing the page.
- Responsive design: works on desktop and mobile.
- Subtle hover animations: album scales, song title glows, footer link transitions.
- Footer with links to your website and GitHub repository.

---

Screenshots:

- (Add screenshots here)

---

Installation:

1. Clone the repository:

   git clone https://github.com/enafrosty/whatamilisteningto.git
   cd whatamilisteningto

2. Install dependencies:

   npm install

3. Create a `.env` file in the root folder:

   CLIENT_ID=your_spotify_client_id
   CLIENT_SECRET=your_spotify_client_secret
   REFRESH_TOKEN=your_spotify_refresh_token

> Make sure your Spotify app has the `user-read-currently-playing` and `user-read-playback-state` scopes.

4. Run the server:

   node server.js

5. Open your browser:

   http://localhost:3000

---

Folder Structure:

spotify-nowplaying/
├─ public/
│  └─ index.html
├─ server.js
├─ lastSong.json      # Stores last played song
├─ package.json
├─ .env
├─ README.md

---

Customization:

- Change the header text by modifying the `headerText` element in `index.html`.
- Update colors, fonts, and hover animations using Tailwind CSS classes.
- Footer links are editable in the `<footer>` section of `index.html`.

---

How It Works:

1. The server fetches your currently playing song using the Spotify Web API.
2. It stores the last played song in `lastSong.json` to persist after page refresh.
3. The frontend updates every 2 seconds to show the current song, artist, album cover, and progress.
4. If a song is from a public playlist, the playlist name is clickable and opens Spotify.
5. When not playing, it shows the last song with the blurred album background, but hides the progress bar.

---

License:

MIT License © 2025 iyad (https://heyfrosty.space)

---

Links:

- Website: https://heyfrosty.space
- GitHub Repository: https://github.com/enafrosty/whatamilisteningto
