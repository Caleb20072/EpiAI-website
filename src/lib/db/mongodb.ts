import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MONGODB_URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE || "Epi'AI";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectDB(): Promise<Db> {
    // Si la connexion mise en cache est toujours vivante, la réutiliser
    if (cachedClient && cachedDb) {
        try {
            // Ping rapide pour vérifier que la connexion est encore active
            await cachedDb.command({ ping: 1 });
            return cachedDb;
        } catch {
            // Connexion morte, on en crée une nouvelle
            cachedClient = null;
            cachedDb = null;
        }
    }

    const client = new MongoClient(uri, {
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 30000,
    });

    await client.connect();
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    return db;
}

export async function disconnectDB(): Promise<void> {
    if (cachedClient) {
        await cachedClient.close();
        cachedClient = null;
        cachedDb = null;
    }
}
