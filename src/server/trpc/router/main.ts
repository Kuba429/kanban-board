import { TRPCError } from "@trpc/server";
import cuid from "cuid";
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
				newIndexes: z.array(
					z.object({
						id: z.string(),
						index: z.number(),
					})
				),
			})
		)
		.mutation(({ ctx, input }) => {
			ctx.prisma.$transaction([
				ctx.prisma.column.update({
					where: { id: input.oldColumnId },
					data: { items: { disconnect: { id: input.itemId } } },
				}),
				ctx.prisma.column.update({
					where: { id: input.newColumnId },
					data: { items: { connect: { id: input.itemId } } },
				}),
				...input.newIndexes.map((x) =>
					ctx.prisma.item.update({
						where: { id: x.id },
						data: { index: x.index },
					})
				),
			]);
			return;
		}),
	updateItem: publicProcedure
		.input(
			z.object({
				title: z.string(),
				content: z.string(),
				id: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.prisma.item.update({
				where: { id: input.id },
				data: { title: input.title, content: input.content },
			});
		}),
	createItem: publicProcedure
		.input(
			z.object({
				title: z.string(),
				content: z.string(),
				columnId: z.string(),
				index: z.number(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const createdBy = ctx.session?.user?.email;
			if (!createdBy) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Please sign in",
				});
			}
			const newId = cuid();
			return (
				await ctx.prisma.column.update({
					where: { id: input.columnId },
					data: {
						items: {
							create: [
								{
									id: newId,
									index: input.index,
									content: input.content,
									title: input.title,
								},
							],
						},
					},
					select: { items: { where: { id: newId } } },
				})
			).items[0];
		}),
});
