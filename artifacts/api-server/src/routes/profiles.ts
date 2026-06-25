import { Router } from "express";
import { eq, ilike, or, sql } from "drizzle-orm";
import { db, profilesTable, usersTable } from "@workspace/db";
import {
  ListProfilesQueryParams,
  GetProfileParams,
  CompleteOnboardingBody,
  UpdateMyProfileBody,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

function formatProfile(profile: typeof profilesTable.$inferSelect, user: typeof usersTable.$inferSelect) {
  return {
    id: profile.id,
    userId: profile.userId,
    fullName: profile.fullName,
    pronouns: profile.pronouns ?? null,
    homeCity: profile.homeCity ?? null,
    college: profile.college,
    year: profile.year,
    major: profile.major,
    bio: profile.bio,
    funFact: profile.funFact ?? null,
    photoUrl: profile.photoUrl ?? null,
    linkedinUrl: profile.linkedinUrl ?? null,
    instagramHandle: profile.instagramHandle ?? null,
    websiteUrl: profile.websiteUrl ?? null,
    interestTags: profile.interestTags ?? [],
    joinedAt: user.createdAt.toISOString(),
  };
}

router.get("/profiles", requireAuth, async (req, res): Promise<void> => {
  const qp = ListProfilesQueryParams.safeParse(req.query);
  const params = qp.success ? qp.data : {};

  const results = await db
    .select()
    .from(profilesTable)
    .innerJoin(usersTable, eq(profilesTable.userId, usersTable.id))
    .where(
      or(
        params.search ? ilike(profilesTable.fullName, `%${params.search}%`) : undefined,
        params.search ? ilike(profilesTable.college, `%${params.search}%`) : undefined,
      )
    );

  let filtered = results;
  if (params.college) {
    filtered = filtered.filter(r => r.profiles.college.toLowerCase().includes(params.college!.toLowerCase()));
  }
  if (params.year) {
    filtered = filtered.filter(r => r.profiles.year === params.year);
  }
  if (params.major) {
    filtered = filtered.filter(r => r.profiles.major.toLowerCase().includes(params.major!.toLowerCase()));
  }
  if (params.tag) {
    filtered = filtered.filter(r => r.profiles.interestTags?.includes(params.tag!));
  }

  const profiles = filtered
    .filter(r => r.users.isActive)
    .map(r => formatProfile(r.profiles, r.users));

  res.json(profiles);
});

router.get("/profiles/me", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const [result] = await db
    .select()
    .from(profilesTable)
    .innerJoin(usersTable, eq(profilesTable.userId, usersTable.id))
    .where(eq(profilesTable.userId, userId));

  if (!result) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(formatProfile(result.profiles, result.users));
});

router.patch("/profiles/me", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId));
  if (!existing) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const [updated] = await db
    .update(profilesTable)
    .set(parsed.data)
    .where(eq(profilesTable.userId, userId))
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.json(formatProfile(updated, user));
});

router.post("/profiles/onboarding", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const parsed = CompleteOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Check if profile already exists
  const [existing] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId));
  
  let profile: typeof profilesTable.$inferSelect;
  if (existing) {
    const [updated] = await db
      .update(profilesTable)
      .set(parsed.data)
      .where(eq(profilesTable.userId, userId))
      .returning();
    profile = updated;
  } else {
    const [created] = await db
      .insert(profilesTable)
      .values({ ...parsed.data, userId })
      .returning();
    profile = created;
  }

  // Mark onboarding complete
  await db.update(usersTable).set({ onboardingComplete: true }).where(eq(usersTable.id, userId));
  req.session!.onboardingComplete = true;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json(formatProfile(profile, user));
});

router.get("/profiles/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [result] = await db
    .select()
    .from(profilesTable)
    .innerJoin(usersTable, eq(profilesTable.userId, usersTable.id))
    .where(eq(profilesTable.id, params.data.id));

  if (!result) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(formatProfile(result.profiles, result.users));
});

export default router;
