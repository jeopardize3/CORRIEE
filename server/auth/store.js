import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'auth.json');

const MONGODB_URI = (process.env.MONGODB_URI || '').trim();
const MONGODB_DB = (process.env.MONGODB_DB || 'corriesells').trim();
const MONGODB_STORE_COLLECTION = (process.env.MONGODB_STORE_COLLECTION || 'auth_store').trim();
const STORE_ID = 'default';

let mongoClient = null;
let mongoDb = null;
let updateQueue = Promise.resolve();

function normalizeStore(store) {
    const safe = store && typeof store === 'object' ? store : {};
    if (!Array.isArray(safe.users)) safe.users = [];
    if (!Array.isArray(safe.sessions)) safe.sessions = [];
    return safe;
}

function hasMongoConfig() {
    return !!MONGODB_URI;
}

async function getMongoDb() {
    if (!hasMongoConfig()) return null;
    if (mongoDb) return mongoDb;

    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    mongoDb = mongoClient.db(MONGODB_DB);
    return mongoDb;
}

async function readStoreMongo() {
    const db = await getMongoDb();
    const collection = db.collection(MONGODB_STORE_COLLECTION);
    const doc = await collection.findOne({ _id: STORE_ID });
    if (!doc) return normalizeStore({ users: [], sessions: [] });
    return normalizeStore({ users: doc.users || [], sessions: doc.sessions || [] });
}

async function writeStoreMongo(store) {
    const db = await getMongoDb();
    const collection = db.collection(MONGODB_STORE_COLLECTION);
    const payload = normalizeStore(store);
    await collection.updateOne(
        { _id: STORE_ID },
        { $set: { users: payload.users, sessions: payload.sessions } },
        { upsert: true }
    );
}

async function readStoreFile() {
    try {
        const raw = await fs.readFile(DATA_FILE, 'utf8');
        return normalizeStore(JSON.parse(raw));
    } catch (error) {
        if (error.code === 'ENOENT') {
            return normalizeStore({ users: [], sessions: [] });
        }
        throw error;
    }
}

async function writeStoreFile(store) {
    const payload = normalizeStore(store);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2));
}

export async function readStore() {
    if (hasMongoConfig()) {
        return await readStoreMongo();
    }
    return await readStoreFile();
}

export async function writeStore(store) {
    if (hasMongoConfig()) {
        await writeStoreMongo(store);
        return;
    }
    await writeStoreFile(store);
}

export function isSessionExpired(session) {
    if (!session || !session.expiresAt) return false;
    const expires = new Date(session.expiresAt);
    if (Number.isNaN(expires.getTime())) return false;
    return expires.getTime() <= Date.now();
}

export function pruneExpiredSessions(store) {
    if (!store || !Array.isArray(store.sessions)) return;
    store.sessions = store.sessions.filter((session) => !isSessionExpired(session));
}

export async function updateStore(mutator) {
    const task = updateQueue.then(async () => {
        const store = await readStore();
        const result = await mutator(store);
        await writeStore(store);
        return result;
    });

    updateQueue = task.catch(() => {});
    return task;
}

export { DATA_FILE };
