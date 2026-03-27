
import * as dotenv from 'dotenv'
dotenv.config()
import SpotifyWebApi from 'spotify-web-api-node'

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

const spotifyTokenAccess = tokenData.access_token;

const spotify = new SpotifyWebApi({clientId: process.env.SPOTIFY_ID_CLIENT, clientSecret: process.env.SPOTIFY_SECRET_CLIENT, redirectUri: 'http://127.0.0.1:3000/callback'})
spotify.setAccessToken(spotifyTokenAccess)

export { spotify };

