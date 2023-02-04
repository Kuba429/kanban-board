import { router } from "../trpc";
import type { GetInferenceHelpers } from "@trpc/server";
import { boardRouter } from "./board";
import { itemRouter } from "./item";
import { columnRouter } from "./column";

export const appRouter = router({
	board: boardRouter,
	item: itemRouter,
	column: columnRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type boards =
	GetInferenceHelpers<AppRouter>["board"]["getBoards"]["output"];
export type board =
	GetInferenceHelpers<AppRouter>["board"]["getBoard"]["output"];
