
import * as dotenv from 'dotenv'
dotenv.config()
import SpotifyWebApi from 'spotify-web-api-node'

const spotify = new SpotifyWebApi({clientId: process.env.SPOTIFY_ID_CLIENT, clientSecret: process.env.SPOTIFY_SECRET_CLIENT, accessToken: process.env.SPOTIFY_ACCESS_TOKEN, refreshToken: process.env.SPOTIFY_TOKEN_REFRESH, redirectUri: 'http://127.0.0.1:3000/callback'})

let readyResolve;
const readyPromise = new Promise((resolve) => {
    readyResolve = resolve;
});
spotify.refreshAccessToken((err, res)=>{
    if (err){
        console.log('refresh token err ', JSON.stringify(err, null, 2))
        return
    }
    console.log('new access token ',  res.body.access_token)
    spotify.setAccessToken(res.body.access_token)
    readyResolve()

})


async function spotifyReq(fn){
    await readyPromise
    return fn(spotify)
}



export { spotifyReq };

