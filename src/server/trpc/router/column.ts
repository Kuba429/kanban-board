import { TRPCError } from "@trpc/server";
import cuid from "cuid";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const columnRouter = router({
	createColumn: publicProcedure
		.input(z.object({ boardId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const email = ctx.session?.user?.email;
			const newId = cuid();
			if (!email) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Please sign in",
				});
			}
			return (
				await ctx.prisma.board.update({
					where: { id: input.boardId },
					data: { columns: { create: { id: newId } } },
					select: { columns: { where: { id: newId } } },
				})
			).columns[0];
		}),
});
