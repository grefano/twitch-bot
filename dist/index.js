import * as dotenv from 'dotenv';
dotenv.config();
import { spotifyTokenAccess } from "./auth/spotify.js";
import { botNick, botOAuth, botChannel, idClient, idBroadcaster, idMod } from "./auth/twitch.js";
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
const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
const prefix = ";";
const getMsgCommand = (msg) => {
    return msg.trim().charAt(0) == prefix ? msg.slice(1) : false;
};
import commandSongRequest from './commands/sr.js';
const createCommands = (context) => {
    return {
        sr: () => commandSongRequest(context),
    };
};
socket.addEventListener('open', () => {
    socket.send(`CAP REQ :twitch.tv/tags twitch.tv/commands`);
    socket.send(`PASS oauth:${botOAuth}`);
    socket.send(`NICK ${botNick}`);
    socket.send(`JOIN #${botChannel}`);
});
socket.addEventListener('message', async (event) => {
    if (!event.data.includes('PRIVMSG')) {
        return false;
    }
    const idMatch = event.data.match(/id=([^;]+)/);
    const userMatch = event.data.match(/:(\w+)!/);
    const messageMatch = event.data.match(/PRIVMSG #\w+ :(.+)/);
    // console.log(`id ${idMatch} user ${userMatch} msg ${messageMatch}`)
    if (idMatch && userMatch && messageMatch) {
        const msgId = idMatch[1];
        const msgUsername = userMatch[1];
        const msg = messageMatch[1];
        let args = msg.split(' ');
        const msgArgs = args.splice(1);
        const msgCommand = args[0];
        // console.log(`username ${username} msg ${msg} args ${msgArgs} command ${msgCommand}`)
        const command = getMsgCommand(msgCommand);
        if (command == false)
            return;
        const context = { socket, msgId, msgUsername, msgArgs, botChannel, botOAuth, msgCommand, idClient, idBroadcaster, idMod, spotifyTokenAccess };
        const commands = createCommands(context);
        if (typeof commands[command] === 'function') {
            commands[command]();
        }
        else {
            socket.send(`PRIVMSG #${botChannel} :comando ${msgCommand} nao existe`);
        }
    }
});
//# sourceMappingURL=index.js.map