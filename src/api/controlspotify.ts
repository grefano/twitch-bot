import { spotifyReq } from "../api/initspotify.js";


export const addTrackToQueue = async (trackid: string) => {
      const response = await spotifyReq((api) => api.addToQueue(trackid, {device_id: process.env.SPOTIFY_LAPTOP_ID}))
      
      console.log(response)
      if (response.statusCode == 200 || response.statusCode == 204){
          return true
      }
      return `error ${response.statusCode} - ${response.body}`
  }