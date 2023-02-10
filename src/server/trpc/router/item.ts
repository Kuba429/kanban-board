import { TRPCError } from "@trpc/server";
import cuid from "cuid";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const itemRouter = router({
	deleteItem: publicProcedure
		.input(z.object({ itemId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.prisma.item.delete({ where: { id: input.itemId } });
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
