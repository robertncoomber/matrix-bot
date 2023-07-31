import {
    MatrixClient,
    SimpleFsStorageProvider,
    AutojoinRoomsMixin
} from "matrix-bot-sdk";

const homeserverUrl = "https://matrix-client.matrix.org"; // make sure to update this with your url
const accessToken = "syt_cmhiMQ_ktCeqppZmFCprXOFmOdY_1f8pwW";
const storage = new SimpleFsStorageProvider("bot.json");

const client = new MatrixClient(homeserverUrl, accessToken, storage);
AutojoinRoomsMixin.setupOnClient(client);

client.start().then(() => console.log("Client started!"));
let roomId = "!yidXwcPJbkXvAixVIL:matrix.org";

client.sendMessage(roomId, {
    "msgtype": "m.text",
    "body": "LFG",
});


client.on("room.message", (roomId, event) => {
    if (!event["content"]) return;
    const sender = event["sender"];
    const body = event["content"]["body"];
    console.log(`${roomId}: ${sender} says '${body}`);

    if (body.startsWith("!echo")) {
        const replyText = body.substring("!echo".length).trim();
        client.sendMessage(roomId, {
            "msgtype": "m.text",
            "body": replyText,
        });
    }
});