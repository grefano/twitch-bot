
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
import { IContextCommand } from "../util/types.js";
export default async function commandSongRequest (context: IContextCommand){
    const {socket, msgId, msgUsername, msgArgs, botChannel, botOAuth, msgCommand, spotifyTokenAccess, idClient, idBroadcaster, idMod} = context
    const argTrack = msgArgs.join(' ')

    if (msgArgs.length < 1){
        socket.send(`PRIVMSG #${botChannel} :${msgCommand} <link>`)
        return
    }

    const addTrackToQueue = async (trackid: string) => {
        const response = await fetch("https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A"+trackid, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${spotifyTokenAccess}`
            }
        })
        console.log(response)
        if (response.status == 200 || response.status == 204){
            return true
        }
        return `error ${response.status} - ${response.statusText}`
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
        case 'youtube-link':
            socket.send(`PRIVMSG #${botChannel} :apenas links do spotify são válidos`)
            break;
        case 'title':
            console.log('title')
            
            const search_res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(argTrack)}&type=track&limit=1`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${spotifyTokenAccess}` 
                }
            })
            const search_data = await search_res.json()
            trackid = search_data.tracks.items[0]?.id


            break;
        case 'link':
            socket.send(`PRIVMSG #${botChannel} :o link ${msgArgs[0]} não é do spotify`)
            break;
        default:
            socket.send(`PRIVMSG #${botChannel} :${msgArgs[0]} não é uma música válida`)
            break;
    }
    console.log('track id', trackid)
    if (trackid != ''){
        
        let result = await addTrackToQueue(trackid);
        if (result == true){
            socket.send(`PRIVMSG #${botChannel} :música de ${msgUsername} foi adicionada à lista`)
        } else {
            socket.send(`PRIVMSG #${botChannel} :${result}`)
        }

    }

    fetch(`https://api.twitch.tv/helix/moderation/chat?broadcaster_id=${idBroadcaster}&moderator_id=${idMod}&message_id=${msgId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${botOAuth}`,
            'Client-Id': `${idClient}`
        }
    })


}