import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { db, profilesTable, postsTable, eventsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/dashboard/summary", requireAuth, async (_req, res): Promise<void> => {
  const profiles = await db.select().from(profilesTable);
  const posts = await db.select().from(postsTable);
  const events = await db.select().from(eventsTable);
  const now = new Date();
  const upcomingEventsCount = events.filter(e => new Date(e.startAt) >= now && e.status !== "cancelled").length;

  // College breakdown
  const collegeCounts: Record<string, number> = {};
  for (const p of profiles) {
    collegeCounts[p.college] = (collegeCounts[p.college] ?? 0) + 1;
  }
  const collegeBreakdown = Object.entries(collegeCounts)
    .map(([college, count]) => ({ college, count }))
    .sort((a, b) => b.count - a.count);

  // Top tags
  const tagCounts: Record<string, number> = {};
  for (const p of profiles) {
    for (const tag of p.interestTags ?? []) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  res.json({
    totalStudents: profiles.length,
    totalPosts: posts.length,
    totalEvents: events.length,
    upcomingEventsCount,
    collegeBreakdown,
    topTags,
  });
});

router.get("/dashboard/activity", requireAuth, async (_req, res): Promise<void> => {
  const recentPosts = await db.select().from(postsTable).orderBy(asc(postsTable.createdAt));
  const recentEvents = await db.select().from(eventsTable).orderBy(asc(eventsTable.createdAt));

  const postItems = await Promise.all(
    recentPosts.slice(-10).map(async (p) => {
      const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, p.authorId));
      return {
        id: p.id,
        type: "post" as const,
        title: p.content.slice(0, 80),
        actorName: profile?.fullName ?? "Unknown",
        actorPhoto: profile?.photoUrl ?? null,
        entityId: p.id,
        createdAt: p.createdAt.toISOString(),
      };
    })
  );

  const eventItems = recentEvents.slice(-5).map(e => ({
    id: e.id + 10000,
    type: "event" as const,
    title: e.title,
    actorName: "Program Staff",
    actorPhoto: null,
    entityId: e.id,
    createdAt: e.createdAt.toISOString(),
  }));

  const combined = [...postItems, ...eventItems]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  res.json(combined);
});

router.get("/dashboard/upcoming-events", requireAuth, async (_req, res): Promise<void> => {
  const now = new Date();
  const events = await db.select().from(eventsTable).orderBy(asc(eventsTable.startAt));
  const upcoming = events
    .filter(e => new Date(e.startAt) >= now && e.status === "published")
    .slice(0, 3);

  const formatted = upcoming.map(e => ({
    id: e.id,
    title: e.title,
    description: e.description,
    eventType: e.eventType,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt.toISOString(),
    timezone: e.timezone,
    location: e.location,
    meetingUrl: e.meetingUrl ?? null,
    coverImageUrl: e.coverImageUrl ?? null,
    capacity: e.capacity ?? null,
    rsvpDeadline: e.rsvpDeadline ? e.rsvpDeadline.toISOString() : null,
    status: e.status,
    rsvpCounts: { going: 0, notGoing: 0, maybe: 0 },
    myRsvp: null,
    createdAt: e.createdAt.toISOString(),
  }));

  res.json(formatted);
});

export default router;
