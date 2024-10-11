export function uniqueId() {
    return (Math.ceil(Math.random() * 1000) + '' + +new Date()).substring(0, 8);
}

export const EventQueue = {
    listeners: [],
    /**
     * @param {string} collectionName
     * @param {string} trigger
     * @param {any} cb 
     */
    register: (collectionName, trigger, cb) => {
        EventQueue.listeners.push([collectionName+"."+ trigger, cb]);
    },
    /**
     * @param {string} collectionName
     * @param {'inserted'} trigger
     * @param {any} payload
     */
    emit: (collectionName, trigger, payload) => {
        const eligable = EventQueue.listeners.filter(c => c[0] === collectionName + "." + trigger).map(c => c[1]);

        eligable.forEach((fn) => {
            fn(payload);
        })
    }
};

/**
 * @typedef {Object} Attribute
 * @property {string} collectionName
 * @property {string} name
 */

/**
 * @typedef {Object} Collection
 * @property {string} name
 * @property {Attribute[]} attributes
 * @property {any[]} data
 */

/**
 * @property {string} name
 * @property {string[]} attributeNames
 * @returns {Collection}
 */
export function makeCollection(name, attributes) {
    return {
        attributes: attributes.map(c => ({collectionName: name, name: c})),
        data: [],
        name: name,
    };
}

/**
 * @param {Collection} collection
 * @param {string} $id
 */
export function getDocument(collection, $id) {
    return collection.data.find(c => c.$id === $id);
}

export const Query = {
    /**
     * @param {number} limit 
     */
    limit: (limit) => [0, "limit", limit],
    /**
     * @param {number} after
     */
    after: (after) => [0, "after", after],
    /**
     * @param {string} field the collections field
     * @param {string} query the collections query
     */
    search: (field, query) => [1, "query", field, query],
    /**
     * @param {string} field 
     * @param {string} eq 
     */
    equal: (field, eq) => [2, "equal", field, eq],
}

/**
 * @param {Collection} collection
 * @param {string[][]} query 
 */
export function queryDocuments(collection, query = []) {
    query = query.sort((a, b) => a[0] + b[0]);
    return query.reduce((prev, filter) => {
        switch(filter[1]) {
            case "equal":
                return prev.filter(c => c[filter[2]] === filter[3]) ?? [];
            case "after":
                return prev.slice(filter[2]);
            case "limit":
                return prev.slice(0, filter[2]);
            case "query":
                return prev.filter(c => c[filter[2]].includes(filter[3]))
            default:
                return prev;
        }
    }, collection.data);
}

/**
 * @param {Collection} collection 
 * @param {any} document 
 */
export function insertDocument(collection, document) {
    collection.data.push(document);
    EventQueue.emit(collection.name, "inserted", document);
}