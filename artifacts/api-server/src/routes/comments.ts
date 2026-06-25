import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { db, commentsTable, profilesTable } from "@workspace/db";
import {
  ListCommentsParams,
  CreateCommentParams,
  DeleteCommentParams,
  CreateCommentBody,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

async function formatComment(comment: typeof commentsTable.$inferSelect) {
  const profile = await db.select().from(profilesTable).where(eq(profilesTable.userId, comment.authorId)).then(r => r[0]);
  return {
    id: comment.id,
    postId: comment.postId,
    authorId: comment.authorId,
    authorName: profile?.fullName ?? "Unknown",
    authorPhoto: profile?.photoUrl ?? null,
    content: comment.content,
    parentCommentId: comment.parentCommentId ?? null,
    createdAt: comment.createdAt.toISOString(),
  };
}

router.get("/posts/:postId/comments", requireAuth, async (req, res): Promise<void> => {
  const params = ListCommentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const comments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.postId, params.data.postId))
    .orderBy(asc(commentsTable.createdAt));

  const formatted = await Promise.all(comments.map(formatComment));
  res.json(formatted);
});

router.post("/posts/:postId/comments", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const params = CreateCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateCommentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [comment] = await db
    .insert(commentsTable)
    .values({
      postId: params.data.postId,
      authorId: userId,
      content: parsed.data.content,
      parentCommentId: parsed.data.parentCommentId ?? null,
    })
    .returning();

  res.status(201).json(await formatComment(comment));
});

router.delete("/comments/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const params = DeleteCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db.select().from(commentsTable).where(eq(commentsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  const userRole = req.session!.role as string;
  if (existing.authorId !== userId && userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(commentsTable).where(eq(commentsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
