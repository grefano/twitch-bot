export interface IContextCommand{
    socket: WebSocket,
    msgId: string,
    msgUsername: string,
    msgArgs: string[],
    botChannel: string,
    botOAuth: string,
    msgCommand: string,
    spotifyTokenAccess: string,
    idClient: string,
    idBroadcaster: string,
    idMod: string
}