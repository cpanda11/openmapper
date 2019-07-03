import * as uuid from "uuid";
import * as log4js from "log4js";

import {Server} from "ws";

const port = 9030;

let wss = new Server({port});

let logger = log4js.getLogger();

logger.level = "debug";
logger.info("Listen on port: " + port);


wss.on("connection", (ws: any) => {
    ws.id = uuid();
    console.log(ws.id);


    //sendRegistrationRequest(ws.id, wss.clients);

    ws.on("message", (msg) => {
        console.log("message");
        console.log(msg);
        wss.clients.forEach((client) => {
            client.send(msg);
        });
    });

    ws.on("close", (client) => {
        console.log(client)
    });
});

function sendRegistrationRequest(id: string, clients: any) {
    const ids = clients.forEach((client: any) => client.id);

    clients.forEach((client) => {
        client.send(JSON.stringify({
            id,
            clients: ids
        }));
    })
}
