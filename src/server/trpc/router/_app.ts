import { router } from "../trpc";
import type { GetInferenceHelpers } from "@trpc/server";
import { mainRouter } from "./main";

export const appRouter = router({
	main: mainRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type boards =
	GetInferenceHelpers<AppRouter>["main"]["getBoards"]["output"];
export type board =
	GetInferenceHelpers<AppRouter>["main"]["getBoard"]["output"];
