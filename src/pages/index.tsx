import { atom, useAtom } from "jotai";
import { animated, useSpring } from "@react-spring/web";
import { type NextPage } from "next";
import { FC, useEffect, useRef } from "react";
import { v4 } from "uuid";
import { useDrag, useGesture, useHover } from "@use-gesture/react";

const Home: NextPage = () => {
	return <BoardContainer />;
};

export default Home;
interface ItemType {
	data: string;
	id: string;
}
interface BoardType {
	name: string;
	id: string;
	items: ItemType[];
}
const boardsAtom = atom<BoardType[]>(() => [
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
// store positions of all boards to figure out which one is the closest to dragged element
const boardPositions: Map<
	string,
	{ x: number; y: number; width: number; height: number }
> = new Map();
const BoardContainer = () => {
	const [boards, _setBoards] = useAtom(boardsAtom);
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
		const { x, y, width, height } =
			boardRef.current?.getBoundingClientRect()!;
		boardPositions.set(board.name, { x, y, width, height });
	}, []);
	return (
		<div
			ref={boardRef}
			className="m-12 flex h-4/5 w-52 flex-col items-center gap-2 bg-blue-800 text-white"
		>
			<h2 className="text-center text-xl">{board.name}</h2>
			{board.items.map((x) => (
				<Item key={x.id} item={x} />
			))}
		</div>
	);
};
const Item: FC<{ item: ItemType }> = ({ item }) => {
	const [style, api] = useSpring(() => ({ to: { x: 0, y: 0 } }));
	const itemRef = useRef<HTMLDivElement>(null);
	const bind = useDrag((state) => {
		if (state.down) {
			const [x, y] = state.movement;
			api.start({ to: { x, y: y }, config: { duration: 20 } });
		} else {
			let { x, y, width, height } =
				itemRef.current?.getBoundingClientRect()!;
			x += width / 2;
			width = 1;
			boardPositions.forEach((b, idx) => {
				if (
					// collision detection
					x < b.x + b.width &&
					x + width > b.x &&
					y < b.y + b.height &&
					y + height > b.y
				) {
					console.log(idx);
				}
			});
			api.start({ to: { x: 0, y: 0 }, config: { duration: 200 } });
		}
	});
	return (
		<animated.div
			style={style}
			ref={itemRef}
			className="w-11/12 bg-blue-600 p-4 text-center"
			{...bind()}
		>
			{item.data}
		</animated.div>
	);
};
