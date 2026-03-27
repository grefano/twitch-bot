import { spotifyReq } from "../api/initspotify.js";
// import {} from "../api/controlspotify.js"
import { addTrackToQueue } from "../api/controlspotify.js";
import * as fs from 'fs'
import {readFile} from 'fs/promises'
import { threadName } from "worker_threads";
interface Song{
  uri: string,
  id: string,
  name: string,
  artists: Artist[],
  genres?: string[],
  features?: SongFeatures,
}
interface Artist{
  name: string,
  uri: string,
  id: string,
  genres?: string[]
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
function apiResponseToSongArray(songs: SpotifyApi.SavedTrackObject[]): Song[]{
  return songs.map((val) => {
    
    let track = val.track
    return {uri: track.uri, id: track.id, name: track.name, artists: track.artists.map((val) => ({id: val.id, name: val.name, uri: val.uri}))}
  })
}

async function songsEnrichFeatures(songs: Song[]){
  console.log("songs to enrich", JSON.stringify(songs.map((val) => val.name)))
  let songsfeatures = await getSongFeatures(songs.map((val) => val.id))
  console.log("songs features", JSON.stringify(songsfeatures.map((val) => val.acousticness)))
  for(let i = 0; i < songs.length; i++){
    songs[i].features = songsfeatures[i]
  }
}
async function createGenreMap(songs: Song[]): Promise<Map<string, Set<Song>>>{

  let genreToSongs = new Map<string, Set<Song>>()

  for (let i = 0; i < songs.length; i++){
    let s = songs[i]
    console.log(s.name + ":")
    for (const a of s.artists){
      let artist = await spotifyReq((api) => api.getArtist(a.id))
      
      for(const g of artist.body.genres){
        const set = genreToSongs.get(g) ?? new Set<Song>()
        set.add({uri: s.uri, id: s.id, name: s.name, artists: s.artists, genres: artist.body.genres, features: s.features})
        genreToSongs.set(g, set)

      }
    }
  }

  return new Promise<Map<string, Set<Song>>>(resolve => resolve(genreToSongs))
}
async function getSongFeatures(trackIds: string[]): Promise<SongFeatures[]>{
  let tracksidformat = trackIds.reduce((prev, cur) => {
    if (prev != cur){
      return prev + "," + cur

    } else {
      return prev
    }
  }, trackIds[0])
  let res = (await fetch(`https://api.reccobeats.com/v1/audio-features?ids=${tracksidformat}`, {method: 'GET'}))
  let data: any[] = (await res.json())['content']


  // a reponse pode vir com menos resultados que esperado, 
  // é preciso verificar se cada musica obteve uma resposta
  let result = []
  trackIds.forEach((val) => {
    let index = data.findIndex((a) => {
      let inferredID = (a['href'] as string).split('/').at(-1)
      return inferredID == val
    })
    if (index >= 0){
      result.push({
        acousticness: data[index]["acousticness"],
        danceability: data[index]["danceability"],
        energy: data[index]["energy"],
        instrumentalness: data[index]["instrumentalness"],
        liveness: data[index]["liveness"],
        loudness: data[index]["loudness"],
        speechiness: data[index]["speechiness"],
        valence: data[index]["valence"],
      })
    } else {
      result.push({})
    }
  })

  return result
}
async function main() {
  const jsonpath = "songs.json"



  let reqlikedsongs = spotifyReq((api) => api.getMySavedTracks())
  let likedsongs = apiResponseToSongArray((await reqlikedsongs).body.items)

  const file = await readFile(jsonpath, 'utf-8')
  const jsonfile = JSON.parse(file)
  const storedsongs = new Map<string, Set<Song>>(Object.entries(jsonfile).map(([genre, songs]) => [genre, new Set(songs as Song[])]))


  console.log('liked songs', likedsongs.map((val) => val.name))


  let storeduniquesongs = new Set<Song>()
  for(const genresongs of storedsongs.values()){
    for(const song of genresongs.values()){
      storeduniquesongs.add(song)
    }
  }

  let _storedsongs = ""
  for(const s of storeduniquesongs){
    _storedsongs += s.name
  }
  console.log('stored songs', _storedsongs)


  let newsongs = likedsongs;
  for(const s of storeduniquesongs.values()){
    newsongs = newsongs.filter(song => song.uri != s.uri)
  }
  console.log('new songs', newsongs.map((val) => val.name))
  
  songsEnrichFeatures(newsongs)

  let genreToSongs = await createGenreMap([...storeduniquesongs, ...newsongs])

  fs.writeFileSync(jsonpath, JSON.stringify(Object.fromEntries( [...genreToSongs.entries()].map(([genre, songs]) => [genre, [...songs]])), null, 2))

  // add genre to queue
  let songs = genreToSongs.get("art rock")
  for (const j of songs){
    addTrackToQueue(j.uri)
  }


}

await main()