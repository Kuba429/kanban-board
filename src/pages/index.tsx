import { useAtom } from "jotai";
import { type NextPage } from "next";
import { type FC, useEffect, useRef } from "react";
import { boardsAtom, type BoardType } from "../store";
import { Item } from "../components/Item";

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
		<div className="flex h-full w-fit min-w-full items-center justify-center gap-5 bg-blue-300">
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
		<div className="h-4/5 w-52 bg-blue-800 text-white">
			<h2 className="text-center text-xl">{board.name}</h2>
			<div
				className="flex h-full w-full flex-col items-center gap-5 bg-blue-400 py-5"
				ref={boardRef}
			>
				{board.items.map((x) => (
					<Item key={x.id} item={x} parentId={board.id} />
				))}
			</div>
		</div>
	);
};
