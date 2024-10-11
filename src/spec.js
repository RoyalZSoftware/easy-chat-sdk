import { addUser, createChatMessage, createChatRoom, createUser, queryChatMessages } from "./models.js";

let testCases = [];

const it = async (name, cb) => {
    testCases.push([name, cb])
}

export async function run() {
    for (const testCase of testCases) {
        try {
            await testCase[1]();
            console.log(testCase[0], "PASSED");
        } catch(e) {
            console.log(testCase[0], "FAILED");
            console.error(e);
        }
    }
}

const expectEquals = (val, expected) => {
    if (val !== expected) throw new Error("Not equal! " + val + " expected " + expected);
}

it("domain happy path", () => {
    const users = [createUser("User One"), createUser("User Two")];

    const chatRoom = createChatRoom("My chat room");
    const foreignChatRoom = createChatRoom("Foreign chat room");

    users.forEach((user) => addUser(chatRoom, user))

    const history = [
        [0, "Hello User One"],
        [1, "Hey User Two. What's up?"],
        [0, "Nothing. I just wanted to check what's up"],
        [0, "Where are you?"],
        [1, "Behind you"]
    ]

    history.forEach(c => createChatMessage(chatRoom, users[c[0]], c[1]));

    const myMessages = queryChatMessages(chatRoom);
    expectEquals(myMessages.length, 5);

    const foreignMessages = queryChatMessages(foreignChatRoom);
    expectEquals(foreignMessages.length, 0);
});