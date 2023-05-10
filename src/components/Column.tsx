import { useAtom } from "jotai";
import { type FC, useEffect, useRef } from "react";
import { BiMessageSquareAdd, BiTrash } from "react-icons/bi";
import {
	addItemAtom,
	columnCountAtom,
	deleteColumnAtom,
	type Column as ColumnType,
} from "../stores/columns";
import { Item } from "./Item";
import { columnsScrollAtom } from "../stores/scrolls";
import { trpc } from "../utils/trpc";
import { confirmModalAtom } from "./ConfirmModal";

const Column: FC<{ column: ColumnType }> = ({ column }) => {
	const deleteColumnMutation = trpc.column.deleteColumn.useMutation();
	const [, deleteColumn] = useAtom(deleteColumnAtom);
	const columnRef = useRef<HTMLDivElement>(null);
	const [, addItem] = useAtom(addItemAtom);
	const [columnCount] = useAtom(columnCountAtom);
	const [columnsScroll] = useAtom(columnsScrollAtom);

	useEffect(() => {
		if (!columnRef.current) {
			columnPositions.delete(column.id);
			return;
		}
		const rect = columnRef.current.getBoundingClientRect();
		const { x, y, width, height } = rect;
		columnPositions.set(column.id, { x, y, width, height });
	}, [columnsScroll, column, columnRef, columnCount]);

	const [, confirmWithModal] = useAtom(confirmModalAtom);
	const handleDelete = async () => {
		confirmWithModal({
			content: "This column and all of its items will be deleted forever",
			header: "Are you sure?",
			callback: () => {
				deleteColumn(column.id);
				deleteColumnMutation.mutate({ columnId: column.id });
			},
		});
	};
	return (
		<div
			data-testid="column"
			className="flex h-4/5 w-72 flex-col rounded-xl border border-white/25 bg-black-800 text-white"
		>
			<div className="flex items-center justify-between p-3">
				<h2 className="flex-grow text-xl">{column.title}</h2>
				<div
					onClick={handleDelete}
					data-testid="delete-column-button"
					className="btn-icon"
				>
					<BiTrash />
				</div>
				<div
					onClick={() => addItem(column.id)}
					data-testid="add-item-button"
					className="btn-icon"
				>
					<BiMessageSquareAdd />
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
