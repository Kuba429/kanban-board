import { atom } from "jotai";
import { Prisma } from "@prisma/client";

const columnWithItems = Prisma.validator<Prisma.ColumnArgs>()({
	include: { items: true },
});
export type Column = Prisma.ColumnGetPayload<typeof columnWithItems>;

export const columnsAtom = atom<Column[]>([]);

export const updateItemAtom = atom(
	null,
	(
		get,
		set,
		{
			title,
			content,
			id,
		}: {
			title: string;
			content: string;
			id: string;
		}
	) => {
		const cols = [...get(columnsAtom)];
		const itemToChange = cols
			.map((c) => c.items)
			.flat()
			.find((i) => i.id === id);
		if (!itemToChange) return;
		itemToChange.title = title;
		itemToChange.content = content;
		set(columnsAtom, cols);
	}
);
