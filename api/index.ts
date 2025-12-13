import express from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

const { Pool } = pg;

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const songs = pgTable("songs", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  coverUrl: text("cover_url"),
  audioPath: text("audio_path"),
  duration: integer("duration").default(0),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  isFavorite: boolean("is_favorite").default(false),
  genre: text("genre"),
  sourceType: text("source_type").notNull(),
  sourceUrl: text("source_url"),
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const app = express();
const PgSession = connectPgSimple(session);

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: "session",
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || "vibeflow-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: "none",
  },
}));

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword,
      displayName,
    }).returning();

    req.session.userId = user.id;
    res.json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = user.id;
    res.json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

app.get("/api/auth/me", async (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }

  const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));
  if (!user) {
    return res.json({ user: null });
  }

  res.json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
});

app.get("/api/songs", requireAuth, async (req, res) => {
  try {
    const userSongs = await db.select().from(songs).where(eq(songs.userId, req.session.userId!));
    res.json(userSongs);
  } catch (error) {
    console.error("Get songs error:", error);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

app.post("/api/songs", requireAuth, async (req, res) => {
  try {
    const { title, artist, album, coverUrl, duration, genre, sourceType } = req.body;
    
    const [song] = await db.insert(songs).values({
      id: crypto.randomUUID(),
      userId: req.session.userId!,
      title,
      artist,
      album,
      coverUrl,
      duration,
      genre,
      sourceType,
    }).returning();

    res.json(song);
  } catch (error) {
    console.error("Create song error:", error);
    res.status(500).json({ error: "Failed to save song" });
  }
});

app.post("/api/songs/:id/favorite", requireAuth, async (req, res) => {
  try {
    const { isFavorite } = req.body;
    const [song] = await db.update(songs).set({ isFavorite }).where(eq(songs.id, req.params.id)).returning();
    res.json(song);
  } catch (error) {
    console.error("Update favorite error:", error);
    res.status(500).json({ error: "Failed to update" });
  }
});

app.delete("/api/songs/:id", requireAuth, async (req, res) => {
  try {
    await db.delete(songs).where(eq(songs.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error("Delete song error:", error);
    res.status(500).json({ error: "Failed to delete" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
