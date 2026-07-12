import "dotenv/config";
import http from "node:http";
import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { TABLE } from "../frontend/src/config/billiardsPresets.js";
import { store, publicUser, DEFAULT_STATS } from "./store.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "axiom-dev-secret-change-in-prod";
const JWT_TTL = "7d";

const PORT = process.env.PORT ?? 3001;
const FRONTEND_ORIGIN =
  process.env.FRONTEND_URL ?? process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";
// Accept both localhost spellings — browsers treat them as different origins.
const ALLOWED_ORIGINS = [
  ...new Set([FRONTEND_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"]),
];

const IS_DEV = process.env.NODE_ENV !== "production";

/** Vite may bump to :3002+ when 3000 is taken — allow any local dev port. */
function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (IS_DEV && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

const boundedPoint = z
  .object({ x: z.number(), y: z.number() })
  .superRefine((p, ctx) => {
    if (p.x < 0 || p.x > TABLE.w || p.y < 0 || p.y > TABLE.h) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `coordinates must be within 0-${TABLE.w} x 0-${TABLE.h}`,
      });
    }
  });

const computeShotSchema = z.object({
  cue_ball: boundedPoint,
  object_ball: boundedPoint,
  pocket: boundedPoint,
  obstacles: z.array(boundedPoint).optional(),
  with_coach: z.boolean().optional(),
});

// 127.0.0.1, not localhost: undici's IPv6-first happy-eyeballs stalls on Windows.
const ENGINE_URL = process.env.ENGINE_URL ?? "http://127.0.0.1:8000";

const webhookSchema = z.object({
  node_id: z.string(),
  agent_name: z.string(),
  status: z.string(),
  message: z.string(),
  payload: z.record(z.unknown()),
});

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) cb(null, true);
      else cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
  },
});

app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) cb(null, true);
      else cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // telemetry + stat sync are chatty; auth has its own tighter limit
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use(apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts, please try again later." },
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", store: store.kind });
});

/* ---------- auth ---------- */

const registerSchema = z.object({
  name: z.string().trim().min(2).max(24),
  email: z.string().trim().email().max(80),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const statSchema = z.object({
  key: z.enum(["analyzed", "taken", "potted", "scratches"]),
});

function signToken(email) {
  return jwt.sign({ sub: email.toLowerCase() }, JWT_SECRET, { expiresIn: JWT_TTL });
}

function requireAuth(req, res, next) {
  const token = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
  try {
    req.userEmail = jwt.verify(token, JWT_SECRET).sub;
    next();
  } catch {
    res.status(401).json({ error: "Not signed in" });
  }
}

app.post("/api/auth/register", authLimiter, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Name (2+ chars), valid email, and a 6+ character password are required." });
  }
  try {
    const { name, email, password } = parsed.data;
    const created = await store.createUser({
      name,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date().toISOString(),
      stats: { ...DEFAULT_STATS },
    });
    if (!created) return res.status(409).json({ error: "An account with that email already exists." });
    return res.status(201).json({ token: signToken(email), user: publicUser(created) });
  } catch (err) {
    console.error("[auth] register failed:", err.message);
    return res.status(500).json({ error: "Could not create the account. Is the database reachable?" });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Email and password are required." });
  try {
    const user = await store.findUser(parsed.data.email);
    const ok = user && (await bcrypt.compare(parsed.data.password, user.passwordHash));
    if (!ok) return res.status(401).json({ error: "Wrong email or password." });
    return res.json({ token: signToken(user.email), user: publicUser(user) });
  } catch (err) {
    console.error("[auth] login failed:", err.message);
    return res.status(500).json({ error: "Sign-in failed. Is the database reachable?" });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await store.findUser(req.userEmail);
    if (!user) return res.status(401).json({ error: "Account no longer exists." });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ error: "Could not load the account." });
  }
});

app.post("/api/user/stats", requireAuth, async (req, res) => {
  const parsed = statSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Unknown stat." });
  try {
    const user = await store.bumpStat(req.userEmail, parsed.data.key);
    if (!user) return res.status(401).json({ error: "Account no longer exists." });
    return res.json({ user: publicUser(user) });
  } catch {
    return res.status(500).json({ error: "Could not update stats." });
  }
});

app.post("/api/webhook", (req, res) => {
  const parsed = webhookSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.flatten(),
    });
  }

  const data = parsed.data;
  io.emit("agent_state_update", data);

  return res.status(200).json({ ok: true });
});

io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on("compute_shot", async (raw) => {
    const parsed = computeShotSchema.safeParse(raw);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join("; ");
      socket.emit("compute_shot_error", { message });
      return;
    }
    try {
      const body = parsed.data;
      const withCoach = body.with_coach ?? false;
      const endpoint = withCoach ? "/api/analyze_shot" : "/api/compute_shot";
      const res = await fetch(`${ENGINE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        socket.emit("compute_shot_error", { message: text });
        return;
      }
      const data = await res.json();
      if (!withCoach && data.vector_data) {
        io.emit("agent_state_update", {
          node_id: "physics",
          agent_name: "PhysicsCore",
          status: "completed",
          message: "Shot computed",
          payload: {
            stage: "drafting",
            vector_data: data.vector_data,
            shot_solution: data,
          },
        });
      }
      socket.emit("compute_shot_ack", data);
    } catch (err) {
      socket.emit("compute_shot_error", { message: err.message ?? "compute_shot failed" });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`[Socket.io] Client disconnected: ${socket.id} (reason: ${reason})`);
  });
});

server.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`);
});
