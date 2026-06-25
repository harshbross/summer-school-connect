import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profilesRouter from "./profiles";
import postsRouter from "./posts";
import commentsRouter from "./comments";
import eventsRouter from "./events";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profilesRouter);
router.use(postsRouter);
router.use(commentsRouter);
router.use(eventsRouter);
router.use(dashboardRouter);
router.use(adminRouter);

export default router;
