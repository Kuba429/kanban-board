import { atom } from "jotai";
import { Prisma } from "@prisma/client";

const columnWithItems = Prisma.validator<Prisma.ColumnArgs>()({
	include: { items: true },
});
export type Column = Prisma.ColumnGetPayload<typeof columnWithItems>;

export const columnsAtom = atom<Column[]>([]);

export const moveItemAtom = atom(
	null,
	(
		get,
		set,

		{
			itemId,
			parentId,
			targetId,
			newIndex,
		}: {
			itemId: string;
			parentId: string;
			targetId: string;
			newIndex: number;
		}
	) => {
		const state = get(columnsAtom);
		const newColumns = [...state];
		const parentColumn = newColumns.find((b) => b.id === parentId);
		const targetColumn = newColumns.find((b) => b.id === targetId);

		const itemIndex =
			parentColumn?.items.findIndex((i) => i.id === itemId) ?? -1;
		if (itemIndex < 0 || !parentColumn || !targetColumn) return;
		const it = parentColumn.items.splice(itemIndex, 1)[0];
		if (!it) return;
		targetColumn.items.splice(newIndex, 0, it);
		set(columnsAtom, newColumns);
	}
);
