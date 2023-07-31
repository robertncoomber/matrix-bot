import {
    MatrixClient,
    SimpleFsStorageProvider,
    AutojoinRoomsMixin
} from "matrix-bot-sdk";
import { handleResponse, startupSequence } from './openai.js';

const homeserverUrl = "https://matrix-client.matrix.org"; // make sure to update this with your url
const accessToken = "syt_cmhiMQ_ktCeqppZmFCprXOFmOdY_1f8pwW";
const storage = new SimpleFsStorageProvider("bot.json");

const client = new MatrixClient(homeserverUrl, accessToken, storage);
AutojoinRoomsMixin.setupOnClient(client);

client.start().then(() => console.log("Client started!"));
let roomId = "!yidXwcPJbkXvAixVIL:matrix.org";

client.sendMessage(roomId, {
    "msgtype": "m.text",
    "body": "",
});

client.on("room.message", (roomId, event) => {
    if (!event["content"]) return;
    const sender = event["sender"];
    const body = event["content"]["body"];

    let myId = sender.includes("rhb1");
    if (myId) return;
    else console.log(sender.replace(":beeper.com", "").replace(":matrix.org"))

    processAI(body);
});

async function processAI(body) {
    client.setTyping(roomId, true, 5000);
    let aiResponse = await handleResponse(body);
    client.setTyping(roomId, false);
    client.sendMessage(roomId, {
        "msgtype": "m.text",
        "body": aiResponse,
    });
}

let response = await startupSequence();
client.sendMessage(roomId, {
    "msgtype": "m.text",
    "body": response,
});