import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import deepseekRouter from "./routers/deepseek";
import ollamaRouter from "./routers/ollama";
import { dbRouter } from "./routers/db";
import { actionRouter } from "./routers/action";
import "~/utils/productivityTimer";
import { costRouter } from "./routers/costs";
import CostAssistant from "~/components/costAssistant";
import { costAssistantRouter } from "./routers/costAssistant";
import GPTRouter from "./routers/chatgpt";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  deepseek: deepseekRouter,
  ollama: ollamaRouter,
  database: dbRouter,
  action: actionRouter,
  cost: costRouter,
  costAssistant: costAssistantRouter,
  chatGPT: GPTRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
