import { MongoClient, ServerApiVersion } from 'mongodb';
import * as dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

export default async function getDays() {
    return new Promise(async (resolve, reject) => {
        try {
            // Connect the client to the server
            await client.connect();
            const collection = client.db(process.env.MONGO_DB).collection(process.env.MONGO_COLLECTION);

            // Fetch the latest document
            const latestDocument = await collection.find().sort().limit(5).toArray();
            console.log("docs from mongo: " + JSON.stringify(latestDocument))
            resolve(JSON.stringify(latestDocument));  // Resolving with the latest document

            // Send a ping to confirm a successful connection
        } catch (err) {
            reject(err);
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close();
        }
    });
};

export async function writeToDb(doc) {
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    try {
        await client.connect();
        const collection = client.db(process.env.MONGO_DB).collection(process.env.MONGO_COLLECTION);
        const result = await collection.insertOne(doc);
        console.log(`Successfully inserted item with _id: ${result.insertedId}`);
    } finally {
        await client.close();
    }
}