import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router } from "../trpc";
import { publicProcedure } from "../trpc";

export const boardRouter = router({
	getBoards: publicProcedure.query(({ ctx }) => {
		const email = ctx.session?.user?.email as string;
		return ctx.prisma.board.findMany({
			where: {
				OR: [
					{ users: { hasSome: email } },
					{ createdBy: { equals: email } },
				],
			},
			select: {
				id: true,
				title: true,
			},
		});
	}),

	getBoard: publicProcedure
		.input(z.object({ boardId: z.string() }))
		.query(({ ctx, input }) => {
			const email = ctx.session?.user?.email as string;
			return ctx.prisma.board.findFirst({
				where: {
					id: { equals: input.boardId },
					OR: [
						{ users: { hasSome: email } },
						{ createdBy: { equals: email } },
					],
				},
				select: {
					title: true,
					columns: {
						include: { items: { orderBy: { index: "asc" } } },
					},
					users: true,
				},
			});
		}),

	createBoard: publicProcedure
		.input(z.object({ name: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const email = ctx.session?.user?.email;
			if (!email) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Please sign in",
				});
			}
			const res = await ctx.prisma.board.create({
				data: { createdBy: email, title: input.name },
			});

			return { id: res.id, title: res.title };
		}),
});
