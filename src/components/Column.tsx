import { useAtom } from "jotai";
import { type FC, useEffect, useRef } from "react";
import { MdDragIndicator } from "react-icons/md";
import { BiMessageSquareAdd } from "react-icons/bi";
import { addItemAtom, Column } from "../stores/columns";
import { Item } from "./Item";

const Column: FC<{ column: Column }> = ({ column }) => {
	const columnRef = useRef<HTMLDivElement>(null);
	const [, addItem] = useAtom(addItemAtom);
	useEffect(() => {
		const rect = columnRef.current?.getBoundingClientRect();
		if (!rect) return;
		const { x, y, width, height } = rect;
		columnPositions.set(column.id, { x, y, width, height });
	}, [column.id]);
	return (
		<div className="flex h-4/5 w-72 flex-col rounded-xl border border-white/25 bg-black-800 text-white">
			<div className="flex items-center justify-between p-3">
				<h2 className="text-xl">{column.title}</h2>
				<div className="drag-handle">
					<BiMessageSquareAdd onClick={() => addItem(column.id)} />
				</div>
			</div>
			<div
				className="flex w-full basis-[100%] flex-col items-center gap-gap rounded-b-xl bg-black-900 py-gap"
				ref={columnRef}
			>
				{column.items.map((x) => (
					<Item key={x.id} item={x} parentId={column.id} />
				))}
			</div>
		</div>
	);
};
export default Column;

// store positions of all columns to figure out which one is the closest to dragged element
export const columnPositions: Map<
	string,
	{ x: number; y: number; width: number; height: number }
> = new Map();
