import { Router } from "express";
import { eq, gte, desc, asc, and } from "drizzle-orm";
import { db, eventsTable, rsvpsTable, profilesTable, usersTable } from "@workspace/db";
import {
  ListEventsQueryParams,
  GetEventParams,
  UpdateEventParams,
  DeleteEventParams,
  RsvpEventParams,
  GetEventRsvpsParams,
  CreateEventBody,
  UpdateEventBody,
  RsvpEventBody,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";

const router = Router();

async function getRsvpCounts(eventId: number) {
  const rsvps = await db.select().from(rsvpsTable).where(eq(rsvpsTable.eventId, eventId));
  return {
    going: rsvps.filter(r => r.status === "going").length,
    notGoing: rsvps.filter(r => r.status === "notGoing").length,
    maybe: rsvps.filter(r => r.status === "maybe").length,
  };
}

async function getMyRsvp(eventId: number, userId: number): Promise<string | null> {
  const [rsvp] = await db.select().from(rsvpsTable)
    .where(and(eq(rsvpsTable.eventId, eventId), eq(rsvpsTable.userId, userId)));
  return rsvp?.status ?? null;
}

async function formatEvent(event: typeof eventsTable.$inferSelect, userId: number) {
  const rsvpCounts = await getRsvpCounts(event.id);
  const myRsvp = await getMyRsvp(event.id, userId);
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    eventType: event.eventType,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
    timezone: event.timezone,
    location: event.location,
    meetingUrl: event.meetingUrl ?? null,
    coverImageUrl: event.coverImageUrl ?? null,
    capacity: event.capacity ?? null,
    rsvpDeadline: event.rsvpDeadline ? event.rsvpDeadline.toISOString() : null,
    status: event.status,
    rsvpCounts,
    myRsvp,
    createdAt: event.createdAt.toISOString(),
  };
}

router.get("/events", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const qp = ListEventsQueryParams.safeParse(req.query);
  const params = qp.success ? qp.data : {};

  let events = await db.select().from(eventsTable).orderBy(asc(eventsTable.startAt));

  if (params.upcoming) {
    const now = new Date();
    events = events.filter(e => new Date(e.startAt) >= now && e.status !== "cancelled");
  }

  const formatted = await Promise.all(events.map(e => formatEvent(e, userId)));
  res.json(formatted);
});

router.post("/events", requireAdmin, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [event] = await db
    .insert(eventsTable)
    .values({
      ...parsed.data,
      startAt: new Date(parsed.data.startAt),
      endAt: new Date(parsed.data.endAt),
      rsvpDeadline: parsed.data.rsvpDeadline ? new Date(parsed.data.rsvpDeadline) : null,
      createdBy: userId,
    })
    .returning();

  res.status(201).json(await formatEvent(event, userId));
});

router.get("/events/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const params = GetEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, params.data.id));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(await formatEvent(event, userId));
});

router.patch("/events/:id", requireAdmin, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const params = UpdateEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.startAt) updateData.startAt = new Date(parsed.data.startAt);
  if (parsed.data.endAt) updateData.endAt = new Date(parsed.data.endAt);
  if (parsed.data.rsvpDeadline) updateData.rsvpDeadline = new Date(parsed.data.rsvpDeadline);

  const [updated] = await db
    .update(eventsTable)
    .set(updateData)
    .where(eq(eventsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(await formatEvent(updated, userId));
});

router.delete("/events/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(eventsTable).where(eq(eventsTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/events/:id/rsvp", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const params = RsvpEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = RsvpEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, params.data.id));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const [existing] = await db.select().from(rsvpsTable)
    .where(and(eq(rsvpsTable.eventId, event.id), eq(rsvpsTable.userId, userId)));

  if (existing) {
    await db.update(rsvpsTable).set({ status: parsed.data.status }).where(eq(rsvpsTable.id, existing.id));
  } else {
    await db.insert(rsvpsTable).values({ eventId: event.id, userId, status: parsed.data.status });
  }

  res.json(await formatEvent(event, userId));
});

router.get("/events/:id/rsvps", requireAuth, async (req, res): Promise<void> => {
  const params = GetEventRsvpsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rsvps = await db.select().from(rsvpsTable).where(eq(rsvpsTable.eventId, params.data.id));

  const formatted = await Promise.all(
    rsvps.map(async (rsvp) => {
      const profile = await db.select().from(profilesTable).where(eq(profilesTable.userId, rsvp.userId)).then(r => r[0]);
      return {
        userId: rsvp.userId,
        studentName: profile?.fullName ?? "Unknown",
        studentCollege: profile?.college ?? null,
        photoUrl: profile?.photoUrl ?? null,
        status: rsvp.status,
      };
    })
  );

  res.json(formatted);
});

export default router;
