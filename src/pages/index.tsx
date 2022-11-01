import { useAtom } from "jotai";
import { animated, useSpring } from "@react-spring/web";
import { type NextPage } from "next";
import { type FC, useEffect, useRef } from "react";
import { useDrag } from "@use-gesture/react";
import {
	boardsAtom,
	type BoardType,
	type ItemType,
	moveItemAtom,
} from "../store";
import { sleep } from "../utils/sleep";

const Home: NextPage = () => {
	return <BoardContainer />;
};

export default Home;
// store positions of all boards to figure out which one is the closest to dragged element
const boardPositions: Map<
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
const Item: FC<{ item: ItemType; parentId: string }> = ({ item, parentId }) => {
	const [, moveItem] = useAtom(moveItemAtom);
	const [style, api] = useSpring(() => ({ to: { x: 0, y: 0, top: 0 } }));
	const itemRef = useRef<HTMLDivElement>(null);
	const bind = useDrag(async (state) => {
		if (state.down) {
			const [x, y] = state.movement;
			api.start({ to: { x, y: y }, config: { duration: 20 } });
		} else {
			const rect = itemRef.current?.getBoundingClientRect();
			if (!rect) return;
			const { x, y, width, height } = rect;
			let centerX = x; // only check if center of dragged item collided with a board
			const centerWidth = 20;
			centerX += width / 2 - centerWidth / 2;

			for (const i of boardPositions) {
				const [idx, b] = i;
				if (
					centerX < b.x + b.width &&
					centerX + centerWidth > b.x &&
					y < b.y + b.height &&
					y + height > b.y
				) {
					// collision detected
					console.log("collision");
					const parent = boardPositions.get(parentId);
					if (!parent) return;
					const duration = 300;
					api.start({
						to: { x: b.x - parent.x, y: 0 },
						config: { duration },
					});
					// TODO figure out ys
					// move the item and set state
					await sleep(duration);
					moveItem({ itemId: item.id, targetId: idx, parentId });
					return;
				}
				// no collision, get back
				api.start({
					to: { x: 0, y: 0 },
					config: { duration: 200 },
				});
			}
		}
	});
	return (
		<animated.div
			style={style}
			ref={itemRef}
			className="w-11/12 touch-none bg-blue-600 p-4 text-center"
			{...bind()}
		>
			{item.data}
		</animated.div>
	);
};
