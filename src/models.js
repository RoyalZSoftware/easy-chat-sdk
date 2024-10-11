import { insertDocument, makeCollection, Query, queryDocuments, uniqueId } from './database.js';

/**
 * @typedef {Object} User
 * @property {string} $id
 * @property {Date} $createdAt
 * @property {string} name
 */
const Users = makeCollection("users", ["$id", "$createdAt", "name"]);

/**
 * @property {string} name
 * @returns {User}
 */
export function createUser(name) {
    const user = {
        $id: uniqueId(),
        $createdAt: new Date(),
        name,
    };

    insertDocument(Users, user);

    return user;
}

/**
 * @typedef {Object} ChatRoom
 * @property {string} $id
 * @property {Date} $createdAt
 * @property {User[]} users
 * @property {string} title
 */
const ChatRooms = makeCollection("chat_rooms", ["$id", "$createdAt", "users", "title"]);

/**
 * @property {string} title
 * @returns {ChatRoom}
 */
export function createChatRoom(title) {
    const chatRoom = {
        $id: uniqueId(),
        $createdAt: new Date(),
        title,
        users: [],
    };

    insertDocument(ChatRooms, chatRoom);

    return chatRoom;
}

export const getChatRooms = () => queryDocuments(ChatRooms);

/**
 * @param {ChatRoom} chatRoom 
 * @param {User} user
 * @returns {boolean}
 */
export function isUserInChatRoom(chatRoom, user) {
    return !!chatRoom.users.find(c => c.$id === user.$id);
}

/**
 * Adds the {@link User} to the {@link ChatRoom}
 * @param {ChatRoom} chatRoom 
 * @param {User} user 
 * @returns {void}
 */
export function addUser(chatRoom, user) {
    if (isUserInChatRoom(chatRoom, user)) throw new Error('User is already in ChatRoom');
    chatRoom.users.push(user);
}

/**
 * Removes the {@link User} from the {@link ChatRoom}
 * @param {ChatRoom} chatRoom 
 * @param {User} user 
 * @returns {void}
 */
export function removeUser(chatRoom, user) {
    if(!isUserInChatRoom(chatRoom, user)) throw new Error('User is not in ChatRoom');
    chatRoom.users = chatRoom.users.filter(c => c.$id !== user.$id);
}

/**
 * @typedef {Object} ChatMessage
 * @property {string} $id
 * @property {Date} $createdAt
 * @property {User} author
 * @property {ChatRoom} chatRoom
 * @property {string} text
 */
const ChatMessages = makeCollection("chat_messages", ["$id", "$createdAt", "author", "chatRoom", "text"]);

/**
 * @param {ChatRoom} chatRoom
 * @param {User} author
 * @param {string} text
 * @returns {ChatMessage}
 */
export function createChatMessage(chatRoom, author, text) {
    const msg = {
        $id: uniqueId(),
        $createdAt: new Date(),
        chatRoom,
        author,
        text,
    }

    insertDocument(ChatMessages, msg);

    return msg;
}

export function queryChatMessages(chatRoom, page = 0) {
    const limit = 20;
    return queryDocuments(ChatMessages, [Query.equal("chatRoom", chatRoom), Query.after(page * limit), Query.limit(limit)]);
}