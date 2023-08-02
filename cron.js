import { dayEndProcess, startupProcess } from "./index.js";
import cron from "node-cron";
import moment from "moment";

let min = 27;

// morning scheduleing
cron.schedule(`45 7 * * *`, async () => {
    console.log('Running startup job at ' + moment().format("MM-DD-YYYY, h:mm:ss a'"));

    startupProcess();
}, {
    scheduled: true,
    timezone: "America/Los_Angeles"
});


// evening scheduleing
cron.schedule(`45 23 * * *`, async () => {
    console.log('Running day end job at ' + moment().format("MM-DD-YYYY, h:mm:ss a'"));
    dayEndProcess();
}, {
    scheduled: true,
    timezone: "America/Los_Angeles"
});

