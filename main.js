const { BedrockPortal, Joinability } = require('bedrock-portal');
const bedrockPortal = require('bedrock-portal')
const { Authflow, Titles } = require('prismarine-auth');
const config = require('./config.json');
const bedrockProtocol = require('bedrock-protocol')
const main = async () => {
    const auth = new Authflow('example', './profile', { authTitle: Titles.MinecraftNintendoSwitch, deviceType: 'Nintendo', flow: 'live' });

    const portal = new BedrockPortal(auth, {
        // The server IP & port to redirect players to
        ip: config.ip,
        port: config.port,
        world: {
            "hostName": config.friendConnect.hostName,
            "name": config.friendConnect.name,
            "version": config.friendConnect.version,
            "memberCount": config.friendConnect.memberCount,
            "maxMemberCount": config.friendConnect.maxMemberCount,
        },
        // The joinability of the session. Joinability.FriendsOfFriends, Joinability.FriendsOnly, Joinability.InviteOnly
        joinability: config.friendConnect.inviteOnly ? Joinability.InviteOnly : Joinability.FriendsOnly
    });
    if (config.automaticRefriend) portal.use(bedrockPortal.Modules.AutoFriendAccept)
    await portal.start();
    let client = bedrockProtocol.createClient({
        "realms": {
            "realmInvite": config.realmCode
        },
        "skipPing": true,
        "profilesFolder": "./profile",
        "version": "1.21.30"
    })
    client.on("player_list", (record) => {
        if (record.records.type == 'add') {
            for (const record2 of record.records.records) {
                if (record2.username != config.botUsername) {
                    client.queue('command_request', {
                        command: `/kick "${record2.username}" ${config.kickMessage}`,
                        origin: {
                            type: 'player',
                            uuid: '',
                            request_id: '',
                        },
                        internal: false,
                        version: 52,
                    })
                    portal.invitePlayer(record2.username) // use record2.xbox_user_id if things go wrong
                }
            }
        }
    })

};

main();