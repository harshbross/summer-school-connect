import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  RegisterBody,
  LoginBody,
} from "@workspace/api-zod";
import { hashPassword, verifyPassword, requireAuth } from "../lib/auth";
import { settingsTable } from "@workspace/db";

const router = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, inviteCode } = parsed.data;

  // Check invite code
  const [codeSetting] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.key, "invite_code"));

  if (!codeSetting || codeSetting.value !== inviteCode) {
    res.status(400).json({ error: "Invalid invite code" });
    return;
  }

  // Check if email already exists
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({ email: email.toLowerCase(), passwordHash, role: "student" })
    .returning();

  req.session!.userId = user.id;
  req.session!.role = user.role;

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      onboardingComplete: user.onboardingComplete,
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (!user || !user.isActive) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (!verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  req.session!.userId = user.id;
  req.session!.role = user.role;

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      onboardingComplete: user.onboardingComplete,
    },
  });
});

router.post("/auth/logout", (req, res): void => {
  req.session = null;
  res.json({ ok: true });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    onboardingComplete: user.onboardingComplete,
  });
});

export default router;
