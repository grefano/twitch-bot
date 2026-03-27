import { spotifyReq } from "../api/initspotify.js";
// import {} from "../api/controlspotify.js"
import { addTrackToQueue } from "../api/controlspotify.js";
interface Song{
  uri: string,
  name: string,
  artists: string[],
  genres: string[]
}


async function main() {

  // const search_res = (await spotify.searchArtists('luiz gonzaga')).body

  // console.log("items ", JSON.stringify(search_res.artists.items[0].genres))
  // let authurl: string = spotify.createAuthorizeURL(["user-library-read"], 'oaijca9f')
  // console.log(authurl)

  
  
  // let accesstoken = process.env.SPOTIFY_ACCESS_TOKEN
  // console.log(accesstoken)
  // spotify.setAccessToken(accesstoken)


  let reqlikedsongs = spotifyReq((api) => api.getMySavedTracks())
  let likedsongs = (await reqlikedsongs).body.items
  // likedsongs[0].track.
  let names = likedsongs.map((value) => {
    let track = value.track;
    return track.name + " " + track.artists.map((a, i) => {return i + ". " + a.name}) + " " + track.duration_ms/1000
  })
  console.log(names)
  
  let genreToSongs = new Map<string, Set<Song>>()

  for (const s of likedsongs){
    console.log(s.track.name + ":")
    for (const a of s.track.artists){
      let artist = await spotifyReq((api) => api.getArtist(a.id))
      console.log("- " + artist.body.name + " " + JSON.stringify(artist.body.genres))
      
      for(const g of artist.body.genres){
        const set = genreToSongs.get(g) ?? new Set<Song>()
        set.add({uri: s.track.uri, name: s.track.name, artists: s.track.artists.map(val => val.name), genres: artist.body.genres})
        genreToSongs.set(g, set)

      }
    }
  }
  console.log(genreToSongs)


  // add genre to queue
  let songs = genreToSongs.get("art rock")
  for (const j of songs){
    console.log(j.name)
    addTrackToQueue(j.uri)
  }
}

await main()