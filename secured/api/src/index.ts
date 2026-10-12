import "dotenv/config";
import { createRequire } from "node:module";
import express from "express";
import cors from "cors";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRouters from "./routes/authRoutes.js";
import { authenticate } from "./middleware/authMiddleware.js";
import noteRoutes from "./routes/noteRoutes.js";
import { csrfToken, requireCsrf } from "./middleware/csrfMiddleware.js";
import { db } from "./database.js";

const secret = process.env.SESSION_SECRET;
if (!secret || secret.length < 32 || /^(password123|change[-_ ]?me|secret|development)$/i.test(secret)) {
  throw new Error("SESSION_SECRET must be a unique secret of at least 32 characters");
}
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5174";
const parsedFrontendOrigin = new URL(frontendOrigin);
if (parsedFrontendOrigin.origin !== frontendOrigin || !["http:", "https:"].includes(parsedFrontendOrigin.protocol)) {
  throw new Error("FRONTEND_ORIGIN must be one explicit HTTP or HTTPS origin without a path or wildcard");
}
const production = process.env.NODE_ENV === "production";
function logError(event: string, error: unknown) {
  const safeError = error instanceof Error ? { name: error.name, message: error.message } : { message: "Unknown error" };
  console.error(JSON.stringify({ level: "error", event, ...safeError, timestamp: new Date().toISOString() }));
}
export const app = express();
if (production && process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: frontendOrigin, credentials: true, methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "X-CSRF-Token"] }));
app.use(express.json({ limit: "16kb", strict: true }));
const PgSession = createRequire(import.meta.url)("connect-pg-simple")(session) as new (options: { pool: typeof db; tableName: string; createTableIfMissing: boolean }) => session.Store;
app.use(session({
  name: "secured.sid",
  store: new PgSession({ pool: db, tableName: "secured_sessions", createTableIfMissing: true }),
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: production, sameSite: "lax", maxAge: 1000 * 60 * 60 * 8, path: "/" },
}));
app.use(requireCsrf);

app.get("/api/csrf-token", csrfToken);
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many login attempts; try again later" } }));
app.get("/api/test-auth", authenticate, (req, res) => res.json({ message: "Authenticated", userId: req.session.userId }));
app.use("/api/auth", authRouters);
app.use("/api/notes", noteRoutes);
app.get("/api/health", async (_req, res) => {
  try { await db.query("SELECT 1"); return res.json({ status: "ok", database: "connected" }); }
  catch (error) { logError("health_check_database_failure", error); return res.status(503).json({ status: "error", database: "disconnected" }); }
});
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logError("request_failed", error);
  if (error instanceof SyntaxError) return res.status(400).json({ error: "Invalid JSON request body" });
  return res.status(500).json({ error: "Internal server error" });
});

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 3001);
  app.listen(port, () => console.log(`Secured API running on port ${port}`));
}
