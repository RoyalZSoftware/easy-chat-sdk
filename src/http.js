import { ClientRequest, createServer, IncomingMessage, ServerResponse } from 'http';
import { EventQueue } from './database.js';
import { createChatRoom, getChatRooms } from './models.js';

const PORT = 8081;

/**
 * @param {ServerResponse<IncomingMessage>} res
 * @param {any} data 
 * @param {number} statusCode
 */
function respondJson(res, data, statusCode = 200) {
    res.setHeader("Content-type", "application/json");
    res.statusCode = statusCode;
    res.write(JSON.stringify(data));

    res.end();
}

/**
 * @param {IncomingMessage} req 
 */
async function readJsonBody(req) {
    return new Promise((resolve) => {
        req.on('data', (data) => {
            resolve(JSON.parse(data.toString()));
        });
    });
}

const App = {
    endpoints: [],
    /**
     * @param {string} path
     * @param {(request, response) => Promise<any>} cb
     */
    post: (path, cb) => {
        App.endpoints.push(["POST", path, cb]);
    },
    /**
     * @param {string} path 
     * @param {(request: ClientRequest) => Promise<any>} cb
     */
    get: (path, cb) => {
        App.endpoints.push(["GET", path, cb]);
    },
    listen: () => {
        console.log("Started server on port: " + PORT)
        createServer((req, res) => {
            for (const endpoint of App.endpoints) {
                if (req.url.toLowerCase() === endpoint[1].toLowerCase() && req.method.toUpperCase() === endpoint[0]) {
                    return endpoint[2](req, res);
                }
            }

            respondJson(res, {
                error: "Not found"
            }, 404);

        }).listen(PORT, "0.0.0.0");
    }
}

App.post("/message", (request, response) => {
    respondJson(response, {
        message: "test"
    });
});

EventQueue.register("chat_rooms", "inserted", (payload) => {
    console.log(payload)
})

App.post("/chatroom/create", (request, response) => {
    respondJson(response, createChatRoom(+new Date()));
})

App.get("/chatroom", (request, response) => {
    respondJson(response, getChatRooms());
})

App.get("/", (request, response) => {
    respondJson(response, {
        error: "OK"
    });
});

export {
    App
};