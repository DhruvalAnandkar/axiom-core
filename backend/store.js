/* User store: MongoDB when MONGODB_URI is set, otherwise a local JSON file —
   same interface either way, so pasting a connection string is the only step
   needed to go cloud. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");
const FILE = path.join(DATA_DIR, "users.json");

const DEFAULT_STATS = { analyzed: 0, taken: 0, potted: 0, scratches: 0 };

function publicUser(u) {
  if (!u) return null;
  return { name: u.name, email: u.email, createdAt: u.createdAt, stats: { ...DEFAULT_STATS, ...u.stats } };
}

/* ---------- file store ---------- */

function fileRead() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

function fileWrite(users) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(users, null, 1));
}

const fileStore = {
  kind: "local file (set MONGODB_URI for cloud persistence)",
  async findUser(email) {
    return fileRead()[email.toLowerCase()] ?? null;
  },
  async createUser(user) {
    const users = fileRead();
    const key = user.email.toLowerCase();
    if (users[key]) return null;
    users[key] = user;
    fileWrite(users);
    return user;
  },
  async bumpStat(email, key, n = 1) {
    const users = fileRead();
    const u = users[email.toLowerCase()];
    if (!u) return null;
    u.stats = { ...DEFAULT_STATS, ...u.stats };
    u.stats[key] = (u.stats[key] ?? 0) + n;
    fileWrite(users);
    return u;
  },
};

/* ---------- mongo store ---------- */

function mongoStore(uri) {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 5_000,
  });
  const users = () => client.db(process.env.MONGODB_DB || "axiom").collection("users");
  let connected = false;
  const ensure = async () => {
    if (!connected) {
      await client.connect();
      await users().createIndex({ email: 1 }, { unique: true });
      connected = true;
    }
  };
  return {
    kind: "MongoDB",
    async findUser(email) {
      await ensure();
      return users().findOne({ email: email.toLowerCase() });
    },
    async createUser(user) {
      await ensure();
      try {
        await users().insertOne({ ...user, email: user.email.toLowerCase() });
        return user;
      } catch (err) {
        if (err?.code === 11000) return null; // duplicate email
        throw err;
      }
    },
    async bumpStat(email, key, n = 1) {
      await ensure();
      const res = await users().findOneAndUpdate(
        { email: email.toLowerCase() },
        { $inc: { [`stats.${key}`]: n } },
        { returnDocument: "after" },
      );
      return res ?? null;
    },
  };
}

/* If Mongo is unreachable (bad URI, deleted cluster, no network), degrade to
   the file store instead of failing every auth request. */
function withFallback(primary) {
  let dead = false;
  const wrap = (fn) =>
    async (...args) => {
      if (dead) return fileStore[fn](...args);
      try {
        return await primary[fn](...args);
      } catch (err) {
        console.error(`[store] MongoDB unreachable (${err.message}) — using local file store.`);
        dead = true;
        return fileStore[fn](...args);
      }
    };
  return {
    get kind() {
      return dead ? "local file (MongoDB unreachable — check MONGODB_URI)" : primary.kind;
    },
    findUser: wrap("findUser"),
    createUser: wrap("createUser"),
    bumpStat: wrap("bumpStat"),
  };
}

export const store = process.env.MONGODB_URI
  ? withFallback(mongoStore(process.env.MONGODB_URI))
  : fileStore;
export { publicUser, DEFAULT_STATS };
