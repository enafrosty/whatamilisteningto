const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = 8888;

const REDIRECT_URI = "http://127.0.0.1:8888/callback";

app.get("/login", (req, res) => {
  const scope =
    "user-read-currently-playing user-read-playback-state";

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
  });

  res.redirect("https://accounts.spotify.com/authorize?" + params.toString());
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return res.send(
      "Your refresh token is:<br><br>" +
        tokenResponse.data.refresh_token
    );
  } catch (error) {
    console.error(error.response?.data || error);
    return res.send("Error getting refresh token.");
  }
});

app.listen(port, () => {
  console.log("Go to:");
  console.log("http://127.0.0.1:8888/login");
});
