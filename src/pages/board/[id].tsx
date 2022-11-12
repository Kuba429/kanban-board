import { useAtom } from "jotai";
import { type NextPage } from "next";
import { type FC, useEffect, useRef } from "react";
import {
	columnsAtom,
	type ColumnType as ColumnType,
} from "../../stores/columns";
import { Item, ItemModal } from "../../components/Item";
import { MdDragIndicator } from "react-icons/md";
import { modalAtom } from "../../stores/modal";
import Layout from "../../components/Layout";

const Home: NextPage = () => {
	const [itemModal] = useAtom(modalAtom);
	return (
		<Layout>
			<Board />
			{itemModal && <ItemModal modalState={itemModal} />}
		</Layout>
	);
};

export default Home;
// store positions of all columns to figure out which one is the closest to dragged element
export const columnPositions: Map<
	string,
	{ x: number; y: number; width: number; height: number }
> = new Map();
const Board = () => {
	const [columns] = useAtom(columnsAtom);
	return (
		<div className="flex h-full w-fit min-w-full select-none items-center justify-center gap-gap overflow-scroll">
			{columns.map((x) => (
				<Column key={x.id} column={x} />
			))}
		</div>
	);
};
const Column: FC<{ column: ColumnType }> = ({ column }) => {
	const columnRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const rect = columnRef.current?.getBoundingClientRect();
		if (!rect) return;
		const { x, y, width, height } = rect;
		columnPositions.set(column.id, { x, y, width, height });
	}, [column.id]);
	return (
		<div className="flex h-4/5 w-72 flex-col rounded-xl border border-white/25 bg-black-800 text-white">
			<div className="flex items-center justify-between p-3">
				<h2 className="text-xl">{column.name}</h2>
				<div className="drag-handle">
					{
						// TODO make columns sortable too
					}
					<MdDragIndicator />
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
