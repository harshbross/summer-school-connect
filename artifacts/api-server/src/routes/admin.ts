import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, profilesTable, settingsTable } from "@workspace/db";
import {
  AdminDeactivateStudentParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { randomBytes } from "crypto";

const router = Router();

router.get("/admin/students", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy();
  const profiles = await db.select().from(profilesTable);

  const profileMap = new Map(profiles.map(p => [p.userId, p]));

  const formatted = users.map(u => ({
    id: u.id,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    onboardingComplete: u.onboardingComplete,
    profileName: profileMap.get(u.id)?.fullName ?? null,
    college: profileMap.get(u.id)?.college ?? null,
    joinedAt: u.createdAt.toISOString(),
  }));

  res.json(formatted);
});

router.patch("/admin/students/:id/deactivate", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminDeactivateStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ isActive: !user.isActive })
    .where(eq(usersTable.id, params.data.id))
    .returning();

  const profile = await db.select().from(profilesTable).where(eq(profilesTable.userId, updated.id)).then(r => r[0]);

  res.json({
    id: updated.id,
    email: updated.email,
    role: updated.role,
    isActive: updated.isActive,
    onboardingComplete: updated.onboardingComplete,
    profileName: profile?.fullName ?? null,
    college: profile?.college ?? null,
    joinedAt: updated.createdAt.toISOString(),
  });
});

router.get("/admin/invite-code", requireAdmin, async (_req, res): Promise<void> => {
  const [setting] = await db.select().from(settingsTable).where(eq(settingsTable.key, "invite_code"));
  res.json({ code: setting?.value ?? "" });
});

router.post("/admin/invite-code", requireAdmin, async (_req, res): Promise<void> => {
  const code = randomBytes(4).toString("hex").toUpperCase();

  const [existing] = await db.select().from(settingsTable).where(eq(settingsTable.key, "invite_code"));
  if (existing) {
    await db.update(settingsTable).set({ value: code }).where(eq(settingsTable.key, "invite_code"));
  } else {
    await db.insert(settingsTable).values({ key: "invite_code", value: code });
  }

  res.json({ code });
});

export default router;
