import { Db, MongoClient } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;
const defaultDbName = process.env.MONGODB_DB || "nishack";

function getClientPromise(): Promise<MongoClient> | null {
  if (!uri) {
    return null;
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }

  return global._mongoClientPromise;
}

export async function getMongoDb(): Promise<Db | null> {
  const clientPromise = getClientPromise();
  if (!clientPromise) {
    return null;
  }

  const client = await clientPromise;
  return client.db(defaultDbName);
}
