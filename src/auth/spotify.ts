
import * as dotenv from 'dotenv'
dotenv.config()

// const authUrl = `https://accounts.spotify.com/authorize?` +
//     `client_id=${process.env.SPOTIFY_ID_CLIENT}&` +
//     `response_type=code&` +
//     `redirect_uri=${encodeURIComponent("http://127.0.0.1:3000/callback")}&` +
//     `scope=${encodeURIComponent("user-read-playback-state user-modify-playback-state")}`

// console.log("Abra este link:", authUrl);


const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: process.env.SPOTIFY_TOKEN_REFRESH,
        client_id: process.env.SPOTIFY_ID_CLIENT,
        client_secret: process.env.SPOTIFY_SECRET_CLIENT
    })
})

const tokenData = await tokenResponse.json()

const spotify_token_access = tokenData.access_token;

export { spotify_token_access };

