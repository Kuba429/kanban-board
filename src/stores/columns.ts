import { atom } from "jotai";
import { v4 } from "uuid";

export interface ItemType {
	data: string;
	id: string;
}
export interface ColumnType {
	name: string;
	id: string;
	items: ItemType[];
}
export const columnsAtom = atom<ColumnType[]>([
	{
		name: "a",
		id: v4(),
		items: [
			{ data: "costam", id: v4() },
			{ data: "eloelo320", id: v4() },
		],
	},
	{ name: "b", id: v4(), items: [{ data: "cosinnego", id: v4() }] },
]);

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
		const state = [...get(columnsAtom)];
		const parentColumn = state.find((b) => b.id === parentId);
		const targetColumn = state.find((b) => b.id === targetId);

		const itemIndex =
			parentColumn?.items.findIndex((i) => i.id === itemId) ?? -1;
		if (itemIndex < 0 || !parentColumn || !targetColumn) return;
		const it = parentColumn.items.splice(itemIndex, 1)[0];
		if (!it) return;
		targetColumn.items.splice(newIndex, 0, it);
		set(columnsAtom, state);
	}
);
