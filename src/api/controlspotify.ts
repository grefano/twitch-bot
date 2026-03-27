import { spotify } from "../api/initspotify.js";


export const addTrackToQueue = async (trackid: string) => {
      // const response = await fetch("https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A"+trackid, {
      //     method: 'POST',
      //     headers: {
      //         'Authorization': `Bearer ${spotifyTokenAccess}`
      //     }
      // })

      const response = await spotify.addToQueue(trackid, {device_id: process.env.SPOTIFY_LAPTOP_ID})
      
      console.log(response)
      if (response.statusCode == 200 || response.statusCode == 204){
          return true
      }
      return `error ${response.statusCode} - ${response.body}`
  }