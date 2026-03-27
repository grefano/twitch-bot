import * as dotenv from 'dotenv'
dotenv.config()

const botOAuth = process.env.TOKEN_ACCESS
const idClient = process.env.ID_CLIENT
const botNick = "grefanosufixo";
const botChannel = "grefanosufixo";

console.log(botOAuth)

async function getUserId(username: string){
    const response = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
        headers: {
            'Authorization': `Bearer ${botOAuth}`,
            'Client-Id': idClient
        }
    });
    
    console.log('auth twitch response', response)
    const data = await response.json()
    console.log('auth twitch data', data)
    return data.data[0].id
}

const idBroadcaster = await getUserId(botChannel)
const idMod = await getUserId(botNick)


export {botOAuth, botNick, botChannel, idClient, idBroadcaster, idMod}