import { spotify } from "./initspotify.js";


async function main(){
  const authurl = spotify.createAuthorizeURL(['user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing',
    'user-library-read', 'user-library-modify',
    'playlist-read-private', 'playlist-modify-private', 'playlist-modify-public', 'playlist-read-collaborative'], "awdjaow")

    
  console.log(authurl)
  // let code = "AQCeLmaJchSDjcmSZkX4wHbeEMn38x_rZHml0Vx5WyDn4JFv0eIqSU5G5XGa_v3KK_-QHQhIB3H022f53yg2ENA0zDKC1gw84hgabhn2E7yfjsR9nW1lwFWlTlNWay6n8rszcH-IRRB_Xd6iMT5zIKk109EuLpfE1LDfu3ubSeZCn5zudPlIVChbB1Ai0PaPJjtT4OUSI1Vj0H-1_NVNSPEhLTycxQitT8tY0hMx4wTdIyv77mAG8BVX_zDCKaJOcTEZrGhMFPPB8FUOexpuiFNu2OOwCmLWmZKBpDbJKEpaTkaEj0PYFcxGZcsZ9eokeBWFM85sU7K4XfGK9OxCdG603OAJDrTaKUS9ZJY2kuVoEVrRsmtx6Tmp5bDQ1aYelQZnCGiKEwbar27Ik-fiMxoamLhotAhT2CU"
  let code = "AQBSwYl5zgPrJIeVgiXJ2XHWaLmnjQiVKrOJh5Dafy4Gd21R96X69eeYIFD4Js2LRJLyFZhKCK3o5Zk_Ikvdw9rMN5eaTv7Q7sM01LMQ4N3Ie95y6asDm7yowMZL8ZIrGssugPztobsNN_pLAjEHy1uxXxewvurxpWOOv5x5ybUinDA_RtS7jFS8swGn4AmP4PucvTkqxlk-UZvYhMG2R-v_Mr22gAvQn_guLLpRDuem8Qgl1cHgaFp-hLT-wOIg4pQIlZRbnqxA0rvxG6cqU2eGiCZ3HIKAbBw5XE3f1uubZI2BI2nAEZA9RNz2zVwf8O38kLG4cUpD-5pcx5IglkRUAfKslyERhTy6gXeJl3CbQ30mQIpu_F-Dh_6SDmYUFrkpPJ7jNeFzv99uLjso9BaWjhrmUABRATNa38Ag9obDtjW-m2OdcmfmSxZaEDzGk6CEFHftXrLx_RorAJPioG_V"
  let authres = await spotify.authorizationCodeGrant(code)
  console.log(authres.body)
}

main()