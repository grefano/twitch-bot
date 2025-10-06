import * as dotenv from 'dotenv';
dotenv.config();
import { spotify_token_access } from "./auth/spotify.js";
import { botNick, botOAuth, botChannel, idClient, idBroadcaster, idMod } from "./auth/twitch.js";
(async () => {
    fetch("https://api.spotify.com/v1/me/player", {
        headers: {
            'Authorization': `Bearer ${spotify_token_access}`
        }
    }).then(response => {
        console.log('spotify response', response);
        if (response.body) {
            return response.json();
        }
    }).then(data => {
        console.log(data);
    });
})();
const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
const prefix = ";";
const getMsgCommand = (msg) => {
    return msg.trim().charAt(0) == prefix ? msg.slice(1) : false;
};
socket.addEventListener('open', () => {
    socket.send(`CAP REQ :twitch.tv/tags twitch.tv/commands`);
    socket.send(`PASS oauth:${botOAuth}`);
    socket.send(`NICK ${botNick}`);
    socket.send(`JOIN #${botChannel}`);
});
socket.addEventListener('message', event => {
    if (!event.data.includes('PRIVMSG')) {
        return false;
    }
    const idMatch = event.data.match(/id=([^;]+)/);
    const userMatch = event.data.match(/:(\w+)!/);
    const messageMatch = event.data.match(/PRIVMSG #\w+ :(.+)/);
    console.log(`id ${idMatch} user ${userMatch} msg ${messageMatch}`);
    if (idMatch && userMatch && messageMatch) {
        const msgid = idMatch[1];
        const username = userMatch[1];
        const msg = messageMatch[1];
        let args = msg.split(' ');
        const msgArgs = args.splice(1);
        const msgCommand = args[0];
        console.log(`username ${username} msg ${msg} args ${msgArgs} command ${msgCommand}`);
        switch (getMsgCommand(msgCommand)) {
            case false:
                break;
            case 'sr':
                if (msgArgs.length < 1) {
                    socket.send(`PRIVMSG #${botChannel} :${prefix}${msgCommand} <link>`);
                    return;
                }
                socket.send(`PRIVMSG #${botChannel} bosta`);
                fetch(`https://api.twitch.tv/helix/moderation/chat?broadcaster_id=${idBroadcaster}&moderator_id=${idMod}&message_id=${msgid}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${botOAuth}`,
                        'Client-Id': `${idClient}`
                    }
                });
                fetch('https://api.spotify.com/v1/search?q=remaster%2520track%3ADoxy%2520artist%3AMiles%2520Davis&type=album', {
                    headers: {
                        'Authorization': `Bearer ${spotify_token_access}`
                    }
                }).then(response => response.json()).then(data => {
                    console.log('spotify data', data);
                });
                break;
            default:
                socket.send(`PRIVMSG #${botChannel} :comando ${msgCommand} nao existe`);
                break;
        }
    }
});
//# sourceMappingURL=index.js.map