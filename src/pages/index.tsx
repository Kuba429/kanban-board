import { useAtom } from "jotai";
import { type NextPage } from "next";
import { type FC, useEffect, useRef } from "react";
import { boardsAtom, type BoardType } from "../store";
import { Item } from "../components/Item";
import { MdDragIndicator } from "react-icons/md";

const Home: NextPage = () => {
	return <BoardContainer />;
};

export default Home;
// store positions of all boards to figure out which one is the closest to dragged element
export const boardPositions: Map<
	string,
	{ x: number; y: number; width: number; height: number }
> = new Map();
const BoardContainer = () => {
	const [boards] = useAtom(boardsAtom);
	return (
		<div className="flex h-full w-fit min-w-full select-none items-center justify-center gap-gap bg-black-800">
			{boards.map((x) => (
				<Board key={x.id} board={x} />
			))}
		</div>
	);
};
const Board: FC<{ board: BoardType }> = ({ board }) => {
	const boardRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const rect = boardRef.current?.getBoundingClientRect();
		if (!rect) return;
		const { x, y, width, height } = rect;
		boardPositions.set(board.id, { x, y, width, height });
	}, [board.id]);
	return (
		<div className="flex h-4/5 w-72 flex-col rounded-xl border border-white/25 bg-black-800 text-white">
			<div className="flex items-center justify-between p-3">
				<h2 className="text-xl">{board.name}</h2>
				<div className="drag-handle">
					{
						// TODO make boards sortable too
					}
					<MdDragIndicator />
				</div>
			</div>
			<div
				className="flex w-full basis-[100%] flex-col items-center gap-gap rounded-b-xl bg-black-900 py-gap"
				ref={boardRef}
			>
				{board.items.map((x) => (
					<Item key={x.id} item={x} parentId={board.id} />
				))}
			</div>
		</div>
	);
};
