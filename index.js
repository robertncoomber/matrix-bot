import {
    MatrixClient,
    SimpleFsStorageProvider,
    AutojoinRoomsMixin,
} from "matrix-bot-sdk";
import { getFullConversation, handleResponse, startupSequence } from "./openai.js";
import * as dotenv from "dotenv";
import getDays, { writeToDb } from "./mongo.js";
import moment from "moment";
dotenv.config();

const homeserverUrl = process.env.MATRIX_HOMESERVER; // make sure to update this with your url
const accessToken = process.env.MATRIX_ACCESS_TOKEN;
const storage = new SimpleFsStorageProvider("bot.json");

const client = new MatrixClient(homeserverUrl, accessToken, storage);
AutojoinRoomsMixin.setupOnClient(client);

export async function startupProcess() {
    client.start().then(() => console.log("Client started!"));
    getDays().then(async (data) => {
        let instructions =
            "You are an AI assistent accountability-buddy for your friend Robert's diet and exercise program. His goals are to eat healty, get exercise every day and to track his weight over time. You are going to sending him a text message to start the day! Before you send him the message it is important you have context as to where he is in his current journal. Below are summaries of what you should consider as previous conversations over the last few days. Respond as a life coach would to help him achieve his goals throughout the day. I trust you with this responsibility for Robert. Do your best! Try to keep the first message to a few sentense. He will hold the conversation for some time. Here is the data: \n\n";
        instructions += data;
        let response = await startupSequence(instructions);
        client.sendMessage(roomId, {
            msgtype: "m.text",
            body: response,
        });
    });
}

let roomId = process.env.ROOM_ID;
client.on("room.message", async (roomId, event) => {
    if (!event["content"]) return;
    const sender = event["sender"];
    const body = event["content"]["body"];

    let myId = sender.includes("rhb1");
    if (myId) return;
    else console.log(sender.replace(":beeper.com", "").replace(":matrix.org"));

    client.setTyping(roomId, true, 5000);
    let aiResponse = await handleResponse(body);
    client.setTyping(roomId, false);
    client.sendMessage(roomId, {
        msgtype: "m.text",
        body: aiResponse,
    });
});

async function processAI(body) {

}

// summarize day and update mongo with new document
export async function dayEndProcess() {
    console.log("stopping client");
    client.stop();
    let convo = getFullConversation();

    let DayEndMessage = 'You are a cog in a machine your purpose is to summarize conversation to the best of your ability and to document by sending a json object. Here is the JSON formatting you must use. {"date": "03-18-2023", "food_intake": "Pizza, Salad, Ice Cream", "brief_summary": "very possitive today, went on a run", "weight": 182 }. Use your best judgement to fill out this json. If you trully dont know what to fill leave it as a empty string or 0 if its number. Remember to only return a json.' + convo;

    let response = await startupSequence(DayEndMessage);
    console.log("response" + response);

    try {
        let jsonContent = extractContentBetweenBraces(response);
        var doc = JSON.parse(jsonContent);
        doc["date"] = moment().format("MM-DD-YYYY");
        writeToDb(doc);
    } catch (e) {
        console.log("error parsing json");
        console.log(e);
        return;
    }
}

function extractContentBetweenBraces(str) {
    const firstOpenBraceIdx = str.indexOf('{');
    const lastCloseBraceIdx = str.lastIndexOf('}');

    if (firstOpenBraceIdx === -1 || lastCloseBraceIdx === -1 || lastCloseBraceIdx < firstOpenBraceIdx) {
        return null; // Braces not found or in the wrong order
    }

    const contentBetweenBraces = str.substring(firstOpenBraceIdx + 1, lastCloseBraceIdx);
    return "{" + contentBetweenBraces + "}";
}