import { spotifyReq } from "../api/initspotify.js";
// import {} from "../api/controlspotify.js"
import { addTrackToQueue } from "../api/controlspotify.js";
import * as fs from 'fs'
import {readFile} from 'fs/promises'
interface Song{
  uri: string,
  name: string,
  artists: string[],
  genres: string[],
  features?: SongFeatures,
}
interface SongFeatures{
  acousticness?: number,
  danceability?: number
  energy?: number,
  instrumentalness?: number,
  liveness?: number,
  loudness?: number,
  speechiness?: number,
  valence?: number,
}
async function getSongFeatures(trackIds: string[]): Promise<SongFeatures[]>{
  let tracksidformat = trackIds.reduce((prev, cur) => {
    if (prev != cur){
      return prev + "," + cur

    } else {
      return prev
    }
  }, trackIds[0])

  // tracksidformat = trackIds[0]
  let res = (await fetch(`https://api.reccobeats.com/v1/audio-features?ids=${tracksidformat}`, {method: 'GET'}))
  let data: any[] = (await res.json())['content']
  let result = data.map((val) => {return {
    acousticness: val["acousticness"],
    danceability: val["danceability"],
    energy: val["energy"],
    instrumentalness: val["instrumentalness"],
    liveness: val["liveness"],
    loudness: val["loudness"],
    speechiness: val["speechiness"],
    valence: val["valence"],
  }})
  return result
}
async function main() {



  let reqlikedsongs = spotifyReq((api) => api.getMySavedTracks())
  let likedsongs = (await reqlikedsongs).body.items

  const file = await readFile("songs.json", 'utf-8')
  const jsonfile = JSON.parse(file)
  const storedsongs = new Map<string, Set<Song>>(Object.entries(jsonfile).map(([genre, songs]) => [genre, new Set(songs as Song[])]))

  console.log('json read', storedsongs)
  for(const a of storedsongs.get('mpb').values()){
    console.log('a', a.artists)
    console.log('b', a.genres)
    console.log('c', a.features)
    
  }


  // comparar liekdsongs com storedsongs

  
  return


  let res = await getSongFeatures(likedsongs.map((val) => val.track.id)) 
  // console.log(JSON.stringify(a, null, 2))

  let genreToSongs = new Map<string, Set<Song>>()

  for (let i = 0; i < likedsongs.length; i++){
    let s = likedsongs[i]
    console.log(s.track.name + ":")
    for (const a of s.track.artists){
      let artist = await spotifyReq((api) => api.getArtist(a.id))
      console.log("- " + artist.body.name + " " + JSON.stringify(artist.body.genres))
      
      for(const g of artist.body.genres){
        const set = genreToSongs.get(g) ?? new Set<Song>()
        set.add({uri: s.track.uri, name: s.track.name, artists: s.track.artists.map(val => val.name), genres: artist.body.genres, features: res[i]})
        genreToSongs.set(g, set)

      }
    }
  }
  console.log(genreToSongs)

  const jsonpath = "songs.json"
  fs.writeFileSync(jsonpath, JSON.stringify(Object.fromEntries( [...genreToSongs.entries()].map(([genre, songs]) => [genre, [...songs]])), null, 2))

  // add genre to queue
  let songs = genreToSongs.get("art rock")
  for (const j of songs){
    console.log(j.name)
    addTrackToQueue(j.uri)
  }


}

await main()