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
  let songsfeatures = await getSongFeatures(songs.map((val) => val.id))
  for(let i = 0; i < songs.length; i++){
    songs[i].features = songsfeatures[i]
  }
}
type GenreMap = Map<string, Map<string, Song>>

async function createGenreMap(songs: Song[]): Promise<GenreMap>{

  let genreToSongs: GenreMap = new Map()

  for (let i = 0; i < songs.length; i++){
    let s = songs[i]
    console.log(s.name + ":")
    for (const a of s.artists){
      let artist = await spotifyReq((api) => api.getArtist(a.id))
      
      for(const g of artist.body.genres){
        let song = {uri: s.uri, id: s.id, name: s.name, artists: s.artists, genres: artist.body.genres, features: s.features}
        const songmap = genreToSongs.get(g) ?? new Map<string, Song>()
        if (!songmap.has(s.id)){
          songmap.set(s.id, song);
        }
        genreToSongs.set(g, songmap)
      }
    }
  }

  return new Promise<GenreMap>(resolve => resolve(genreToSongs))
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

  function genreMapPrint(genremap: GenreMap){
    for(const [genre, songmap] of genremap.entries()){
      console.log("genre: ", genre)
      // console.log("songmap", songmap, "instance of map", songmap instanceof Map, "size", songmap.size)
      for(const [id, song] of songmap.entries()){
        console.log("- ", song.name, id, song.features ? JSON.stringify(Object.keys(song.features)) : "")
      }
    }

  }
async function main() {
  const jsonpath = "songs.json"



  let reqlikedsongs = spotifyReq((api) => api.getMySavedTracks())
  let likedsongs = apiResponseToSongArray((await reqlikedsongs).body.items)

  const file = await readFile(jsonpath, 'utf-8')
  const jsonfile = JSON.parse(file)
  const storedsongs: GenreMap = new Map(Object.entries(jsonfile).map(
    ([genre, songmap]) => [genre, (new Map(Object.entries(songmap as Record<string, Song>)))]
  ))
  // console.log("stored songs")
  // genreMapPrint(storedsongs)


  console.log('liked songs', likedsongs.map((val) => val.name))

  console.log('stored set')
  let storeduniquesongs = new Set<Song>()
  for(const genresongs of storedsongs.values()){
    for(const song of genresongs.values()){
        storeduniquesongs.add(song)
    }
  }



  let newsongs = likedsongs;
  for(const s of storeduniquesongs){
    newsongs = newsongs.filter(song => {
      return song.uri != s.uri
    })
  }
  console.log('new songs', newsongs.map((val) => val.name))
  
  songsEnrichFeatures(newsongs)
  
  let genreToSongs = await createGenreMap([...storeduniquesongs, ...newsongs])
  genreMapPrint(genreToSongs)


  // fs.writeFileSync(jsonpath, JSON.stringify(Object.fromEntries( [...genreToSongs.entries()].map(([genre, songs]) => [genre, [...songs]])), null, 2))
  fs.writeFileSync(jsonpath, JSON.stringify(Object.fromEntries( [...genreToSongs.entries()].map(([genre, songmap]) => [genre, Object.fromEntries(songmap) ])), null, 2))
  // "genre": [] 
  // add genre to queue
  let songs = genreToSongs.get("art rock")
  for (const [id, song] of songs){
    addTrackToQueue(song.uri)
  }


}

await main()