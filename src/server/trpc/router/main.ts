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
					columns: {
						include: { items: { orderBy: { index: "asc" } } },
					},
					users: true,
				},
			});
		}),
	moveItem: publicProcedure
		.input(
			z.object({
				itemId: z.string(),
				newColumnId: z.string(),
				oldColumnId: z.string(),
				indexesOldColumn: z.array(
					z.object({
						id: z.string(),
						index: z.number(),
					})
				),
				indexesNewColumn: z.array(
					z.object({
						id: z.string(),
						index: z.number(),
					})
				),
			})
		)
		.mutation(({ ctx, input }) => {
			// TODO update indexes
			ctx.prisma.$transaction([
				ctx.prisma.column.update({
					where: { id: input.oldColumnId },
					data: { items: { disconnect: { id: input.itemId } } },
				}),
				ctx.prisma.column.update({
					where: { id: input.newColumnId },
					data: { items: { connect: { id: input.itemId } } },
				}),
			]);
			return;
		}),
});
