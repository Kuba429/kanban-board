import { atom } from "jotai";
import { v4 } from "uuid";
import {
	type Item as ItemPrisma,
	type Column as ColumnPrisma,
} from "@prisma/client";
import Column from "../components/Column";

//const columnWithItems = Prisma.validator<Prisma.ColumnArgs>()({
//	include: { items: true },
//});
//export type Column = Prisma.ColumnGetPayload<typeof columnWithItems>;

export interface Item extends ItemPrisma {
	isLocalOnly?: boolean;
}
export interface Column extends ColumnPrisma {
	items: Item[];
}

export const columnsAtom = atom<Column[]>([]);
export const addColumnAtom = atom(null, (get, set, update: Column) => {
	const columns = [...get(columnsAtom)];
	columns.push(update);
	set(columnsAtom, columns);
});
export const deleteColumnAtom = atom(null, (get, set, update: Column["id"]) => {
	const columns = get(columnsAtom).filter((c) => c.id !== update);
	set(columnsAtom, columns);
});
export const updateItemAtom = atom(
	null,
	(
		get,
		set,
		{
			title,
			content,
			id,
			newId,
		}: {
			title: string;
			content: string | null;
			id: string;
			newId?: string;
		}
	) => {
		const cols = [...get(columnsAtom)];
		const itemToChange = cols
			.map((c) => c.items)
			.flat()
			.find((i) => i.id === id);
		if (!itemToChange) return;
		itemToChange.title = title;
		itemToChange.content = content ?? "";
		itemToChange.isLocalOnly = false;
		// for newly created items; their ids are local before syncing with db so they have to change after syncing
		if (newId) {
			itemToChange.id = newId;
		}
		set(columnsAtom, cols);
	}
);

export const addItemAtom = atom(null, (get, set, columnId: string) => {
	const columns = [...get(columnsAtom)];
	columns
		.find((c) => c.id === columnId)
		?.items.push({
			id: v4(),
			columnId: columnId,
			isLocalOnly: true,
			title: "Untitled",
		} as Item);
	set(columnsAtom, columns);
});

export const deleteItemAtom = atom(null, (get, set, itemData: Item) => {
	const columns = [...get(columnsAtom)];
	const parentCol = columns.find((c) => c.id === itemData.columnId);
	const itemIdx = parentCol?.items.findIndex((i) => i.id === itemData.id);
	if (!parentCol || itemIdx === undefined) {
		console.log(itemIdx);
		return;
	}
	const a = parentCol.items.splice(itemIdx, 1);
	console.log(a);
	set(columnsAtom, columns);
});

export const columnCountAtom = atom((get) => get(columnsAtom).length);
