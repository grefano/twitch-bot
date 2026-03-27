import { spotify } from "../api/spotify.js";
import SpotifyWebApi from 'spotify-web-api-node'

async function main() {
  console.log(process.env.SPOTIFY_ID_CLIENT)
  // const spotify = new SpotifyWebApi({clientId: process.env.SPOTIFY_ID_CLIENT, clientSecret: process.env.SPOTIFY_SECRET_CLIENT})
  // spotify.setAccessToken(spotifyTokenAccess)

  const search_res = await spotify.searchArtists('luiz gonzaga')
  const search_data  = await search_res.body

  console.log("items ", JSON.stringify(search_data.artists.items[0].genres))
}

await main()