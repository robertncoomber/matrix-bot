import chalk from "chalk";
import PromptSync from "prompt-sync";
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from 'dotenv';

dotenv.config();
const prompt = PromptSync();

const configuration = new Configuration({
    organization: "org-WHcqwXkvrqu8UeNV76L5rRQQ",
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let model;
model = "gpt-3.5-turbo-0301"; // try ada while building

let instructions = "You are a helpful ai assistent";
let messages = [];


messages.push({ role: "system", content: instructions })
let num = 0;


export async function run(userPrompt) {
    if (userPrompt == "quit") {
        return;
    }

    messages.push({ role: "user", content: userPrompt })
    const response = await openai.createChatCompletion({
        model: model,
        temperature: 0.888,
        max_tokens: 1000,
        frequency_penalty: 0,
        presence_penalty: 0,
        top_p: 1,
        messages: messages
    }, { timeout: 60000 });

    const response_text = response.data.choices[0].message.content.trim();
    messages.push({ role: "assistant", content: response_text })
    console.log("\n" + chalk.greenBright("chat: " + response_text + "\n"));
    return response_text;
}