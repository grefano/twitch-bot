import * as dotenv from 'dotenv'
dotenv.config()

import {spotify_token_access} from "./auth/spotify.js";
import { botNick, botOAuth, botChannel, idClient, idBroadcaster, idMod} from "./auth/twitch.js"









// (async () => {
//     fetch("https://api.spotify.com/v1/me/player", {
//         headers: {
//             'Authorization': `Bearer ${spotify_token_access}`
//         }
//     }).then(response => {
//         console.log('spotify response', response)
//         if (response.body) {
//             return response.json()
//         }
//     }).then(data => {
//         console.log(data)
//     })
// })();

const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443")

const prefix = ";"




const getMsgCommand = (msg: string) => {
    return msg.trim().charAt(0) == prefix ? msg.slice(1) : false
}


socket.addEventListener('open', () => {
    socket.send(`CAP REQ :twitch.tv/tags twitch.tv/commands`)
    socket.send(`PASS oauth:${botOAuth}`)
    socket.send(`NICK ${botNick}`)
    socket.send(`JOIN #${botChannel}`)
})
socket.addEventListener('message', async event => {
    if (!event.data.includes('PRIVMSG')){
        return false
    }
    

    const idMatch = event.data.match(/id=([^;]+)/)
    const userMatch = event.data.match(/:(\w+)!/)
    const messageMatch = event.data.match(/PRIVMSG #\w+ :(.+)/)

    // console.log(`id ${idMatch} user ${userMatch} msg ${messageMatch}`)

    if (idMatch && userMatch && messageMatch){
        const msgid = idMatch[1]
        const username = userMatch[1]
        const msg = messageMatch[1]
        let args = (msg as string).split(' ')
        const msgArgs = args.splice(1)
        const msgCommand = args[0]
        const argTrack = msgArgs.join(' ')
        // console.log(`username ${username} msg ${msg} args ${msgArgs} command ${msgCommand}`)
        switch(getMsgCommand(msgCommand)){
            case false:
                break;

            case 'sr':
                if (msgArgs.length < 1){
                    socket.send(`PRIVMSG #${botChannel} :${msgCommand} <link>`)
                    return
                }
                
                const addTrackToQueue = async (trackid: string) => {
                    let msg = ''
                    const response = await fetch("https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A"+trackid, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${spotify_token_access}`
                        }
                    })
                    console.log(response)
                    if (response.status == 200 || response.status == 204){
                        return `sua musica foi adicionada à lista`
                    }
                    msg = `${response.status} - ${response.statusText}`
                    return msg
                }

                let argtype = identifyArgTypeForTrack(msgArgs[0])
                let trackid = ''
                switch(argtype){
                    case 'spotify-trackid':
                        trackid = msgArgs[0]
                        break;
                    case 'spotify-link':
                        let linksplitted = msgArgs[0].split('/')
                        console.log('link splitted', linksplitted)
                        trackid = linksplitted[linksplitted.length-1].split('?')[0]
                        console.log('track id', trackid)
                        break;
                    case 'title':
                        console.log('title')
                        
                        const search_res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(argTrack)}&type=track&limit=1`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${spotify_token_access}` 
                            }
                        })
                        const search_data = await search_res.json()
                        trackid = search_data.tracks.items[0]?.id


                        break;
                    case 'link':
                        socket.send(`PRIVMSG #${botChannel} :o link ${msgArgs[0]} não é do youtube nem do spotify`)
                        break;
                    default:
                        socket.send(`PRIVMSG #${botChannel} :${msgArgs[0]} não é uma música válida`)
                        break;
                }
                console.log('track id', trackid)
                console.log('msg', msg)
                if (trackid != ''){
                    
                    let msg = await addTrackToQueue(trackid);
                    socket.send(`PRIVMSG #${botChannel} :${msg}`)

                }
                
                fetch(`https://api.twitch.tv/helix/moderation/chat?broadcaster_id=${idBroadcaster}&moderator_id=${idMod}&message_id=${msgid}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${botOAuth}`,
                        'Client-Id': `${idClient}`
                    }
                })
                break;
            
            default:
                socket.send(`PRIVMSG #${botChannel} :comando ${msgCommand} nao existe`)
                break;
                
        }
    }
});

const isValidUrl = (str: string) => {
    try {
        new URL(str);
        return true;
    } catch (err) {
        return false;
    }
}
const isTrackId = (str: string) => {
    return (str.length == 22 && str.split(' ')[0] == str)
}
const identifyArgTypeForTrack = (arg: string) => {
    // spotify link, spotify track id, track title
    if (isValidUrl(arg)){
        if (arg.includes('spotify')){
            return 'spotify-link'
        } else if (arg.includes('youtube')){
            return 'youtube-link'
        } else {
            return 'link'
        }
    }
    if (isTrackId(arg)) return 'spotify-trackid';
    return 'title'
}