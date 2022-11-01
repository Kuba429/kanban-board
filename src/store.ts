import { atom } from "jotai";
import { v4 } from "uuid";

export interface ItemType {
	data: string;
	id: string;
}
export interface BoardType {
	name: string;
	id: string;
	items: ItemType[];
}
export const boardsAtom = atom<BoardType[]>([
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
		}: { itemId: string; parentId: string; targetId: string }
	) => {
		const state = [...get(boardsAtom)];
		const parentBoard = state.find((b) => b.id === parentId);
		const targetBoard = state.find((b) => b.id === targetId);

		const itemIndex =
			parentBoard?.items.findIndex((i) => i.id === itemId) ?? -1;
		if (itemIndex < 0 || !parentBoard || !targetBoard) return;
		const it = parentBoard.items.splice(itemIndex, 1)[0];
		if (!it) return;
		targetBoard.items.push(it);
		set(boardsAtom, state);
	}
);
