import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const mainRouter = router({
	hello: publicProcedure
		.input(z.object({ text: z.string().nullish() }).nullish())
		.query(({ input }) => {
			return {
				greeting: `Hello ${input?.text ?? "world"}`,
			};
		}),
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
					columns: { include: { items: true } },
					users: true,
				},
			});
		}),
});
