import { Router } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, postsTable, profilesTable, usersTable, postReactionsTable, commentsTable } from "@workspace/db";
import {
  ListPostsQueryParams,
  GetPostParams,
  UpdatePostParams,
  DeletePostParams,
  ReactToPostParams,
  CreatePostBody,
  UpdatePostBody,
  ReactToPostBody,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

async function formatPost(post: typeof postsTable.$inferSelect, userId: number) {
  const profile = await db.select().from(profilesTable).where(eq(profilesTable.userId, post.authorId)).then(r => r[0]);
  const commentCount = await db.select().from(commentsTable).where(eq(commentsTable.postId, post.id)).then(r => r.length);
  const myReactionRow = await db.select().from(postReactionsTable)
    .where(and(eq(postReactionsTable.postId, post.id), eq(postReactionsTable.userId, userId)))
    .then(r => r[0]);

  const reactions = (post.reactions as Record<string, number>) ?? { like: 0, fire: 0, heart: 0, insightful: 0 };

  return {
    id: post.id,
    authorId: post.authorId,
    authorName: profile?.fullName ?? "Unknown",
    authorPhoto: profile?.photoUrl ?? null,
    authorCollege: profile?.college ?? null,
    type: post.type,
    content: post.content,
    linkUrl: post.linkUrl ?? null,
    hashtags: post.hashtags ?? [],
    reactions: {
      like: reactions.like ?? 0,
      fire: reactions.fire ?? 0,
      heart: reactions.heart ?? 0,
      insightful: reactions.insightful ?? 0,
    },
    myReaction: myReactionRow?.emoji ?? null,
    commentCount,
    isPinned: post.isPinned,
    isHidden: post.isHidden,
    createdAt: post.createdAt.toISOString(),
  };
}

router.get("/posts", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const qp = ListPostsQueryParams.safeParse(req.query);
  const params = qp.success ? qp.data : {};

  let query = db.select().from(postsTable).where(eq(postsTable.isHidden, false)).orderBy(desc(postsTable.isPinned), desc(postsTable.createdAt));

  let posts = await query;

  if (params.type) {
    posts = posts.filter(p => p.type === params.type);
  }
  if (params.hashtag) {
    posts = posts.filter(p => p.hashtags?.includes(params.hashtag!));
  }

  const formatted = await Promise.all(posts.map(p => formatPost(p, userId)));
  res.json(formatted);
});

router.post("/posts", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [post] = await db
    .insert(postsTable)
    .values({
      authorId: userId,
      type: parsed.data.type,
      content: parsed.data.content,
      linkUrl: parsed.data.linkUrl,
      hashtags: parsed.data.hashtags ?? [],
    })
    .returning();

  res.status(201).json(await formatPost(post, userId));
});

router.get("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const params = GetPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, params.data.id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(await formatPost(post, userId));
});

router.patch("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const params = UpdatePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(postsTable).where(eq(postsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const userRole = req.session!.role as string;
  if (existing.authorId !== userId && userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updated] = await db
    .update(postsTable)
    .set(parsed.data)
    .where(eq(postsTable.id, params.data.id))
    .returning();

  res.json(await formatPost(updated, userId));
});

router.delete("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const params = DeletePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db.select().from(postsTable).where(eq(postsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const userRole = req.session!.role as string;
  if (existing.authorId !== userId && userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(postsTable).where(eq(postsTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/posts/:id/react", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const params = ReactToPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = ReactToPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, params.data.id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const emoji = parsed.data.emoji;
  const [existing] = await db.select().from(postReactionsTable)
    .where(and(eq(postReactionsTable.postId, post.id), eq(postReactionsTable.userId, userId)));

  const reactions = { ...(post.reactions as Record<string, number>) };

  if (existing) {
    if (existing.emoji === emoji) {
      // Toggle off
      await db.delete(postReactionsTable).where(eq(postReactionsTable.id, existing.id));
      reactions[emoji] = Math.max(0, (reactions[emoji] ?? 0) - 1);
    } else {
      // Switch reaction
      reactions[existing.emoji] = Math.max(0, (reactions[existing.emoji] ?? 0) - 1);
      reactions[emoji] = (reactions[emoji] ?? 0) + 1;
      await db.update(postReactionsTable).set({ emoji }).where(eq(postReactionsTable.id, existing.id));
    }
  } else {
    await db.insert(postReactionsTable).values({ postId: post.id, userId, emoji });
    reactions[emoji] = (reactions[emoji] ?? 0) + 1;
  }

  const [updated] = await db
    .update(postsTable)
    .set({ reactions })
    .where(eq(postsTable.id, post.id))
    .returning();

  res.json(await formatPost(updated, userId));
});

export default router;
